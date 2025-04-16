// hooks/useDiagramExport.js
import { useCallback } from 'react';

export const useDiagramExport = () => {
  const exportToImage = useCallback(async (svgOutput, format = 'png') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Create SVG data URL
    const svgBlob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Set high DPI for better quality
        const scale = window.devicePixelRatio || 2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.scale(scale, scale);
        
        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL(`image/${format}`);
        URL.revokeObjectURL(svgUrl);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  });

  return { exportToImage };
};
