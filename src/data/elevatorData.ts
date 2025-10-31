import {
  Component,
  Constraint,
  ConstraintType,
  PastCase,
  SelectionPoint,
  ProductConfiguration,
  TreeNode,
} from '../types';

// エレベータ部品データ
export const elevatorComponents: Component[] = [
  // モーター
  {
    id: 'motor-ac',
    name: 'AC誘導モーター',
    category: 'motor',
    price: 800000,
    description: '標準的なAC誘導モーター',
    manufacturability: 0.9,
    failureRate: 0.02,
    failureCost: 500000,
  },
  {
    id: 'motor-dc',
    name: 'DCモーター',
    category: 'motor',
    price: 1000000,
    description: 'DCモーター（ブラシ交換が必要）',
    manufacturability: 0.8,
    failureRate: 0.03,
    failureCost: 600000,
  },
  {
    id: 'motor-gearless',
    name: 'ギアレスモーター',
    category: 'motor',
    price: 2000000,
    description: '省エネ・静音性に優れたギアレスモーター',
    manufacturability: 0.7,
    failureRate: 0.01,
    failureCost: 800000,
  },

  // ドアシステム
  {
    id: 'door-single-auto',
    name: '片開き自動ドア',
    category: 'door',
    price: 400000,
    description: '標準的な片開き自動ドア',
    manufacturability: 0.9,
    failureRate: 0.04,
    failureCost: 200000,
  },
  {
    id: 'door-double-auto',
    name: '両開き自動ドア',
    category: 'door',
    price: 600000,
    description: '開口部が広い両開き自動ドア',
    manufacturability: 0.8,
    failureRate: 0.05,
    failureCost: 300000,
  },
  {
    id: 'door-manual',
    name: '手動ドア',
    category: 'door',
    price: 150000,
    description: '手動開閉式ドア（安全性に注意）',
    manufacturability: 1.0,
    failureRate: 0.08,
    failureCost: 100000,
  },

  // 制御システム
  {
    id: 'control-relay',
    name: 'リレー制御',
    category: 'control',
    price: 300000,
    description: '旧式のリレー制御システム',
    manufacturability: 1.0,
    failureRate: 0.1,
    failureCost: 400000,
  },
  {
    id: 'control-plc',
    name: 'PLC制御',
    category: 'control',
    price: 800000,
    description: '標準的なPLC制御システム',
    manufacturability: 0.8,
    failureRate: 0.03,
    failureCost: 500000,
  },
  {
    id: 'control-iot',
    name: 'IoT統合制御',
    category: 'control',
    price: 1500000,
    description: '予防保守機能付きIoT統合制御',
    manufacturability: 0.6,
    failureRate: 0.02,
    failureCost: 700000,
  },

  // 安全装置
  {
    id: 'safety-basic',
    name: '基本安全装置',
    category: 'safety',
    price: 200000,
    description: '最小限の安全装置',
    manufacturability: 1.0,
    failureRate: 0.05,
    failureCost: 1000000,
  },
  {
    id: 'safety-standard',
    name: '標準安全装置',
    category: 'safety',
    price: 500000,
    description: '標準的な安全装置',
    manufacturability: 0.9,
    failureRate: 0.02,
    failureCost: 1500000,
  },
  {
    id: 'safety-advanced',
    name: '高度安全装置',
    category: 'safety',
    price: 1000000,
    description: '高度な安全監視機能付き',
    manufacturability: 0.7,
    failureRate: 0.01,
    failureCost: 2000000,
  },

  // 速度クラス
  {
    id: 'speed-low',
    name: '低速（45m/分）',
    category: 'speed',
    price: 0,
    description: '低層ビル向け低速エレベータ',
    manufacturability: 1.0,
    failureRate: 0.01,
    failureCost: 100000,
  },
  {
    id: 'speed-medium',
    name: '中速（105m/分）',
    category: 'speed',
    price: 300000,
    description: '中層ビル向け中速エレベータ',
    manufacturability: 0.8,
    failureRate: 0.02,
    failureCost: 200000,
  },
  {
    id: 'speed-high',
    name: '高速（210m/分）',
    category: 'speed',
    price: 800000,
    description: '高層ビル向け高速エレベータ',
    manufacturability: 0.6,
    failureRate: 0.03,
    failureCost: 400000,
  },
];

// エレベータ選択ポイント
export const elevatorSelectionPoints: SelectionPoint[] = [
  {
    id: 'sp-motor',
    name: 'モーター選択',
    description: 'エレベータの駆動モーターを選択',
    availableComponents: elevatorComponents.filter(c => c.category === 'motor'),
  },
  {
    id: 'sp-door',
    name: 'ドアシステム選択',
    description: 'エレベータのドアシステムを選択',
    availableComponents: elevatorComponents.filter(c => c.category === 'door'),
  },
  {
    id: 'sp-control',
    name: '制御システム選択',
    description: 'エレベータの制御システムを選択',
    availableComponents: elevatorComponents.filter(c => c.category === 'control'),
  },
  {
    id: 'sp-safety',
    name: '安全装置選択',
    description: 'エレベータの安全装置を選択',
    availableComponents: elevatorComponents.filter(c => c.category === 'safety'),
  },
  {
    id: 'sp-speed',
    name: '速度クラス選択',
    description: 'エレベータの速度クラスを選択',
    availableComponents: elevatorComponents.filter(c => c.category === 'speed'),
  },
];

