import React, { useState } from 'react';
import { EvaluationResult } from '../types';

interface ConstraintExpressions {
  selectedComponents: { id: string; name: string }[];
  logicalConstraints: string[];
  arithmeticConstraints: string[];
  z3Code: string;
}

interface EvaluationPanelProps {
  onGenerateExpressions: () => ConstraintExpressions;
  onEvaluate: () => void;
  result: EvaluationResult | null;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  onGenerateExpressions,
  onEvaluate,
  result,
}) => {
  const [expressions, setExpressions] = useState<ConstraintExpressions | null>(null);

  const handleGenerateExpressions = () => {
    const generated = onGenerateExpressions();
    setExpressions(generated);
  };

  return (
    <div className="h-full p-4 bg-white border-t-2 border-gray-300 overflow-y-auto">
      {/* ステップ1: 制約式生成 */}
      <button
        onClick={handleGenerateExpressions}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors mb-4"
      >
        制約式生成
      </button>

      {/* 制約式表示 */}
      {expressions && (
        <div className="mb-4 space-y-4">
          {/* 選択された部品 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-300">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              選択された部品 ({expressions.selectedComponents.length}件)
            </h3>
            <div className="space-y-1">
              {expressions.selectedComponents.map((comp) => (
                <div key={comp.id} className="text-sm text-gray-700">
                  • {comp.name} <span className="text-xs text-gray-500">({comp.id})</span>
                </div>
              ))}
            </div>
          </div>

          {/* 論理制約 */}
          {expressions.logicalConstraints.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-300">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                論理制約 ({expressions.logicalConstraints.length}件)
              </h3>
              <div className="space-y-1">
                {expressions.logicalConstraints.map((constraint, idx) => (
                  <div key={idx} className="text-sm text-gray-700 font-mono">
                    {constraint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 算術制約 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-300">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              算術制約
            </h3>
            <div className="space-y-1">
              {expressions.arithmeticConstraints.map((constraint, idx) => (
                <div key={idx} className="text-sm text-gray-700 font-mono">
                  {constraint}
                </div>
              ))}
            </div>
          </div>

          {/* Z3擬似コード */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-300">
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              Z3 Solver 制約式
            </h3>
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap bg-white p-3 rounded border border-gray-200 overflow-x-auto">
              {expressions.z3Code}
            </pre>
          </div>
        </div>
      )}

      {/* ステップ2: 制約評価を実行 */}
      <button
        onClick={onEvaluate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors mb-4"
      >
        制約評価を実行
      </button>

      {result && (
        <div className="space-y-4">
          {/* 価格表示 */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-300">
            <h3 className="font-bold text-lg text-gray-800 mb-2">合計価格</h3>
            <div className="text-3xl font-bold text-green-700">
              ¥{result.totalPrice.toLocaleString()}
            </div>
            {result.priceBreakdown.length > 0 && (
              <div className="mt-3 text-sm">
                <div className="font-semibold text-gray-700 mb-1">内訳:</div>
                {result.priceBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600">
                    <span>{item.componentName}</span>
                    <span>¥{item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* リスクスコア */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-300">
            <h3 className="font-bold text-lg text-gray-800 mb-2">リスクスコア</h3>
            <div className="text-3xl font-bold text-purple-700">
              {result.riskScore} / 10
            </div>
            {result.relatedCases.length > 0 && (
              <div className="mt-3 text-sm">
                <div className="font-semibold text-gray-700 mb-1">
                  関連事例 ({result.relatedCases.length}件):
                </div>
                {result.relatedCases.map((pastCase, idx) => (
                  <div key={idx} className="text-gray-600 text-xs">
                    • {pastCase.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 制約違反 */}
          {result.constraintViolations.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-300">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                制約違反 ({result.constraintViolations.length}件)
              </h3>
              <div className="space-y-2">
                {result.constraintViolations.map((violation, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="font-semibold text-red-700">
                      {violation.constraint.name}
                    </div>
                    <div className="text-gray-600 text-xs">{violation.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 警告 */}
          {result.warnings.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-300">
              <h3 className="font-bold text-lg text-gray-800 mb-2">
                警告 ({result.warnings.length}件)
              </h3>
              <div className="space-y-1">
                {result.warnings.map((warning, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    ⚠ {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 成功メッセージ */}
          {result.constraintViolations.length === 0 && result.warnings.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-300">
              <div className="text-green-700 font-semibold text-center">
                ✓ すべての制約を満たしています
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
