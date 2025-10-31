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
import { evaluateConfiguration } from './utils/evaluation';

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

  // 評価を実行
  const handleEvaluate = () => {
    const result = evaluateConfiguration(rootNode, components, constraints, pastCases);
    setEvaluationResult(result);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左ペイン: 木構造 */}
      <div className="w-1/2 p-4 overflow-y-auto border-r-2 border-gray-300">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            製品構成デザインツール
          </h1>
          <p className="text-sm text-gray-600">
            各選択ポイントで部品を選択し、評価ボタンで制約・価格・リスクを確認できます
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
