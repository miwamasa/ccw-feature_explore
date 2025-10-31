import {
  Component,
  SelectionPoint,
  Constraint,
  ConstraintType,
  PastCase,
  TreeNode,
  ProductConfiguration,
} from '../types';

// 部品データ
export const components: Component[] = [
  // エンジン
  { id: 'eng-1', name: 'ガソリンエンジン 1.5L', category: 'engine', price: 250000, description: '標準的なガソリンエンジン' },
  { id: 'eng-2', name: 'ガソリンエンジン 2.0L', category: 'engine', price: 320000, description: '高出力ガソリンエンジン' },
  { id: 'eng-3', name: 'ディーゼルエンジン 2.0L', category: 'engine', price: 380000, description: '燃費に優れたディーゼル' },
  { id: 'eng-4', name: 'ハイブリッドシステム', category: 'engine', price: 450000, description: 'エコフレンドリー' },

  // トランスミッション
  { id: 'trans-1', name: '5速マニュアル', category: 'transmission', price: 80000, description: 'シンプルで信頼性が高い' },
  { id: 'trans-2', name: '6速オートマチック', category: 'transmission', price: 150000, description: '快適な運転' },
  { id: 'trans-3', name: 'CVT', category: 'transmission', price: 180000, description: 'スムーズな加速' },

  // タイヤ
  { id: 'tire-1', name: '16インチ標準タイヤ', category: 'tire', price: 40000, description: '標準装備' },
  { id: 'tire-2', name: '17インチスポーツタイヤ', category: 'tire', price: 80000, description: 'グリップ性能向上' },
  { id: 'tire-3', name: '18インチプレミアムタイヤ', category: 'tire', price: 120000, description: '高級仕様' },

  // ブレーキシステム
  { id: 'brake-1', name: '標準ディスクブレーキ', category: 'brake', price: 60000, description: '標準仕様' },
  { id: 'brake-2', name: '大径ベンチレーテッドディスク', category: 'brake', price: 100000, description: '制動力向上' },
  { id: 'brake-3', name: 'カーボンセラミックブレーキ', category: 'brake', price: 250000, description: '高性能ブレーキ' },

  // サスペンション
  { id: 'susp-1', name: '標準サスペンション', category: 'suspension', price: 70000, description: 'コンフォート重視' },
  { id: 'susp-2', name: 'スポーツサスペンション', category: 'suspension', price: 120000, description: 'ハンドリング重視' },

  // インテリア
  { id: 'int-1', name: 'ファブリックシート', category: 'interior', price: 50000, description: '標準シート' },
  { id: 'int-2', name: 'レザーシート', category: 'interior', price: 150000, description: '高級シート' },
  { id: 'int-3', name: 'スポーツシート', category: 'interior', price: 180000, description: 'ホールド性重視' },
];

// 選択ポイント
export const selectionPoints: SelectionPoint[] = [
  {
    id: 'sp-engine',
    name: 'エンジン選択',
    description: '車両の心臓部となるエンジンを選択',
    availableComponents: components.filter(c => c.category === 'engine'),
  },
  {
    id: 'sp-transmission',
    name: 'トランスミッション選択',
    description: '駆動系の変速機を選択',
    availableComponents: components.filter(c => c.category === 'transmission'),
  },
  {
    id: 'sp-tire',
    name: 'タイヤ選択',
    description: '走行性能に影響するタイヤを選択',
    availableComponents: components.filter(c => c.category === 'tire'),
  },
  {
    id: 'sp-brake',
    name: 'ブレーキシステム選択',
    description: '制動システムを選択',
    availableComponents: components.filter(c => c.category === 'brake'),
  },
  {
    id: 'sp-suspension',
    name: 'サスペンション選択',
    description: '乗り心地と操縦性を決定',
    availableComponents: components.filter(c => c.category === 'suspension'),
  },
  {
    id: 'sp-interior',
    name: 'インテリア選択',
    description: '内装の質感を選択',
    availableComponents: components.filter(c => c.category === 'interior'),
  },
];

