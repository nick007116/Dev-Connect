import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, 
  Upload, 
  Copy, 
  Eye, 
  QrCode,
  Share2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRGeneratorTool = ({ qrText, setQrText, generateQRCode, downloadQR }) => {
  const [qrColor, setQrColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientColor2, setGradientColor2] = useState('#6366f1');
  const [gradientDirection, setGradientDirection] = useState('45');
  const [size, setSize] = useState(256);
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(20);
  const [activeTab, setActiveTab] = useState('colors');
  const [copied, setCopied] = useState('');
  const [borderRadius, setBorderRadius] = useState(0);
  const [customQRUrl, setCustomQRUrl] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const presetColors = [
    '#000000', '#1f2937', '#374151', '#6b7280',
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
    '#06b6d4', '#84cc16', '#f59e0b', '#10b981'
  ];

  // Generate QR Code with customizations applied
  const generateAdvancedQRCode = useCallback(() => {
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      data: qrText,
      size: `${size}x${size}`,
      ecc: 'H',
      margin: 10,
      format: 'png'
    });

    params.append('color', qrColor.replace('#', ''));
    params.append('bgcolor', backgroundColor.replace('#', ''));

    return `${baseUrl}?${params.toString()}`;
  }, [qrText, size, qrColor, backgroundColor]);

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Apply color customizations
  const applyCustomizations = (ctx) => {
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      if (r < 128 && g < 128 && b < 128 && alpha > 0) {
        const color = hexToRgb(qrColor);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Add logo to perfect center of QR code with optimal sizing
  const addLogoToQR = (ctx) => {
    return new Promise((resolve) => {
      const logoImg = new Image();
      logoImg.onload = () => {
        const maxLogoSize = Math.min(logoSize, 25);
        const logoSizePx = (size * maxLogoSize) / 100;
        
        const x = (size - logoSizePx) / 2;
        const y = (size - logoSizePx) / 2;

        const padding = logoSizePx * 0.15;
        const backgroundRadius = (logoSizePx + padding) / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, backgroundRadius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, logoSizePx, logoSizePx, logoSizePx * 0.1);
        ctx.clip();
        ctx.drawImage(logoImg, x, y, logoSizePx, logoSizePx);
        ctx.restore();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        resolve();
      };
      logoImg.src = logo;
    });
  };

  // Create custom styled QR code using canvas
  const generateCustomQRCode = useCallback(async () => {
    if (!qrText.trim()) return '';

    try {
      const canvas = canvasRef.current;
      if (!canvas) return generateAdvancedQRCode();

      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;

      const baseQR = new Image();
      baseQR.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        baseQR.onload = () => {
          ctx.clearRect(0, 0, size, size);

          if (gradientEnabled) {
            const gradient = ctx.createLinearGradient(
              0, 0, 
              Math.cos((gradientDirection * Math.PI) / 180) * size,
              Math.sin((gradientDirection * Math.PI) / 180) * size
            );
            gradient.addColorStop(0, backgroundColor);
            gradient.addColorStop(1, gradientColor2);
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = backgroundColor;
          }
          ctx.fillRect(0, 0, size, size);

          ctx.drawImage(baseQR, 0, 0, size, size);

          applyCustomizations(ctx);

          if (logo) {
            addLogoToQR(ctx).then(() => {
              const dataUrl = canvas.toDataURL('image/png');
              setCustomQRUrl(dataUrl);
              resolve(dataUrl);
            });
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            setCustomQRUrl(dataUrl);
            resolve(dataUrl);
          }
        };

        baseQR.src = generateAdvancedQRCode();
      });
    } catch (error) {
      console.error('Error generating custom QR:', error);
      return generateAdvancedQRCode();
    }
  }, [qrText, qrColor, backgroundColor, gradientEnabled, gradientColor2, gradientDirection, 
      size, logo, logoSize, borderRadius, generateAdvancedQRCode]);

  // Regenerate QR code when settings change
  useEffect(() => {
    if (qrText.trim()) {
      generateCustomQRCode();
    }
  }, [qrText, generateCustomQRCode]);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadAdvancedQR = async () => {
    const qrUrl = customQRUrl || await generateCustomQRCode();
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `custom-qrcode-${Date.now()}.png`;
    link.click();
  };

  const shareQR = async () => {
    const qrUrl = customQRUrl || await generateCustomQRCode();
    if (navigator.share) {
      try {
        const canvas = canvasRef.current;
        canvas.toBlob(async (blob) => {
          const file = new File([blob], 'qrcode.png', { type: 'image/png' });
          await navigator.share({
            title: 'Custom QR Code',
            text: 'Check out this custom QR code!',
            files: [file]
          });
        });
      } catch (error) {
        console.error('Error sharing:', error);
        handleCopy(qrUrl, 'share');
      }
    } else {
      handleCopy(qrUrl, 'share');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              QR Code Content
            </h3>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Enter your content
              </label>
              <textarea
                value={qrText}
                onChange={(e) => setQrText(e.target.value)}
                placeholder="Enter text, URL, or any content..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                rows={4}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Customization</h3>
              <div className="flex bg-gray-100 rounded-xl p-1 text-xs">
                {['colors', 'style'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'colors' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">QR Code Color</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={qrColor}
                          onChange={(e) => setQrColor(e.target.value)}
                          className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                        />
                        <div className="flex flex-wrap gap-2">
                          {presetColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setQrColor(color)}
                              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                                qrColor === color ? 'border-purple-500 scale-110' : 'border-gray-200 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={gradientEnabled}
                            onChange={(e) => setGradientEnabled(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">Enable Gradient Background</span>
                        </label>
                      </div>

                      {gradientEnabled && (
                        <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                          <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600">Second Color:</label>
                            <input
                              type="color"
                              value={gradientColor2}
                              onChange={(e) => setGradientColor2(e.target.value)}
                              className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Direction: {gradientDirection}°</label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={gradientDirection}
                              onChange={(e) => setGradientDirection(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                      />
                      <div className="flex flex-wrap gap-2">
                        {['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#1f2937', '#111827'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setBackgroundColor(color)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              backgroundColor === color ? 'border-purple-500 scale-110' : 'border-gray-200 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'style' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">QR Code Size</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="256"
                        max="1024"
                        step="32"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-600 w-16">{size}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Border Radius</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-600 w-12">{borderRadius}px</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Center Logo (Optional)</label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {logo ? (
                          <div className="relative">
                            <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-xl border-2 border-gray-200" />
                            <button
                              onClick={removeLogo}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-all"
                          >
                            <Upload className="w-6 h-6 text-gray-400" />
                          </button>
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-2">
                            Upload a logo to place in the center of your QR code
                          </p>
                          <p className="text-xs text-gray-500">
                            Recommended: Square images work best • Max 25% for optimal scanning
                          </p>
                        </div>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      
                      {logo && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Logo Size: {logoSize}%
                            {logoSize > 20 && (
                              <span className="text-xs text-amber-600 ml-2">
                                ⚠️ Large logos may affect scanning
                              </span>
                            )}
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="25"
                            value={logoSize}
                            onChange={(e) => setLogoSize(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Small (10%)</span>
                            <span className="text-amber-600">Recommended (20%)</span>
                            <span>Max (25%)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 sticky top-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">QR Code Preview</h3>
              
              <div className="flex justify-center">
                {qrText.trim().length > 0 ? (
                  <div className="relative">
                    <div 
                      className="border border-gray-300 shadow-sm overflow-hidden"
                      style={{ 
                        width: size > 300 ? 300 : size, 
                        height: size > 300 ? 300 : size,
                        borderRadius: `${borderRadius}px`
                      }}
                    >
                      {customQRUrl ? (
                        <img
                          src={customQRUrl}
                          alt="Custom QR Code"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={generateAdvancedQRCode()}
                          alt="QR Code"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {logo && logoSize > 20 && (
                      <div className="absolute -bottom-8 left-0 right-0 text-xs text-amber-600 text-center">
                        Large logo may reduce scan reliability
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-72 h-72 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                    <QrCode className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm">Enter content to generate QR code</span>
                  </div>
                )}
              </div>

              {qrText.trim().length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Size: {size}×{size}px</div>
                    <div>Error Correction: High</div>
                    <div>Logo: {logo ? `${logoSize}%` : 'None'}</div>
                    <div>Gradient: {gradientEnabled ? 'Yes' : 'No'}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={downloadAdvancedQR}
                    disabled={qrText.trim().length === 0}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={shareQR}
                    disabled={qrText.trim().length === 0}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(customQRUrl || generateAdvancedQRCode(), 'url')}
                  disabled={qrText.trim().length === 0}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all font-medium ${
                    copied === 'url'
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {copied === 'url' ? <Eye className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'url' ? 'Copied!' : 'Copy URL'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGeneratorTool;