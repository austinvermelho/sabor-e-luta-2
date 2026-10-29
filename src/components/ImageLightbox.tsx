import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>
      <img
        src={images[currentIndex]}
        alt="Foto em tamanho ampliado"
        className="max-w-4xl max-h-[90vh] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