// 制約
export const constraints: Constraint[] = [
  {
    id: 'const-1',
    type: ConstraintType.INCOMPATIBILITY,
    name: 'ハイブリッド×マニュアル非対応',
    description: 'ハイブリッドシステムは5速マニュアルと組み合わせできません',
    componentIds: ['eng-4', 'trans-1'],
    validate: (selected) => !(selected.has('eng-4') && selected.has('trans-1')),
    severity: 'error',
  },
  {
    id: 'const-2',
    type: ConstraintType.INCOMPATIBILITY,
    name: '小型エンジン×大型タイヤ非推奨',
    description: '1.5Lエンジンに18インチタイヤは推奨されません（加速性能低下）',
    componentIds: ['eng-1', 'tire-3'],
    validate: (selected) => !(selected.has('eng-1') && selected.has('tire-3')),
    severity: 'warning',
  },
  {
    id: 'const-3',
    type: ConstraintType.RECOMMENDED,
    name: 'スポーツタイヤ×高性能ブレーキ推奨',
    description: 'スポーツタイヤには高性能ブレーキとの組み合わせを推奨',
    componentIds: ['tire-2', 'brake-2'],
    validate: (selected) => {
      if (selected.has('tire-2') || selected.has('tire-3')) {
        return selected.has('brake-2') || selected.has('brake-3');
      }
      return true;
    },
    severity: 'info',
  },
  {
    id: 'const-4',
    type: ConstraintType.INCOMPATIBILITY,
    name: 'カーボンブレーキ×標準タイヤ非推奨',
    description: 'カーボンセラミックブレーキに標準タイヤは不適切',
    componentIds: ['brake-3', 'tire-1'],
    validate: (selected) => !(selected.has('brake-3') && selected.has('tire-1')),
    severity: 'warning',
  },
  {
    id: 'const-5',
    type: ConstraintType.REQUIRED,
    name: 'ディーゼル×CVT非対応',
    description: 'ディーゼルエンジンとCVTは技術的に組み合わせできません',
    componentIds: ['eng-3', 'trans-3'],
    validate: (selected) => !(selected.has('eng-3') && selected.has('trans-3')),
    severity: 'error',
  },
];

// 過去事例
export const pastCases: PastCase[] = [
  {
    id: 'case-1',
    title: '1.5Lエンジン + CVTの実績',
    description: '多数の販売実績があり、トラブルも少ない定番の組み合わせ',
    relatedComponentIds: ['eng-1', 'trans-3'],
    type: 'success',
    riskScore: 1,
    date: '2024-01',
  },
  {
    id: 'case-2',
    title: '2.0Lガソリン + スポーツタイヤでの振動問題',
    description: '特定のロットで17インチスポーツタイヤとの組み合わせで振動が発生',
    relatedComponentIds: ['eng-2', 'tire-2'],
    type: 'issue',
    riskScore: 6,
    date: '2023-08',
  },
  {
    id: 'case-3',
    title: 'ハイブリッド + CVTの高評価',
    description: 'ユーザー満足度が非常に高い組み合わせ。燃費も良好',
    relatedComponentIds: ['eng-4', 'trans-3'],
    type: 'success',
    riskScore: 2,
    date: '2024-03',
  },
  {
    id: 'case-4',
    title: 'スポーツサスペンション + 標準タイヤ',
    description: '乗り心地が硬すぎるとの苦情あり',
    relatedComponentIds: ['susp-2', 'tire-1'],
    type: 'warning',
    riskScore: 4,
    date: '2023-11',
  },
  {
    id: 'case-5',
    title: 'ディーゼル + 6AT の耐久性',
    description: '長距離運転で高い耐久性を実証。商用車でも採用',
    relatedComponentIds: ['eng-3', 'trans-2'],
    type: 'success',
    riskScore: 2,
    date: '2023-05',
  },
];

// 初期木構造（ルートノード）
export const initialTreeNode: TreeNode = {
  id: 'root',
  selectionPointId: 'sp-engine',
  selectedComponentId: undefined,
  children: [
    {
      id: 'node-transmission',
      selectionPointId: 'sp-transmission',
      selectedComponentId: undefined,
      children: [],
    },
    {
      id: 'node-tire',
      selectionPointId: 'sp-tire',
      selectedComponentId: undefined,
      children: [
        {
          id: 'node-brake',
          selectionPointId: 'sp-brake',
          selectedComponentId: undefined,
          children: [],
        },
      ],
    },
    {
      id: 'node-suspension',
      selectionPointId: 'sp-suspension',
      selectedComponentId: undefined,
      children: [],
    },
    {
      id: 'node-interior',
      selectionPointId: 'sp-interior',
      selectedComponentId: undefined,
      children: [],
    },
  ],
};

// 製品構成の初期データ
export const initialConfiguration: ProductConfiguration = {
  id: 'config-1',
  name: '新型車両構成',
  selectionPoints,
  constraints,
  pastCases,
  rootNode: initialTreeNode,
};
