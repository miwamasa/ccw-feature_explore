import { useState } from 'react';
import { TreeView } from './components/TreeView';
import { ConstraintsPanel } from './components/ConstraintsPanel';
import { EvaluationPanel } from './components/EvaluationPanel';
import {
  initialConfiguration,
  components,
  selectionPoints,
  constraints,
  pastCases,
} from './data/sampleData';
import { TreeNode, EvaluationResult } from './types';
import { evaluateConfigurationWithZ3 } from './utils/evaluation';

function App() {
  const [rootNode, setRootNode] = useState<TreeNode>(initialConfiguration.rootNode);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

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

  // 評価を実行（Z3使用）
  const handleEvaluate = async () => {
    try {
      const result = await evaluateConfigurationWithZ3(rootNode, components, constraints, pastCases);
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
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Z3 Solver
            </span>
          </div>
          <p className="text-sm text-gray-600">
            各選択ポイントで部品を選択し、評価ボタンで制約・価格・リスクを確認できます
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ※ 制約評価にZ3 Solver (WASM) を使用しています
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            部品構成ツリー
          </h2>
          <TreeView
            node={rootNode}
            selectionPoints={selectionPoints}
            components={components}
            onSelectComponent={handleSelectComponent}
          />
        </div>
      </div>

      {/* 右ペイン */}
      <div className="w-1/2 flex flex-col">
        {/* 右ペイン上部: 制約と過去事例 */}
        <div className="h-1/2 overflow-hidden">
          <ConstraintsPanel constraints={constraints} pastCases={pastCases} />
        </div>

        {/* 右ペイン下部: 評価実行と結果 */}
        <div className="h-1/2 overflow-y-auto">
          <EvaluationPanel onEvaluate={handleEvaluate} result={evaluationResult} />
        </div>
      </div>
    </div>
  );
}

export default App;
