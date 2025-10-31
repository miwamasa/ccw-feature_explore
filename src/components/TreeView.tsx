import React from 'react';
import { TreeNode, SelectionPoint, Component } from '../types';

interface TreeViewProps {
  node: TreeNode;
  selectionPoints: SelectionPoint[];
  components: Component[];
  onSelectComponent: (nodeId: string, componentId: string) => void;
  depth?: number;
}

export const TreeView: React.FC<TreeViewProps> = ({
  node,
  selectionPoints,
  components,
  onSelectComponent,
  depth = 0,
}) => {
  const selectionPoint = selectionPoints.find(sp => sp.id === node.selectionPointId);
  const selectedComponent = node.selectedComponentId
    ? components.find(c => c.id === node.selectedComponentId)
    : undefined;

  const handleComponentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const componentId = e.target.value;
    if (componentId) {
      onSelectComponent(node.id, componentId);
    }
  };

  return (
    <div className={`ml-${depth * 4} mb-3`}>
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div className="font-semibold text-gray-800 mb-2">
          {selectionPoint?.name || 'Unknown'}
        </div>
        {selectionPoint && (
          <div className="mb-2">
            <select
              value={node.selectedComponentId || ''}
              onChange={handleComponentSelect}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- 選択してください --</option>
              {selectionPoint.availableComponents.map(component => (
                <option key={component.id} value={component.id}>
                  {component.name}
                  {component.price !== undefined ? ` (¥${component.price.toLocaleString()})` : ' (価格未定)'}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedComponent && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <div className="font-medium">{selectedComponent.name}</div>
            {selectedComponent.description && (
              <div className="text-xs mt-1">{selectedComponent.description}</div>
            )}
            {selectedComponent.price !== undefined && (
              <div className="text-xs mt-1 font-semibold text-blue-700">
                ¥{selectedComponent.price.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="mt-3 ml-6 border-l-2 border-gray-300 pl-4">
          {node.children.map(child => (
            <TreeView
              key={child.id}
              node={child}
              selectionPoints={selectionPoints}
              components={components}
              onSelectComponent={onSelectComponent}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
