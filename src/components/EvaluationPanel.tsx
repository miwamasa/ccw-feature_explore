import React from 'react';
import { EvaluationResult } from '../types';

interface EvaluationPanelProps {
  onEvaluate: () => void;
  result: EvaluationResult | null;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  onEvaluate,
  result,
}) => {
  return (
    <div className="h-full p-4 bg-white border-t-2 border-gray-300">
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
