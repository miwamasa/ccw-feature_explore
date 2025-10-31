// 部品（コンポーネント）の型定義
export interface Component {
  id: string;
  name: string;
  category: string;
  price?: number; // 価格が不明な部品もある
  description?: string;
}

// 選択肢のポイント（接点）の型定義
export interface SelectionPoint {
  id: string;
  name: string;
  description?: string;
  availableComponents: Component[]; // この接点で選択可能な部品
}

// 木構造のノード
export interface TreeNode {
  id: string;
  selectionPointId: string; // どの接点か
  selectedComponentId?: string; // 選択された部品ID（未選択の場合はundefined）
  children: TreeNode[]; // 子ノード
}

// 制約の種類
export enum ConstraintType {
  INCOMPATIBILITY = 'incompatibility', // 部品間の非互換性
  REQUIRED = 'required', // 必須の組み合わせ
  RECOMMENDED = 'recommended', // 推奨される組み合わせ
}

// Z3制約式の型
export type Z3ConstraintExpr = 'and' | 'or' | 'not' | 'implies' | 'xor';

// Z3制約定義
export interface Z3ConstraintDef {
  expr: Z3ConstraintExpr;
  components: string[]; // 部品ID
}

// 制約の定義
export interface Constraint {
  id: string;
  type: ConstraintType;
  name: string;
  description: string;
  // 制約対象の部品ID配列（2つ以上の部品の組み合わせ）
  componentIds: string[];
  // Z3制約定義（新規追加）
  z3Constraint?: Z3ConstraintDef;
  // 制約が満たされているかをチェックする関数（選択された部品IDのセットを受け取る）
  // Z3制約がある場合はこれは使用されない
  validate: (selectedComponentIds: Set<string>) => boolean;
  severity: 'error' | 'warning' | 'info'; // 制約違反の深刻度
}

// 過去事例・トラブル情報
export interface PastCase {
  id: string;
  title: string;
  description: string;
  relatedComponentIds: string[]; // 関連する部品ID
  type: 'success' | 'issue' | 'warning'; // 成功事例、問題事例、警告
  riskScore?: number; // リスクスコア（1-10）
  date?: string;
}

// 評価結果
export interface EvaluationResult {
  totalPrice: number;
  priceBreakdown: { componentId: string; componentName: string; price: number }[];
  constraintViolations: { constraint: Constraint; message: string }[];
  riskScore: number;
  relatedCases: PastCase[];
  warnings: string[];
}

// 製品構成（全体の設定）
export interface ProductConfiguration {
  id: string;
  name: string;
  selectionPoints: SelectionPoint[];
  constraints: Constraint[];
  pastCases: PastCase[];
  rootNode: TreeNode;
}