// エレベータ制約
export const elevatorConstraints: Constraint[] = [
  {
    id: 'ec-1',
    type: ConstraintType.REQUIRED,
    name: '高速運転には高度安全装置が必要',
    description: '高速エレベータは高度な安全装置を装備する必要があります',
    componentIds: ['speed-high', 'safety-advanced'],
    z3Constraint: {
      expr: 'implies',
      components: ['speed-high', 'safety-advanced'],
    },
    validate: (selected) => {
      if (selected.has('speed-high')) {
        return selected.has('safety-advanced');
      }
      return true;
    },
    severity: 'error',
  },
  {
    id: 'ec-2',
    type: ConstraintType.RECOMMENDED,
    name: 'IoT制御はギアレスモーター推奨',
    description: 'IoT統合制御システムはギアレスモーターとの組み合わせが推奨されます',
    componentIds: ['control-iot', 'motor-gearless'],
    z3Constraint: {
      expr: 'implies',
      components: ['control-iot', 'motor-gearless'],
    },
    validate: (selected) => {
      if (selected.has('control-iot')) {
        return selected.has('motor-gearless');
      }
      return true;
    },
    severity: 'warning',
  },
  {
    id: 'ec-3',
    type: ConstraintType.INCOMPATIBILITY,
    name: '手動ドアはリレー制御不可',
    description: '手動ドアはリレー制御システムと組み合わせられません',
    componentIds: ['door-manual', 'control-relay'],
    z3Constraint: {
      expr: 'not',
      components: ['door-manual', 'control-relay'],
    },
    validate: (selected) => !(selected.has('door-manual') && selected.has('control-relay')),
    severity: 'error',
  },
  {
    id: 'ec-4',
    type: ConstraintType.REQUIRED,
    name: '基本安全装置は低速のみ',
    description: '基本安全装置は低速エレベータでのみ使用可能です',
    componentIds: ['safety-basic', 'speed-low'],
    z3Constraint: {
      expr: 'implies',
      components: ['safety-basic', 'speed-low'],
    },
    validate: (selected) => {
      if (selected.has('safety-basic')) {
        return selected.has('speed-low');
      }
      return true;
    },
    severity: 'error',
  },
  {
    id: 'ec-5',
    type: ConstraintType.INCOMPATIBILITY,
    name: '中速以上には標準以上の安全装置',
    description: '中速・高速エレベータには標準以上の安全装置が必要です',
    componentIds: ['speed-medium', 'safety-basic'],
    z3Constraint: {
      expr: 'not',
      components: ['speed-medium', 'safety-basic'],
    },
    validate: (selected) => !(selected.has('speed-medium') && selected.has('safety-basic')),
    severity: 'error',
  },
];

// エレベータ算術制約
export const elevatorArithmeticConstraints = [
  {
    id: 'eac-1',
    name: '総コスト上限',
    expression: 'total_price <= 5000000',
    description: 'エレベータシステムの総コストは500万円以下',
  },
  {
    id: 'eac-2',
    name: '期待故障コスト上限',
    expression: 'expected_failure_cost <= 100000',
    description: '期待故障コストは10万円以下',
  },
];

// エレベータ過去事例
export const elevatorPastCases: PastCase[] = [
  {
    id: 'epc-1',
    title: '旧式リレー制御の故障事例',
    description: 'リレー制御システムの経年劣化による故障が多発。保守コストが年間200万円増加',
    relatedComponentIds: ['control-relay'],
    type: 'issue',
    riskScore: 8,
    date: '2023-06',
  },
  {
    id: 'epc-2',
    title: '手動ドアの安全性問題',
    description: '手動ドアの閉め忘れによる事故リスク。法的責任と補償コストが発生',
    relatedComponentIds: ['door-manual'],
    type: 'warning',
    riskScore: 7,
    date: '2023-09',
  },
  {
    id: 'epc-3',
    title: 'IoT制御の高信頼性',
    description: 'IoT統合制御による予防保守で故障率が大幅低下。保守コストを30%削減',
    relatedComponentIds: ['control-iot', 'motor-gearless'],
    type: 'success',
    riskScore: 2,
    date: '2024-02',
  },
  {
    id: 'epc-4',
    title: '高速エレベータの安全装置不足',
    description: '高速運転に対して安全装置が不十分だった事例。重大事故につながる可能性',
    relatedComponentIds: ['speed-high', 'safety-standard'],
    type: 'issue',
    riskScore: 9,
    date: '2023-04',
  },
  {
    id: 'epc-5',
    title: 'DCモーターのブラシ交換コスト',
    description: 'DCモーターのブラシ交換頻度が高くメンテナンス負担増。年間保守コスト50万円増',
    relatedComponentIds: ['motor-dc'],
    type: 'warning',
    riskScore: 5,
    date: '2023-11',
  },
];

// エレベータ初期ツリーノード
const elevatorInitialTreeNode: TreeNode = {
  id: 'root',
  selectionPointId: 'sp-motor',
  selectedComponentId: 'motor-ac',
  children: [
    {
      id: 'door-node',
      selectionPointId: 'sp-door',
      selectedComponentId: 'door-single-auto',
      children: [],
    },
    {
      id: 'control-node',
      selectionPointId: 'sp-control',
      selectedComponentId: 'control-plc',
      children: [],
    },
    {
      id: 'safety-node',
      selectionPointId: 'sp-safety',
      selectedComponentId: 'safety-standard',
      children: [],
    },
    {
      id: 'speed-node',
      selectionPointId: 'sp-speed',
      selectedComponentId: 'speed-medium',
      children: [],
    },
  ],
};

// エレベータ初期構成
export const elevatorInitialConfiguration: ProductConfiguration = {
  id: 'config-elevator',
  name: 'エレベータシステム構成',
  selectionPoints: elevatorSelectionPoints,
  constraints: elevatorConstraints,
  pastCases: elevatorPastCases,
  rootNode: elevatorInitialTreeNode,
};
