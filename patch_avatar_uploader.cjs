const fs = require('fs');
let content = fs.readFileSync('src/components/AvatarUploader.tsx', 'utf8');

const newLogic = `
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
              localStorage.setItem(\`avatar_\${userId}\`, dataUrl);
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
`;

content = content.replace(/const handleFileChange = [\s\S]*?reader\.readAsDataURL\(file\);\n    }\n  };/, newLogic.trim());

fs.writeFileSync('src/components/AvatarUploader.tsx', content);
