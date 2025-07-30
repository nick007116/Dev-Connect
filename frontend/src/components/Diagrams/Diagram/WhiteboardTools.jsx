import React, { useState } from 'react';
import { 
  MousePointer, Pencil, Eraser,
  ChevronLeft, ChevronRight,
  Trash2, Map
} from 'lucide-react';

const WhiteboardTools = ({
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  isCollapsed,
  setIsCollapsed,
  showNavigator,
  setShowNavigator
}) => {
  const [activeTab, setActiveTab] = useState('tools');

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#374151'
  ];

  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'pen', icon: Pencil, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' }
  ];

  if (isCollapsed) {
    return (
      <div className="fixed left-4 top-24 bg-white rounded-xl shadow-lg border p-2 z-30">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed left-4 top-24 w-72 bg-white rounded-xl shadow-lg border z-30 max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'tools' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'style' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-3 py-1 rounded-lg text-sm font-medium ${
              activeTab === 'view' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            View
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 overflow-y-auto max-h-96">
        {/* Tools tab */}
        {activeTab === 'tools' && (
          <div className="space-y-4">
            {/* Drawing Tools */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2 uppercase font-semibold">Drawing Tools</h4>
              <div className="grid grid-cols-3 gap-2">
                {tools.map((toolItem) => {
                  const IconComponent = toolItem.icon;
                  return (
                    <button
                      key={toolItem.id}
                      onClick={() => setTool(toolItem.id)}
                      className={`p-3 rounded-lg transition-colors ${
                        tool === toolItem.id
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-100 border'
                      }`}
                      title={toolItem.label}
                    >
                      <IconComponent className="w-5 h-5 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Style tab */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Color Picker */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2 uppercase font-semibold">Color</h4>
              <div className="flex items-center space-x-2 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg border-2"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-6 gap-1">
                {colors.map((colorOption) => (
                  <button
                    key={colorOption}
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      color === colorOption ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2 uppercase font-semibold">
                Brush Size ({strokeWidth}px)
              </h4>
              <input
                type="range"
                min="1"
                max="50"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full mb-3"
              />
              <div className="grid grid-cols-4 gap-2">
                {[2, 5, 10, 20].map((size) => (
                  <button
                    key={size}
                    onClick={() => setStrokeWidth(size)}
                    className={`py-2 px-3 rounded-lg text-sm ${
                      strokeWidth === size
                        ? 'bg-blue-500 text-white'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View tab */}
        {activeTab === 'view' && (
          <div className="space-y-4">
            {/* Display Options */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2 uppercase font-semibold">Display</h4>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => setShowNavigator(!showNavigator)}
                  className={`w-full flex items-center space-x-2 p-3 rounded-lg ${
                    showNavigator 
                      ? 'bg-blue-500 text-white' 
                      : 'border hover:bg-gray-100'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span className="text-sm">Show Navigator</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="text-xs text-gray-500 mb-2 uppercase font-semibold">Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={onClear}
                  className="w-full flex items-center space-x-2 p-3 rounded-lg border hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm">Clear Canvas</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhiteboardTools;