'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  image: string;
  onComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ image, onComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async () => {
    try {
      const imageElement = await createImage(image);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx || !croppedAreaPixels) return;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      return new Promise<string>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          resolve(url);
        }, 'image/jpeg', 0.95);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onComplete(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Ajustar Imagem</h3>
          <button
            onClick={onCancel}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[60vh] bg-black/50 rounded-3xl overflow-hidden mb-6">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: {
                backgroundColor: 'transparent',
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          {/* Zoom */}
          <div className="bg-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <ZoomOut className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <ZoomIn className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Rotation */}
          <div className="bg-white/[0.05] rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <RotateCw className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="text-sm text-gray-400 w-12 text-right">{rotation}°</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-white py-4 px-6 rounded-2xl font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
