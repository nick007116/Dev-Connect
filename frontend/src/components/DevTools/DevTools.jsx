import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Palette,
  QrCode,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorGradientTool from './tools/ColorGradientTool';
import QRGeneratorTool from './tools/QRGeneratorTool';

const DevTools = ({ user, userData }) => {
  const [selectedTool, setSelectedTool] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState('gradient');
  
  // Color & Gradient Tool states
  const [colorResult, setColorResult] = useState('#3b82f6');
  const [gradientColor1, setGradientColor1] = useState('#3b82f6');
  const [gradientColor2, setGradientColor2] = useState('#8b5cf6');
  const [gradientDirection, setGradientDirection] = useState('to right');
  
  // QR Generator states
  const [qrText, setQrText] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tools = [
    {
      id: 'color-gradient',
      name: 'Color & Gradient Studio',
      subtitle: 'Professional Color Tools',
      icon: <Palette className="w-6 h-6" />,
      description: 'Create stunning gradients, pick perfect colors, and build beautiful palettes with advanced color theory tools',
      color: 'from-purple-500 to-indigo-600',
      features: ['Gradient Generator', 'Color Picker', 'Palette Creator', 'Color Harmony'],
      options: [
        { id: 'gradient', name: 'Gradient' },
        { id: 'picker', name: 'Picker' },
        { id: 'palettes', name: 'Palettes' }
      ]
    },
    {
      id: 'qr-generator',
      name: 'QR Code Generator',
      subtitle: 'Advanced QR Solutions',
      icon: <QrCode className="w-6 h-6" />,
      description: 'Generate beautiful, customizable QR codes with logos, colors, gradients, and advanced styling options',
      color: 'from-blue-500 to-cyan-600',
      features: ['Custom Colors', 'Logo Integration', 'Gradient Backgrounds', 'High Quality Export']
    }
  ];

  const generateQRCode = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = generateQRCode();
    link.download = 'qrcode.png';
    link.click();
  };

  const renderTool = () => {
    switch (selectedTool) {
      case 'color-gradient':
        return (
          <ColorGradientTool
            colorResult={colorResult}
            setColorResult={setColorResult}
            gradientColor1={gradientColor1}
            setGradientColor1={setGradientColor1}
            gradientColor2={gradientColor2}
            setGradientColor2={setGradientColor2}
            gradientDirection={gradientDirection}
            setGradientDirection={setGradientDirection}
            copyToClipboard={copyToClipboard}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        );

      case 'qr-generator':
        return (
          <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
            <QRGeneratorTool
              qrText={qrText}
              setQrText={setQrText}
              generateQRCode={generateQRCode}
              downloadQR={downloadQR}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/30 pb-24 md:pb-0">
      <AnimatePresence mode="wait">
        {!selectedTool ? (
          <motion.div
            key="tools-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10"
          >
            {/* Mobile Header */}
            {isMobile && (
              <div className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm border-b border-indigo-100">
                <div className="flex items-center justify-between p-4 pt-8 pl-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Dev Tools
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'pt-24 pb-32' : 'py-16'}`}>
              {/* Desktop Header */}
              {!isMobile && (
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Dev Tools
                    </h1>
                  </div>
                </div>
              )}

              {/* Tools Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedTool(tool.id)}
                    className="group bg-white rounded-3xl p-6 border border-gray-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    {/* Tool Icon */}
                    <div className="mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                        {tool.icon}
                      </div>
                    </div>

                    {/* Tool Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-500 uppercase tracking-wide">
                        {tool.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-1">
                      {tool.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-500">
                          <div className={`w-1 h-1 rounded-full bg-gradient-to-r ${tool.color} mr-2`}></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Launch Button */}
                    <div className="mt-6">
                      <div className={`w-full py-3 px-4 bg-gradient-to-r ${tool.color} text-white rounded-xl text-center font-medium text-sm transition-all group-hover:shadow-md`}>
                        Launch Tool
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Empty state for third column if needed */}
                {tools.length % 3 !== 0 && (
                  <div className="hidden lg:block"></div>
                )}
              </div>

              {/* Empty state if no tools */}
              {tools.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  <div className="bg-indigo-50 rounded-full p-6 mb-6">
                    <Wrench className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">No tools available</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    Development tools will appear here when they become available.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* Tool View */
          <motion.div
            key="tool-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Tool Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-indigo-100 shadow-sm">
              <div className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedTool('')}
                      className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </motion.button>
                    
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-r ${tools.find(t => t.id === selectedTool)?.color} rounded-xl shadow-md`}>
                        <div className="text-white">
                          {tools.find(t => t.id === selectedTool)?.icon}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {tools.find(t => t.id === selectedTool)?.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {tools.find(t => t.id === selectedTool)?.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tool options navigation */}
                  {selectedTool === 'color-gradient' && (
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      {tools.find(t => t.id === selectedTool)?.options?.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setActiveTab(option.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === option.id
                              ? 'bg-white text-indigo-600 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Tool Content */}
            <div className="w-full">
              {renderTool()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevTools;