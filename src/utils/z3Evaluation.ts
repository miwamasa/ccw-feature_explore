import { Constraint, Component, Z3ConstraintDef, ArithmeticConstraint } from '../types';

/**
 * Z3 Solver統合モジュール
 *
 * 参考: z3-solverパッケージを動的インポートで使用
 * - 論理制約（AND, OR, NOT, IMPLIES, XOR）
 * - 算術制約（total_price <= X, expected_failure_cost < Y）
 */

// Z3インスタンスのキャッシュ
let z3Module: any = null;
let z3InitAttempted = false;

/**
 * Z3 Solverを動的に初期化
 */
async function initZ3(): Promise<any | null> {
  if (z3InitAttempted) return z3Module;

  z3InitAttempted = true;

  try {
    // 動的インポート（参考コードのパターン）
    const Z3 = await import('z3-solver');
    console.log('Z3 Solver loaded successfully');
    z3Module = Z3;
    return Z3;
  } catch (error) {
    console.warn('Z3 Solver not available. Falling back to JavaScript evaluation.', error);
    console.warn('To enable Z3: npm install z3-solver');
    z3Module = null;
    return null;
  }
}

/**
 * Z3が利用可能かチェック
 */
export async function isZ3Available(): Promise<boolean> {
  const z3 = await initZ3();
  return z3 !== null;
}

/**
 * 算術制約を解析してZ3式に変換（参考コードのパターン）
 */
function parseArithmeticExprToZ3(ctx: any, total_price: any, expected_failure_cost: any, expr: string): any | null {
  // サポート: "total_price <= 300000" or "expected_failure_cost < 10000"
  const match = expr.match(/\s*(total_price|expected_failure_cost)\s*(<=|<|>=|>|==|=)\s*([0-9]+(?:\.[0-9]+)?)\s*/);
  if (!match) return null;

  const lhs = match[1];
  const op = match[2];
  const rhs = match[3];

  const rhsVal = rhs.includes('.') ? ctx.Real.val(rhs) : ctx.Int.val(Math.round(Number(rhs)));
  const lhsExpr = lhs === 'total_price' ? total_price : expected_failure_cost;

  // 比較式を構築
  switch (op) {
    case '<=': return lhsExpr.le(rhsVal);
    case '<': return lhsExpr.lt(rhsVal);
    case '>=': return lhsExpr.ge(rhsVal);
    case '>': return lhsExpr.gt(rhsVal);
    case '==': case '=': return lhsExpr.eq(rhsVal);
    default: return null;
  }
}

/**
 * JavaScript フォールバック：算術制約を評価
 */
function evaluateArithmeticJS(metrics: { totalPrice: number; expectedFailureCost: number }, expr: string): boolean {
  const match = expr.match(/\s*(total_price|expected_failure_cost)\s*(<=|<|>=|>|==|=)\s*([0-9]+(?:\.[0-9]+)?)\s*/);
  if (!match) return false;

  const lhs = match[1];
  const op = match[2];
  const rhs = parseFloat(match[3]);

  const val = lhs === 'total_price' ? metrics.totalPrice : metrics.expectedFailureCost;

  switch (op) {
    case '<=': return val <= rhs;
    case '<': return val < rhs;
    case '>=': return val >= rhs;
    case '>': return val > rhs;
    case '==': case '=': return val === rhs;
    default: return false;
  }
}

/**
 * Z3を使って算術制約を評価
 */
export async function evaluateArithmeticConstraintsWithZ3(
  metrics: { totalPrice: number; expectedFailureCost: number },
  constraints: ArithmeticConstraint[]
): Promise<{ z3Used: boolean; results: { constraint: ArithmeticConstraint; satisfied: boolean; note?: string }[] }> {
  const z3 = await initZ3();

  if (!z3) {
    // Z3が利用できない場合はJavaScriptでフォールバック
    return {
      z3Used: false,
      results: constraints.map(c => ({
        constraint: c,
        satisfied: evaluateArithmeticJS(metrics, c.expression),
        note: 'Evaluated with JavaScript (Z3 not available)'
      }))
    };
  }

  try {
    // Z3を使って評価（参考コードのパターン）
    const { Context } = z3;
    const ctx = new Context('main');
    const solver = new ctx.Solver();

    // 変数を定義
    const total_price = ctx.Int.const('total_price');
    const expected_failure_cost = ctx.Real.const('expected_failure_cost');

    // 具体的な値をアサート
    solver.add(ctx.Int.val(Math.round(metrics.totalPrice)).eq(total_price));
    solver.add(ctx.Real.val(metrics.expectedFailureCost).eq(expected_failure_cost));

    const results = [];

    for (const constraint of constraints) {
      const parsed = parseArithmeticExprToZ3(ctx, total_price, expected_failure_cost, constraint.expression);

      if (!parsed) {
        results.push({
          constraint,
          satisfied: false,
          note: 'Unsupported expression format'
        });
        continue;
      }

      // 制約を追加してチェック
      solver.push();
      solver.add(parsed);
      const checkResult = await solver.check();
      const satisfied = checkResult === 'sat';
      results.push({
        constraint,
        satisfied,
        note: `Evaluated with Z3: ${checkResult}`
      });
      solver.pop();
    }

    return { z3Used: true, results };
  } catch (error) {
    console.error('Z3 evaluation failed:', error);
    // エラー時はJavaScriptでフォールバック
    return {
      z3Used: false,
      results: constraints.map(c => ({
        constraint: c,
        satisfied: evaluateArithmeticJS(metrics, c.expression),
        note: 'Z3 error, fell back to JavaScript'
      }))
    };
  }
}

/**
 * 論理制約を評価（JavaScript実装）
 */
function evaluateZ3Constraint(
  z3Constraint: Z3ConstraintDef,
  selectedComponentIds: Set<string>
): boolean {
  const { expr, components } = z3Constraint;
  const values = components.map(id => selectedComponentIds.has(id));

  switch (expr) {
    case 'and': return values.every(v => v);
    case 'or': return values.some(v => v);
    case 'not': return !values.every(v => v);
    case 'implies': return components.length >= 2 ? (!values[0] || values[1]) : true;
    case 'xor': return components.length >= 2 ? (values[0] !== values[1]) : false;
    default: return true;
  }
}

/**
 * Z3風の制約を使って制約を評価（JavaScript実装）
 */
export async function evaluateConstraintsWithZ3(
  selectedComponentIds: Set<string>,
  _allComponentIds: string[],
  constraints: Constraint[]
): Promise<{ constraint: Constraint; message: string }[]> {
  const violations: { constraint: Constraint; message: string }[] = [];

  // 各制約を評価
  for (const constraint of constraints) {
    // 制約に関連する部品が選択されているかチェック
    const relevantComponentsSelected = constraint.componentIds.some(id =>
      selectedComponentIds.has(id)
    );

    if (!relevantComponentsSelected) {
      continue;
    }

    // Z3制約がある場合はZ3風の評価を使用
    if (constraint.z3Constraint) {
      const isValid = evaluateZ3Constraint(constraint.z3Constraint, selectedComponentIds);

      if (!isValid) {
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

  return violations;
}

// 全ての部品IDを取得するヘルパー関数
export function getAllComponentIds(components: Component[]): string[] {
  return components.map(c => c.id);
}
