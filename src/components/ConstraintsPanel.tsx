import React from 'react';
import { Constraint, PastCase } from '../types';

interface ConstraintsPanelProps {
  constraints: Constraint[];
  pastCases: PastCase[];
}

export const ConstraintsPanel: React.FC<ConstraintsPanelProps> = ({
  constraints,
  pastCases,
}) => {
  return (
    <div className="h-full overflow-y-auto p-4 bg-gray-50">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
          制約一覧
        </h2>
        <div className="space-y-2">
          {constraints.map(constraint => {
            const severityColor =
              constraint.severity === 'error'
                ? 'border-red-500 bg-red-50'
                : constraint.severity === 'warning'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-blue-500 bg-blue-50';

            return (
              <div
                key={constraint.id}
                className={`p-3 rounded-lg border-l-4 ${severityColor}`}
              >
                <div className="font-semibold text-gray-800">{constraint.name}</div>
                <div className="text-sm text-gray-600 mt-1">{constraint.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  深刻度: {constraint.severity === 'error' ? 'エラー' : constraint.severity === 'warning' ? '警告' : '情報'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
          過去事例
        </h2>
        <div className="space-y-2">
          {pastCases.map(pastCase => {
            const typeColor =
              pastCase.type === 'success'
                ? 'border-green-500 bg-green-50'
                : pastCase.type === 'issue'
                ? 'border-red-500 bg-red-50'
                : 'border-yellow-500 bg-yellow-50';

            return (
              <div
                key={pastCase.id}
                className={`p-3 rounded-lg border-l-4 ${typeColor}`}
              >
                <div className="font-semibold text-gray-800">{pastCase.title}</div>
                <div className="text-sm text-gray-600 mt-1">{pastCase.description}</div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>
                    {pastCase.type === 'success' ? '✓ 成功事例' : pastCase.type === 'issue' ? '✗ 問題事例' : '⚠ 警告'}
                  </span>
                  {pastCase.riskScore !== undefined && (
                    <span>リスク: {pastCase.riskScore}/10</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
