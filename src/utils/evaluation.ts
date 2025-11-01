import {
  TreeNode,
  Component,
  Constraint,
  PastCase,
  EvaluationResult,
} from '../types';
import { evaluateConstraintsWithZ3, getAllComponentIds } from './z3Evaluation';

// 制約式を生成
export function generateConstraintExpressions(
  rootNode: TreeNode,
  components: Component[],
  constraints: Constraint[]
): {
  selectedComponents: { id: string; name: string }[];
  logicalConstraints: string[];
  arithmeticConstraints: string[];
  z3Code: string;
} {
  const selectedComponentIds = collectSelectedComponentIds(rootNode);

  // 選択された部品リスト
  const selectedComponents = Array.from(selectedComponentIds).map(id => {
    const component = components.find(c => c.id === id);
    return {
      id,
      name: component?.name || id
    };
  });

  // 論理制約を式として表現
  const logicalConstraints: string[] = [];
  constraints.forEach(constraint => {
    if (constraint.z3Constraint) {
      const { expr, components: compIds } = constraint.z3Constraint;
      const compNames = compIds.map(id => {
        const comp = components.find(c => c.id === id);
        return comp?.name || id;
      });

      let exprStr = '';
      switch (expr) {
        case 'not':
          exprStr = `NOT (${compNames.join(' AND ')})`;
          break;
        case 'and':
          exprStr = `${compNames.join(' AND ')}`;
          break;
        case 'or':
          exprStr = `${compNames.join(' OR ')}`;
          break;
        case 'implies':
          exprStr = `${compNames[0]} IMPLIES ${compNames[1]}`;
          break;
        case 'xor':
          exprStr = `${compNames[0]} XOR ${compNames[1]}`;
          break;
      }

      logicalConstraints.push(`${constraint.name}: ${exprStr}`);
    }
  });

  // 算術制約を生成（価格とリスク）
  const { total: totalPrice } = calculateTotalPrice(selectedComponentIds, components);
  const { score: riskScore } = calculateRiskScore(selectedComponentIds, []);

  const arithmeticConstraints: string[] = [
    `total_price = ${Math.round(totalPrice)}`,
    `expected_failure_cost = ${riskScore * 1000}  // リスクスコア × 1000`,
  ];

  // Z3擬似コードを生成
  const z3Code = generateZ3PseudoCode(selectedComponents, arithmeticConstraints, constraints);

  return {
    selectedComponents,
    logicalConstraints,
    arithmeticConstraints,
    z3Code
  };
}

// Z3擬似コードを生成
function generateZ3PseudoCode(
  selectedComponents: { id: string; name: string }[],
  arithmeticConstraints: string[],
  constraints: Constraint[]
): string {
  let code = '// Z3 Solver 制約式\n\n';

  // 変数定義
  code += '// 部品変数（Bool）\n';
  selectedComponents.forEach(comp => {
    code += `const ${comp.id} = Bool('${comp.id}');  // ${comp.name}\n`;
  });

  code += '\n// 算術変数（Int/Real）\n';
  code += 'const total_price = Int(\'total_price\');\n';
  code += 'const expected_failure_cost = Real(\'expected_failure_cost\');\n';

  // 論理制約
  code += '\n// 論理制約\n';
  const z3LogicalConstraints = constraints.filter(c => c.z3Constraint);
  if (z3LogicalConstraints.length > 0) {
    z3LogicalConstraints.forEach(constraint => {
      const { expr, components: compIds } = constraint.z3Constraint!;
      let z3Expr = '';

      switch (expr) {
        case 'not':
          if (compIds.length === 2) {
            z3Expr = `Not(And(${compIds.join(', ')}))`;
          } else {
            z3Expr = `Not(${compIds[0]})`;
          }
          break;
        case 'and':
          z3Expr = `And(${compIds.join(', ')})`;
          break;
        case 'or':
          z3Expr = `Or(${compIds.join(', ')})`;
          break;
        case 'implies':
          z3Expr = `Implies(${compIds[0]}, ${compIds[1]})`;
          break;
        case 'xor':
          z3Expr = `Xor(${compIds[0]}, ${compIds[1]})`;
          break;
      }

      code += `solver.add(${z3Expr});  // ${constraint.name}\n`;
    });
  } else {
    code += '// なし\n';
  }

  code += '\n// 算術制約\n';
  arithmeticConstraints.forEach(constraint => {
    code += `solver.add(${constraint});\n`;
  });

  code += '\n// ソルバー実行\n';
  code += 'const result = await solver.check();  // "sat" or "unsat"\n';

  return code;
}

// 木構造から選択された全ての部品IDを収集
export function collectSelectedComponentIds(node: TreeNode): Set<string> {
  const selected = new Set<string>();

  function traverse(n: TreeNode) {
    if (n.selectedComponentId) {
      selected.add(n.selectedComponentId);
    }
    n.children.forEach(traverse);
  }

  traverse(node);
  return selected;
}

