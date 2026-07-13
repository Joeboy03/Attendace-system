import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

interface AvatarUploaderProps {
  userId: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUploader({ userId, name, size = 'md' }: AvatarUploaderProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`avatar_${userId}`);
      if (saved) setAvatar(saved);
    }
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setAvatar(dataUrl);
          if (userId) {
            try {
              localStorage.setItem(`avatar_${userId}`, dataUrl);
            } catch (error) {
              console.error("Storage full or disabled", error);
              alert("Image is too large or local storage is disabled.");
            }
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const dimensions = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-20 h-20 text-3xl'
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleClick} title="Update profile picture">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className={`${dimensions[size]} bg-purple-900 rounded-full flex items-center justify-center font-bold text-white shadow-inner overflow-hidden border-2 border-transparent group-hover:border-purple-300 transition-all`}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          name ? name.charAt(0).toUpperCase() : 'U'
        )}
      </div>
      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
        <Camera className="w-4 h-4" />
      </div>
    </div>
  );
}
