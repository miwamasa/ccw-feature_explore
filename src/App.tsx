import { useState } from 'react';
import { TreeView } from './components/TreeView';
import { ConstraintsPanel } from './components/ConstraintsPanel';
import { EvaluationPanel } from './components/EvaluationPanel';
import {
  initialConfiguration as carInitialConfiguration,
  components as carComponents,
  selectionPoints as carSelectionPoints,
  constraints as carConstraints,
  pastCases as carPastCases,
} from './data/sampleData';
import {
  elevatorInitialConfiguration,
  elevatorComponents,
  elevatorSelectionPoints,
  elevatorConstraints,
  elevatorPastCases,
} from './data/elevatorData';
import { TreeNode, EvaluationResult } from './types';
import { evaluateConfigurationWithZ3, generateConstraintExpressions } from './utils/evaluation';

type DataSource = 'car' | 'elevator';

function App() {
  const [dataSource, setDataSource] = useState<DataSource>('car');
  const [rootNode, setRootNode] = useState<TreeNode>(carInitialConfiguration.rootNode);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  // データソースによってデータを切り替え
  const currentData = dataSource === 'car' ? {
    components: carComponents,
    selectionPoints: carSelectionPoints,
    constraints: carConstraints,
    pastCases: carPastCases,
    title: '自動車部品構成',
    badge: 'Automotive Parts',
  } : {
    components: elevatorComponents,
    selectionPoints: elevatorSelectionPoints,
    constraints: elevatorConstraints,
    pastCases: elevatorPastCases,
    title: 'エレベータシステム構成',
    badge: 'Elevator System',
  };

  // データソース切り替え時の処理
  const handleDataSourceChange = (newSource: DataSource) => {
    setDataSource(newSource);
    setRootNode(newSource === 'car' ? carInitialConfiguration.rootNode : elevatorInitialConfiguration.rootNode);
    setEvaluationResult(null);
  };

  // 部品を選択したときの処理
  const handleSelectComponent = (nodeId: string, componentId: string) => {
    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, selectedComponentId: componentId };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    setRootNode(updateNode(rootNode));
    // 選択が変わったら評価結果をリセット
    setEvaluationResult(null);
  };

  // 制約式を生成
  const handleGenerateExpressions = () => {
    return generateConstraintExpressions(rootNode, currentData.components, currentData.constraints);
  };

  // 評価を実行（Z3使用）
  const handleEvaluate = async () => {
    try {
      const result = await evaluateConfigurationWithZ3(
        rootNode,
        currentData.components,
        currentData.constraints,
        currentData.pastCases
      );
      setEvaluationResult(result);
    } catch (error) {
      console.error('評価エラー:', error);
      // エラーの場合は何もしない、または適切なエラー表示を追加
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左ペイン: 木構造 */}
      <div className="w-1/2 p-4 overflow-y-auto border-r-2 border-gray-300">
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-800">
              製品構成デザインツール
            </h1>
            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Z3-Style Constraints
            </span>
          </div>

          {/* データソース選択ボタン */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleDataSourceChange('car')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                dataSource === 'car'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🚗 自動車
            </button>
            <button
              onClick={() => handleDataSourceChange('elevator')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                dataSource === 'elevator'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏢 エレベータ
            </button>
          </div>

          <p className="text-sm text-gray-600">
            各選択ポイントで部品を選択し、評価ボタンで制約・価格・リスクを確認できます
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ※ Z3論理式（AND, OR, NOT, IMPLIES, XOR）による制約評価
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-300 pb-2">
            <h2 className="text-xl font-bold text-gray-800">
              {currentData.title}
            </h2>
            <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
              {currentData.badge}
            </span>
          </div>
          <TreeView
            node={rootNode}
            selectionPoints={currentData.selectionPoints}
            components={currentData.components}
            onSelectComponent={handleSelectComponent}
          />
        </div>
      </div>

      {/* 右ペイン */}
      <div className="w-1/2 flex flex-col">
        {/* 右ペイン上部: 制約と過去事例 */}
        <div className="h-1/2 overflow-hidden">
          <ConstraintsPanel constraints={currentData.constraints} pastCases={currentData.pastCases} />
        </div>

        {/* 右ペイン下部: 評価実行と結果 */}
        <div className="h-1/2 overflow-y-auto">
          <EvaluationPanel
            onGenerateExpressions={handleGenerateExpressions}
            onEvaluate={handleEvaluate}
            result={evaluationResult}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