// 価格を計算
export function calculateTotalPrice(
  selectedComponentIds: Set<string>,
  components: Component[]
): { total: number; breakdown: { componentId: string; componentName: string; price: number }[] } {
  let total = 0;
  const breakdown: { componentId: string; componentName: string; price: number }[] = [];

  selectedComponentIds.forEach(id => {
    const component = components.find(c => c.id === id);
    if (component) {
      const price = component.price || 0;
      total += price;
      breakdown.push({
        componentId: id,
        componentName: component.name,
        price,
      });
    }
  });

  return { total, breakdown };
}

// 制約を評価
export function evaluateConstraints(
  selectedComponentIds: Set<string>,
  constraints: Constraint[]
): { constraint: Constraint; message: string }[] {
  const violations: { constraint: Constraint; message: string }[] = [];

  constraints.forEach(constraint => {
    // 制約に関連する部品が選択されているかチェック
    const relevantComponentsSelected = constraint.componentIds.some(id =>
      selectedComponentIds.has(id)
    );

    if (relevantComponentsSelected) {
      const isValid = constraint.validate(selectedComponentIds);
      if (!isValid) {
        violations.push({
          constraint,
          message: constraint.description,
        });
      }
    }
  });

  return violations;
}

// リスクスコアを計算
export function calculateRiskScore(
  selectedComponentIds: Set<string>,
  pastCases: PastCase[]
): { score: number; relatedCases: PastCase[] } {
  const relatedCases: PastCase[] = [];
  let totalRisk = 0;
  let caseCount = 0;

  pastCases.forEach(pastCase => {
    // この事例が現在の選択に関連しているかチェック
    const isRelevant = pastCase.relatedComponentIds.every(id =>
      selectedComponentIds.has(id)
    );

    if (isRelevant && pastCase.relatedComponentIds.length > 0) {
      relatedCases.push(pastCase);
      if (pastCase.riskScore !== undefined) {
        totalRisk += pastCase.riskScore;
        caseCount++;
      }
    }
  });

  // 平均リスクスコアを計算（関連事例がなければ5=中程度のリスク）
  const averageRisk = caseCount > 0 ? totalRisk / caseCount : 5;

  return { score: Math.round(averageRisk * 10) / 10, relatedCases };
}

// 警告メッセージを生成
export function generateWarnings(
  selectedComponentIds: Set<string>,
  components: Component[]
): string[] {
  const warnings: string[] = [];

  // 価格が不明な部品がある場合
  selectedComponentIds.forEach(id => {
    const component = components.find(c => c.id === id);
    if (component && component.price === undefined) {
      warnings.push(`${component.name}の価格情報が不足しています`);
    }
  });

  // 選択されていない重要な部品がある場合
  const hasEngine = Array.from(selectedComponentIds).some(id =>
    components.find(c => c.id === id && c.category === 'engine')
  );
  const hasTransmission = Array.from(selectedComponentIds).some(id =>
    components.find(c => c.id === id && c.category === 'transmission')
  );

  if (!hasEngine) {
    warnings.push('エンジンが選択されていません');
  }
  if (!hasTransmission) {
    warnings.push('トランスミッションが選択されていません');
  }

  return warnings;
}

// 統合評価関数（Z3使用版）
export async function evaluateConfigurationWithZ3(
  rootNode: TreeNode,
  components: Component[],
  constraints: Constraint[],
  pastCases: PastCase[]
): Promise<EvaluationResult> {
  const selectedComponentIds = collectSelectedComponentIds(rootNode);
  const allComponentIds = getAllComponentIds(components);

  const { total, breakdown } = calculateTotalPrice(selectedComponentIds, components);
  const constraintViolations = await evaluateConstraintsWithZ3(
    selectedComponentIds,
    allComponentIds,
    constraints
  );
  const { score: riskScore, relatedCases } = calculateRiskScore(selectedComponentIds, pastCases);
  const warnings = generateWarnings(selectedComponentIds, components);

  return {
    totalPrice: total,
    priceBreakdown: breakdown,
    constraintViolations,
    riskScore,
    relatedCases,
    warnings,
  };
}

// 統合評価関数（従来版：Z3を使わない）
export function evaluateConfiguration(
  rootNode: TreeNode,
  components: Component[],
  constraints: Constraint[],
  pastCases: PastCase[]
): EvaluationResult {
  const selectedComponentIds = collectSelectedComponentIds(rootNode);

  const { total, breakdown } = calculateTotalPrice(selectedComponentIds, components);
  const constraintViolations = evaluateConstraints(selectedComponentIds, constraints);
  const { score: riskScore, relatedCases } = calculateRiskScore(selectedComponentIds, pastCases);
  const warnings = generateWarnings(selectedComponentIds, components);

  return {
    totalPrice: total,
    priceBreakdown: breakdown,
    constraintViolations,
    riskScore,
    relatedCases,
    warnings,
  };
}
