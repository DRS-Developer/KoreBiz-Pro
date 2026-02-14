import { Area } from 'react-easy-crop';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient';
  color: string;
  gradient?: string; // CSS gradient string e.g., "linear-gradient(to right, #ff0000, #0000ff)"
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  filters: ImageFilters = { brightness: 100, contrast: 100, saturation: 100 },
  background: BackgroundConfig = { type: 'solid', color: '#ffffff' },
  objectFit: 'contain' | 'cover' = 'cover'
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the pixel crop size (final output size)
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw background
  if (objectFit === 'contain') {
    if (background.type === 'solid') {
      ctx.fillStyle = background.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (background.type === 'gradient' && background.gradient) {
      // Parse simple linear gradient for canvas (simplified)
      // Note: Full CSS gradient parsing to Canvas is complex. 
      // For this MVP, we might stick to solid color or basic implementation.
      // Or we can try to create a gradient based on the string.
      // Fallback to solid color for safety if parsing fails or just use the first color
      ctx.fillStyle = background.color; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // TODO: Implement proper canvas gradient from CSS string if needed
      // For now, let's assume the user picks a solid color or we implement a basic 2-color linear gradient helper
    }
  }

  // Save context for filter application
  ctx.save();

  // Filter application
  ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;

  // We need to draw the image such that the cropped area is what ends up on the canvas.
  // The pixelCrop contains coordinates relative to the original image (rotated).
  
  // However, react-easy-crop logic is: we have an image, we transform it (rotate/zoom/pan), and the "crop" area is what we see.
  // getCroppedImg traditionally draws the rotated image onto a canvas large enough to hold it, then extracts the crop.
  // But here we want to compose the image ONTO the final canvas size directly, possibly with background.

  // Strategy:
  // 1. Create a temporary canvas to hold the rotated and filtered image
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = bBoxWidth;
  tempCanvas.height = bBoxHeight;
  const tempCtx = tempCanvas.getContext('2d');
  
  if (!tempCtx) return null;

  tempCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
  tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  tempCtx.rotate(rotRad);
  tempCtx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  tempCtx.translate(-image.width / 2, -image.height / 2);
  tempCtx.drawImage(image, 0, 0);

  // 2. Draw the cropped portion from tempCanvas to the main canvas
  // If objectFit is cover (default crop), we just take the pixelCrop area from tempCanvas
  if (objectFit === 'cover') {
    ctx.drawImage(
      tempCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
  } else {
    // If objectFit is contain, the "pixelCrop" from react-easy-crop represents the area of the MEDIA that is visible.
    // But we want the output canvas to be fixed size (e.g. 800x600) and the image scaled down inside it.
    // Wait, react-easy-crop 'contain' mode behaves differently.
    // If we use 'contain', the crop area might be larger than the image?
    // Actually, simpler approach for "Fit to Canvas":
    // The user sees the image inside the box with background.
    // The "crop" rect in UI matches the output aspect ratio.
    // We should draw the FULL image (rotated/filtered) into the canvas, scaling it to fit, preserving aspect ratio.
    
    // Calculating "Fit" dimensions
    const scale = Math.min(canvas.width / bBoxWidth, canvas.height / bBoxHeight);
    const drawWidth = bBoxWidth * scale;
    const drawHeight = bBoxHeight * scale;
    const offsetX = (canvas.width - drawWidth) / 2;
    const offsetY = (canvas.height - drawHeight) / 2;

    ctx.drawImage(
        tempCanvas,
        0, 0, bBoxWidth, bBoxHeight, // Source (full rotated image)
        offsetX, offsetY, drawWidth, drawHeight // Dest (scaled and centered)
    );
  }

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg', 0.9);
  });
}
