import React from 'react';
import { Pill } from 'lucide-react';

const UNSPLASH_IMAGES = {
  tablets: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
  capsules: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80',
  supplies: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
};

interface MedicineImageProps {
  name: string;
  category: string;
  presentation: string;
  className?: string;
}

export const MedicineImage: React.FC<MedicineImageProps> = ({
  name,
  category,
  presentation,
  className = '',
}) => {
  const isSupply = /supply|equipment|dressing|protective/i.test(`${category} ${presentation}`);
  const isCapsule = /capsule/i.test(`${name} ${presentation}`);
  const image = isSupply ? UNSPLASH_IMAGES.supplies : isCapsule ? UNSPLASH_IMAGES.capsules : UNSPLASH_IMAGES.tablets;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-teal-50 via-sky-50 to-slate-100 ${className}`}>
      <div className="absolute inset-0 flex items-center justify-center text-brand-300">
        <Pill aria-hidden="true" className="h-12 w-12" strokeWidth={1.25} />
      </div>
      <img
        src={image}
        alt={`Illustrative ${presentation.toLowerCase()} image for ${name}; not product packaging`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-600 shadow-sm">
        Illustrative image
      </span>
    </div>
  );
};
