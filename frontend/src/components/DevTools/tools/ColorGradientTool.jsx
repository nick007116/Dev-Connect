import React, { useState, useCallback, useMemo } from 'react';
import { 
  Copy, 
  Download, 
  Palette, 
  Eye, 
  Shuffle, 
  Heart,
  Plus,
  Minus,
  Save,
  RefreshCw,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ColorGradientTool.css'; // You'll need to create this CSS file

const ColorGradientTool = ({
  colorResult,
  setColorResult,
  gradientColor1,
  setGradientColor1,
  gradientColor2,
  setGradientColor2,
  gradientDirection,
  setGradientDirection,
  copyToClipboard,
  activeTab,
  setActiveTab
}) => {
  const [gradientColors, setGradientColors] = useState([gradientColor1, gradientColor2]);
  const [gradientType, setGradientType] = useState('linear');
  const [radialPosition, setRadialPosition] = useState('center');
  const [angle, setAngle] = useState(90);
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [colorHistory, setColorHistory] = useState([]);
  const [copied, setCopied] = useState('');

  // Trending color palettes with more variety
  const trendingPalettes = [
    { name: 'Sunset Vibes', colors: ['#ff6b6b', '#ffd93d', '#6bcf7f'] },
    { name: 'Ocean Dreams', colors: ['#667eea', '#764ba2', '#6dd5ed'] },
    { name: 'Purple Haze', colors: ['#a8edea', '#fed6e3', '#ff9a9e'] },
    { name: 'Cosmic Dust', colors: ['#ee9ca7', '#ffdde1', '#4facfe'] },
    { name: 'Forest Mist', colors: ['#56ab2f', '#a8e6cf', '#dcedc8'] },
    { name: 'Fire Storm', colors: ['#f12711', '#f5af19', '#ff8008'] },
    { name: 'Ice Crystal', colors: ['#667eea', '#764ba2', '#a8edea'] },
    { name: 'Neon Night', colors: ['#12c2e9', '#c471ed', '#f64f59'] },
    { name: 'Autumn Leaves', colors: ['#d2691e', '#ff4500', '#ffd700'] },
    { name: 'Sky Blue', colors: ['#87ceeb', '#4169e1', '#191970'] },
    { name: 'Rose Gold', colors: ['#f7e7ce', '#e8b4cb', '#d8a7ca'] },
    { name: 'Emerald', colors: ['#50c878', '#3cb371', '#2e8b57'] }
  ];

  // Color conversion utilities
  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }, []);

  const rgbToHsl = useCallback((r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0; break; // Added default case
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }, []);

  const getColorFormats = useCallback((hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return {};
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
    };
  }, [hexToRgb, rgbToHsl]);

  // Generate random colors
  const generateRandomColor = useCallback(() => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  }, []);

  const generateRandomGradient = useCallback(() => {
    const colors = Array.from({ length: Math.floor(Math.random() * 3) + 2 }, generateRandomColor);
    setGradientColors(colors);
    setGradientColor1(colors[0]);
    setGradientColor2(colors[1]);
  }, [generateRandomColor, setGradientColor1, setGradientColor2]);

  // Advanced gradient generation with stops
  const currentGradient = useMemo(() => {
    const colors = gradientColors.join(', ');
    if (gradientType === 'linear') {
      return `linear-gradient(${angle}deg, ${colors})`;
    } else if (gradientType === 'radial') {
      return `radial-gradient(circle at ${radialPosition}, ${colors})`;
    } else if (gradientType === 'conic') {
      return `conic-gradient(from ${angle}deg at ${radialPosition}, ${colors})`;
    }
    return `linear-gradient(${angle}deg, ${colors})`;
  }, [gradientColors, gradientType, angle, radialPosition]);

  // Copy with feedback
  const handleCopy = useCallback(async (text, label) => {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }, [copyToClipboard]);

  // Color management functions
  const addColor = useCallback(() => {
    const newColor = generateRandomColor();
    setGradientColors(prev => [...prev, newColor]);
  }, [generateRandomColor]);

  const removeColor = useCallback((index) => {
    if (gradientColors.length > 2) {
      setGradientColors(prev => prev.filter((_, i) => i !== index));
    }
  }, [gradientColors.length]);

  const updateColor = useCallback((index, color) => {
    setGradientColors(prev => prev.map((c, i) => i === index ? color : c));
    if (index === 0) setGradientColor1(color);
    if (index === 1) setGradientColor2(color);
  }, [setGradientColor1, setGradientColor2]);

  // Save/Load palette functions
  const savePalette = useCallback(() => {
    const palette = {
      id: Date.now(),
      colors: [...gradientColors],
      type: gradientType,
      angle,
      position: radialPosition,
      name: `Palette ${savedPalettes.length + 1}`
    };
    setSavedPalettes(prev => [palette, ...prev.slice(0, 11)]);
  }, [gradientColors, gradientType, angle, radialPosition, savedPalettes.length]);

  const loadPalette = useCallback((palette) => {
    setGradientColors(palette.colors);
    setGradientType(palette.type);
    setAngle(palette.angle);
    setRadialPosition(palette.position);
    setGradientColor1(palette.colors[0]);
    setGradientColor2(palette.colors[1]);
  }, [setGradientColor1, setGradientColor2]);

  // Download gradient
  const downloadGradient = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradientColors.forEach((color, index) => {
      gradient.addColorStop(index / (gradientColors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const link = document.createElement('a');
    link.download = `gradient-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, [gradientColors]);

  // Color harmony generation
  const generateHarmony = useCallback((baseColor, type) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [baseColor];
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [baseColor];
    
    switch (type) {
      case 'complementary':
        colors.push(`hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        break;
      case 'triadic':
        colors.push(`hsl(${(hsl.h + 120) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(`hsl(${(hsl.h + 240) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        break;
      case 'analogous':
        colors.push(`hsl(${(hsl.h + 30) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(`hsl(${(hsl.h - 30 + 360) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        break;
      case 'tetradic':
        colors.push(`hsl(${(hsl.h + 90) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(`hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        colors.push(`hsl(${(hsl.h + 270) % 360}, ${hsl.s}%, ${hsl.l}%)`);
        break;
      default:
        colors = [baseColor]; // Added default case
        break;
    }
    
    return colors;
  }, [hexToRgb, rgbToHsl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full h-screen flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* Gradient Tab */}
            {activeTab === 'gradient' && (
              <motion.div
                key="gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full"
              >
                <div className="max-w-7xl mx-auto p-4 lg:p-6">
                  {/* Quick Controls */}
                  <div className="mb-6">
                    <div className="bg-white rounded-3xl p-3 lg:p-5 shadow-lg border border-gray-200">
                      <div className="flex flex-col gap-3 md:gap-4">
                        {/* Color Swatches Row */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Colors:</span>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {gradientColors.map((color, index) => (
                              <div key={index} className="relative group">
                                <input
                                  type="color"
                                  value={color}
                                  onChange={(e) => updateColor(index, e.target.value)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg md:rounded-xl border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                />
                                {gradientColors.length > 2 && (
                                  <button
                                    onClick={() => removeColor(index)}
                                    className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={addColor}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg md:rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-colors"
                            >
                              <Plus className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Type Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Type:</span>
                            <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-1">
                              {['linear', 'radial', 'conic'].map(type => (
                                <button
                                  key={type}
                                  onClick={() => setGradientType(type)}
                                  className={`px-2 py-1 rounded-md text-xs transition-all capitalize ${
                                    gradientType === type
                                      ? 'bg-white text-purple-600 shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Position Control */}
                          {(gradientType === 'radial' || gradientType === 'conic') && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Position:</span>
                              <select
                                value={radialPosition}
                                onChange={(e) => setRadialPosition(e.target.value)}
                                className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white min-w-[80px]"
                              >
                                <option value="center">Center</option>
                                <option value="top">Top</option>
                                <option value="bottom">Bottom</option>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                                <option value="top left">Top Left</option>
                                <option value="top right">Top Right</option>
                                <option value="bottom left">Bottom Left</option>
                                <option value="bottom right">Bottom Right</option>
                              </select>
                            </div>
                          )}

                          {/* Angle Control */}
                          <div className="flex items-center gap-2 flex-1 min-w-[150px] max-w-xs">
                            <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">Angle:</span>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={angle}
                              onChange={(e) => setAngle(Number(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-xs md:text-sm text-gray-500 w-8 text-right">{angle}°</span>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-1 md:gap-2 ml-auto">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={generateRandomGradient}
                              className="p-2 md:p-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
                              aria-label="Random gradient"
                            >
                              <Shuffle className="w-3 h-3 md:w-4 md:h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleCopy(currentGradient, 'gradient')}
                              className={`p-2 md:p-3 rounded-xl transition-colors ${
                                copied === 'gradient'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                              }`}
                              aria-label="Copy gradient CSS"
                            >
                              {copied === 'gradient' ? <Eye className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={downloadGradient}
                              className="p-2 md:p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors"
                              aria-label="Download gradient"
                            >
                              <Download className="w-3 h-3 md:w-4 md:h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main content area with sidebar in flex layout */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main preview area */}
                    <div className="flex-1">
                      <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-lg border border-gray-200">
                        <div className="h-[350px] lg:h-[450px] relative overflow-hidden rounded-2xl">
                          {/* Current gradient view */}
                          <div
                            className="w-full h-full transition-all duration-300"
                            style={{ background: currentGradient }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Sidebar layout */}
                    <div className="lg:w-96">
                      <div className="space-y-6">
                        {/* Color Management Box */}
                        <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-200">
                          <h3 className="font-semibold mb-3">Color Management</h3>
                          <div className="max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                            <div className="space-y-2">
                              {gradientColors.map((color, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200"
                                >
                                  <input
                                    type="color"
                                    value={color}
                                    onChange={(e) => updateColor(index, e.target.value)}
                                    className="w-6 h-6 rounded-md border border-gray-200"
                                  />
                                  <input
                                    type="text"
                                    value={color}
                                    onChange={(e) => updateColor(index, e.target.value)}
                                    className="flex-1 px-2 py-1 border border-gray-200 rounded-lg font-mono text-xs bg-white"
                                  />
                                  {gradientColors.length > 2 && (
                                    <button
                                      onClick={() => removeColor(index)}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Palettes Box */}
                        <div className="bg-white rounded-3xl p-4 shadow-lg border border-gray-200">
                          <h3 className="font-semibold mb-3">Quick Palettes</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {trendingPalettes.slice(0, 4).map((palette, index) => (
                              <button
                                key={index}
                                onClick={() => setGradientColors([...palette.colors])}
                                className="p-2 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all"
                              >
                                <div
                                  className="h-6 rounded-lg mb-1"
                                  style={{
                                    background: `linear-gradient(135deg, ${palette.colors.join(', ')})`
                                  }}
                                />
                                <div className="text-xs font-medium text-center truncate">{palette.name}</div>
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={savePalette}
                            className="w-full mt-3 p-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium flex items-center justify-center gap-2 text-sm"
                          >
                            <Save className="w-3 h-3" />
                            Save Palette
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CSS Output Section at Bottom - Always visible */}
                  <div className="mt-6">
                    <div className="bg-white rounded-3xl p-4 lg:p-6 shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">CSS Output</h3>
                        <div className="text-xs text-gray-500">{gradientColors.length} stops</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">CSS Code:</span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCopy(currentGradient, 'css-output')}
                            className={`p-2 rounded-lg transition-all ${
                              copied === 'css-output'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                          >
                            {copied === 'css-output' ? <Eye className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </motion.button>
                        </div>
                        <div className="font-mono text-sm text-gray-700 break-all bg-white p-3 rounded-lg border">
                          background: {currentGradient};
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Color Picker Tab */}
            {activeTab === 'picker' && (
              <motion.div
                key="picker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-full p-4 lg:p-6"
              >
                <div className="max-w-4xl mx-auto">
                  {/* Enhanced Color Picker - Full Width */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20">
                    <h3 className="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-3">
                      <Palette className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
                      Color Picker
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          type="color"
                          value={colorResult}
                          onChange={(e) => {
                            setColorResult(e.target.value);
                            setColorHistory(prev => [e.target.value, ...prev.slice(0, 9)]);
                          }}
                          className="w-full h-40 lg:h-48 rounded-3xl border-4 border-white shadow-lg cursor-pointer"
                        />
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                      </div>

                      {/* Enhanced Color Formats */}
                      <div className="space-y-4">
                        {Object.entries(getColorFormats(colorResult)).map(([format, value]) => (
                          <div key={format} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <label className="w-14 text-sm font-medium uppercase text-gray-600">
                              {format}
                            </label>
                            <div className="flex-1 flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={value}
                                readOnly
                                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCopy(value, format)}
                                className={`p-3 rounded-2xl transition-all ${
                                  copied === format
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                                }`}
                              >
                                {copied === format ? <Eye className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </motion.button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Enhanced Color History */}
                      {colorHistory.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Recent Colors</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {colorHistory.map((color, index) => (
                              <motion.button
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setColorResult(color)}
                                className="aspect-square rounded-2xl border-2 border-white shadow-md hover:shadow-lg transition-shadow"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Random Color Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setColorResult(generateRandomColor())}
                          className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium flex items-center justify-center gap-2"
                        >
                          <Shuffle className="w-4 h-4" />
                          Generate Random Color
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Palettes Tab */}
            {activeTab === 'palettes' && (
              <motion.div
                key="palettes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 lg:p-6"
              >
                <div className="max-w-7xl mx-auto space-y-8">
                  {/* Enhanced Trending Palettes */}
                  <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20">
                    <h3 className="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-3">
                      <Star className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />
                      Trending Palettes
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {trendingPalettes.map((palette, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.02, y: -2 }}
                          onClick={() => setGradientColors([...palette.colors])}
                          className="cursor-pointer bg-white rounded-2xl p-4 shadow-md border hover:shadow-lg transition-all"
                        >
                          <div
                            className="h-20 lg:h-24 rounded-2xl mb-3"
                            style={{
                              background: `linear-gradient(135deg, ${palette.colors.join(', ')})`
                            }}
                          />
                          <h4 className="font-semibold text-center text-sm">{palette.name}</h4>
                          <div className="flex justify-center gap-1 mt-2">
                            {palette.colors.map((color, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full border border-white"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Saved Palettes */}
                  {savedPalettes.length > 0 && (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-xl border border-white/20">
                      <h3 className="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-3">
                        <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-red-500" />
                        Saved Palettes
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {savedPalettes.map((palette) => (
                          <motion.div
                            key={palette.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            onClick={() => loadPalette(palette)}
                            className="cursor-pointer bg-white rounded-2xl p-4 shadow-md border hover:shadow-lg transition-all"
                          >
                            <div
                              className="h-16 lg:h-20 rounded-2xl mb-3"
                              style={{
                                background: `linear-gradient(135deg, ${palette.colors.join(', ')})`
                              }}
                            />
                            <h4 className="font-semibold text-center text-sm">{palette.name}</h4>
                            <p className="text-xs text-gray-500 text-center mt-1">
                              {palette.type} • {palette.colors.length} colors
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ColorGradientTool;