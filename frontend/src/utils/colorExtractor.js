/**
 * Get color hue based on flavor name (fallback)
 */
export const getFlavorColor = (flavorName) => {
  const name = flavorName?.toLowerCase() || '';
  
  // Chaser for pods flavors
  if (name.includes('виноград') || name.includes('grape')) {
    return 280; // Purple
  } else if (name.includes('вишня') || name.includes('cherry')) {
    return 350; // Red/Pink
  } else if (name.includes('смородина') || name.includes('currant')) {
    return 270; // Purple
  } else if (name.includes('ментол') || name.includes('menthol')) {
    return 180; // Cyan/Blue
  } else if (name.includes('яблуко') || name.includes('apple')) {
    return 120; // Green
  } else if (name.includes('полуниця') || name.includes('strawberry')) {
    return 340; // Red
  }
  
  // Sticks for IQOS flavors
  else if (name.includes('амброзия') || name.includes('ambrosia')) {
    return 45; // Orange/Yellow
  } else if (name.includes('бронзове') || name.includes('бронзовое') || name.includes('bronze')) {
    return 30; // Orange/Bronze
  } else if (name.includes('світанок') || name.includes('рассвет') || name.includes('dawn')) {
    return 15; // Yellow/Orange
  } else if (name.includes('зелений тютюн') || name.includes('зеленый табак') || name.includes('green tobacco')) {
    return 120; // Green
  } else if (name.includes('жовтий тютюн') || name.includes('желтый табак') || name.includes('yellow tobacco')) {
    return 50; // Yellow
  } else if (name.includes('сірий тютюн') || name.includes('серый табак') || name.includes('grey tobacco') || name.includes('gray tobacco')) {
    return 25; // Brown/Yellow
  } else if (name.includes('свіжість') || name.includes('свежесть') || name.includes('fresh')) {
    return 180; // Cyan/Blue
  } else if (name.includes('м\'ята') || name.includes('мята') || name.includes('mint')) {
    return 160; // Cyan/Green
  } else if (name.includes('смарагд') || name.includes('изумруд') || name.includes('emerald')) {
    return 140; // Green/Cyan
  } else if (name.includes('класичний') || name.includes('классический') || name.includes('classic')) {
    return 25; // Brown/Tobacco
  }
  
  return 140; // Default purple
};

/**
 * Extract dominant color from an image
 * @param {string} imageUrl - URL of the image
 * @param {string} flavorName - Name of the flavor for fallback
 * @returns {Promise<number>} - Hue value (0-360) for Galaxy hueShift
 */
export const extractColorFromImage = (imageUrl, flavorName = null) => {
  return new Promise((resolve) => {
    const img = new Image();
    // Try without crossOrigin first, as it might cause CORS issues
    img.crossOrigin = 'anonymous';
    
    const timeout = setTimeout(() => {
      console.warn('Image load timeout, using fallback color');
      resolve(flavorName ? getFlavorColor(flavorName) : 140);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Limit canvas size for performance
        const maxSize = 500;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const scale = maxSize / Math.max(width, height);
          width = width * scale;
          height = height * scale;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Sample multiple areas: center, bottom-center (where liquid usually is)
        const samples = [
          { x: width * 0.5, y: height * 0.5, size: Math.min(width, height) * 0.4 },
          { x: width * 0.5, y: height * 0.7, size: Math.min(width, height) * 0.3 },
          { x: width * 0.3, y: height * 0.6, size: Math.min(width, height) * 0.25 },
          { x: width * 0.7, y: height * 0.6, size: Math.min(width, height) * 0.25 },
        ];
        
        let totalR = 0, totalG = 0, totalB = 0;
        let totalCount = 0;
        
        samples.forEach(sample => {
          const sampleSize = Math.max(10, Math.min(sample.size, width, height));
          const x = Math.max(0, Math.min(sample.x - sampleSize / 2, width - sampleSize));
          const y = Math.max(0, Math.min(sample.y - sampleSize / 2, height - sampleSize));
          const w = Math.min(sampleSize, width - x);
          const h = Math.min(sampleSize, height - y);
          
          try {
            const imageData = ctx.getImageData(x, y, w, h);
            const pixels = imageData.data;
            
            for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              const brightness = (r + g + b) / 3;
              
              // Include pixels with moderate brightness and some saturation
              if (brightness > 20 && brightness < 240) {
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const saturation = max > 0 ? (max - min) / max : 0;
                
                // Prefer pixels with some color (not grayscale)
                if (saturation > 0.1) {
                  totalR += r;
                  totalG += g;
                  totalB += b;
                  totalCount++;
                }
              }
            }
          } catch (e) {
            console.warn('Error sampling area:', e);
          }
        });
        
        if (totalCount === 0) {
          // Fallback to flavor-based color or default
          resolve(flavorName ? getFlavorColor(flavorName) : 140);
          return;
        }
        
        const avgR = Math.floor(totalR / totalCount);
        const avgG = Math.floor(totalG / totalCount);
        const avgB = Math.floor(totalB / totalCount);
        
        // Convert RGB to HSV
        const hsv = rgbToHsv(avgR, avgG, avgB);
        
        // Ensure hue is valid (0-360)
        let hue = Math.floor(hsv.h);
        if (isNaN(hue) || hue < 0) hue = 140;
        if (hue > 360) hue = hue % 360;
        
        console.log('Extracted color:', { r: avgR, g: avgG, b: avgB, hue });
        resolve(hue);
      } catch (error) {
        console.error('Error extracting color:', error);
        resolve(flavorName ? getFlavorColor(flavorName) : 140);
      }
    };
    
    img.onerror = (error) => {
      clearTimeout(timeout);
      console.warn('Image load error, using fallback color:', error);
      resolve(flavorName ? getFlavorColor(flavorName) : 140);
    };
    
    // Try to load image
    img.src = imageUrl;
  });
};

/**
 * Convert RGB to HSV
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  
  if (diff !== 0) {
    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) % 6;
    } else if (max === g) {
      h = (b - r) / diff + 2;
    } else {
      h = (r - g) / diff + 4;
    }
  }
  
  h /= 6;
  
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  
  return {
    h: h * 360,
    s: s * 100,
    v: v * 100
  };
}

