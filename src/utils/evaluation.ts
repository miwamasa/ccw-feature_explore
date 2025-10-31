import {
  TreeNode,
  Component,
  Constraint,
  PastCase,
  EvaluationResult,
} from '../types';

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

// 統合評価関数
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
