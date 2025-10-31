import { Constraint, Component } from '../types';

// Z3インスタンスをキャッシュ
let z3Instance: any = null;

// Z3を初期化（動的インポート）
export async function initZ3() {
  if (!z3Instance) {
    try {
      // 動的インポートでz3-solverを読み込む
      const Z3Module = await import('z3-solver');
      z3Instance = await Z3Module.init();
    } catch (error) {
      console.error('Z3初期化エラー:', error);
      throw error;
    }
  }
  return z3Instance;
}

// Z3を使って制約を評価
export async function evaluateConstraintsWithZ3(
  selectedComponentIds: Set<string>,
  _allComponentIds: string[],
  constraints: Constraint[]
): Promise<{ constraint: Constraint; message: string }[]> {
  const violations: { constraint: Constraint; message: string }[] = [];

  try {
    const { Context } = await initZ3();
    const ctx = Context('main');

    // 各制約を個別に評価
    for (const constraint of constraints) {
      // 制約に関連する部品が選択されているかチェック
      const relevantComponentsSelected = constraint.componentIds.some(id =>
        selectedComponentIds.has(id)
      );

      if (!relevantComponentsSelected) {
        continue;
      }

      // Z3制約がある場合はZ3で評価
      if (constraint.z3Constraint) {
        // 新しいソルバーを作成
        const solver = new ctx.Solver();

        // 各部品の選択状態を変数として定義
        const componentVars = new Map<string, any>();
        constraint.z3Constraint.components.forEach(id => {
          const boolVar = ctx.Bool.const(id);
          componentVars.set(id, boolVar);

          // 選択状態に応じてアサート
          if (selectedComponentIds.has(id)) {
            solver.add(boolVar);
          } else {
            solver.add(boolVar.not());
          }
        });

        // 制約式を構築して追加
        const z3Expr = buildZ3Expression(
          ctx,
          componentVars,
          constraint.z3Constraint.expr,
          constraint.z3Constraint.components
        );

        solver.add(z3Expr);

        // 充足可能性をチェック
        const result = await solver.check();

        // unsatの場合は制約違反
        if (result === 'unsat') {
          violations.push({
            constraint,
            message: constraint.description,
          });
        }
      } else {
        // 従来のvalidate関数を使用
        const isValid = constraint.validate(selectedComponentIds);
        if (!isValid) {
          violations.push({
            constraint,
            message: constraint.description,
          });
        }
      }
    }
  } catch (error) {
    console.error('Z3 evaluation error:', error);
    // Z3エラー時は従来の方法にフォールバック
    return evaluateConstraintsFallback(selectedComponentIds, constraints);
  }

  return violations;
}

// Z3式を構築
function buildZ3Expression(ctx: any, componentVars: Map<string, any>, expr: string, components: string[]): any {
  const vars = components.map(id => componentVars.get(id)!);

  switch (expr) {
    case 'and':
      return ctx.And(...vars);
    case 'or':
      return ctx.Or(...vars);
    case 'not':
      // notは単一の変数に対して適用
      if (components.length === 1) {
        return ctx.Not(vars[0]);
      }
      // 複数の場合はNAND (not all)
      return ctx.Not(ctx.And(...vars));
    case 'implies':
      // A implies B: A -> B = not A or B
      if (components.length >= 2) {
        return ctx.Implies(vars[0], vars[1]);
      }
      return vars[0];
    case 'xor':
      if (components.length === 2) {
        return ctx.Xor(vars[0], vars[1]);
      }
      // 複数の場合は最初の2つのXOR
      return ctx.Xor(vars[0], vars[1]);
    default:
      return ctx.And(...vars);
  }
}

// フォールバック：従来のvalidate関数を使用
function evaluateConstraintsFallback(
  selectedComponentIds: Set<string>,
  constraints: Constraint[]
): { constraint: Constraint; message: string }[] {
  const violations: { constraint: Constraint; message: string }[] = [];

  constraints.forEach(constraint => {
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

// 全ての部品IDを取得するヘルパー関数
export function getAllComponentIds(components: Component[]): string[] {
  return components.map(c => c.id);
}
