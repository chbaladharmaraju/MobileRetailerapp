import { useState, useRef } from 'react';
import { HiOutlineCamera, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { getImageUrl } from '../../utils/imageUrl';

const PhotoUpload = ({ label, photos = [], onChange, maxFiles = 5, accept = 'image/*' }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files?.length) return;

    const remaining = maxFiles - photos.length;
    if (remaining <= 0) return;

    setUploading(true);
    const newPhotos = [...photos];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = localStorage.getItem('ag_token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/uploads`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          newPhotos.push(data.url);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }

    onChange(newPhotos);
    setUploading(false);
  };

  const removePhoto = (idx) => {
    const updated = photos.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-[11px] font-semibold text-ag-text-dim uppercase tracking-[0.18em] ml-1 mb-1 block">
          {label}
        </label>
      )}

      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-ag-border aspect-square">
              <img src={getImageUrl(url)} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HiOutlineX className="w-3.5 h-3.5 text-ag-text" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxFiles && (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-ag-border hover:border-ag-border bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-ag-border border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <HiOutlineCamera className="w-5 h-5 text-ag-text-dim" />
                <HiOutlinePhotograph className="w-5 h-5 text-ag-text-dim" />
              </div>
              <p className="text-xs text-ag-text-muted text-center">
                Tap to take photo or upload
                <br />
                <span className="text-[10px] text-ag-text-dim">{photos.length}/{maxFiles} photos</span>
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default PhotoUpload;
