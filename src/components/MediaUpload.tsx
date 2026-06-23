import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, Check, Loader2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';

interface MediaUploadProps {
  bucketName: 'vehicle-images' | 'vehicle-videos' | 'blog-images' | 'company-assets';
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  currentUrl?: string;
  onClearUrl?: () => void;
  label?: string;
}

export function MediaUpload({
  bucketName,
  onUploadSuccess,
  onUploadError,
  currentUrl,
  onClearUrl,
  label = 'Upload Media Asset'
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setLocalError(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    // Validate video for video bucket
    if (bucketName === 'vehicle-videos' && !file.type.startsWith('video/')) {
      const errMsg = 'Please select a valid video file.';
      setLocalError(errMsg);
      if (onUploadError) onUploadError(errMsg);
      return;
    }

    // Validate images for others
    if (bucketName !== 'vehicle-videos' && !file.type.startsWith('image/')) {
      const errMsg = 'Please select a valid image file.';
      setLocalError(errMsg);
      if (onUploadError) onUploadError(errMsg);
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setLocalError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^\w.-]/g, '').substring(0, 15);
      const fileName = `${Date.now()}-${sanitizedName}.${fileExt}`;
      const filePath = `${fileName}`;

      // Simulating a progress bar steps during upload request
      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 80 ? prev + 15 : prev));
      }, 300);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressTimer);

      if (error) {
        throw error;
      }

      setProgress(100);

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
        onUploadSuccess(publicUrl);
      }, 500);

    } catch (err: any) {
      setIsUploading(false);
      setProgress(0);
      const errMsg = err.message || 'Storage uploading failed.';
      setLocalError(errMsg);
      if (onUploadError) onUploadError(errMsg);
    }
  };

  const handleDeleteMedia = async () => {
    if (!currentUrl) return;

    try {
      // Extract file name from URL (usually the last part)
      const urlParts = currentUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (fileName) {
        await supabase.storage
          .from(bucketName)
          .remove([fileName]);
      }
    } catch (e) {
      console.warn('Unable to delete remote storage file:', e);
    }

    if (onClearUrl) {
      onClearUrl();
    }
  };

  // Determine if URL is a video
  const isVideo = currentUrl?.includes('.mp4') || currentUrl?.includes('.mov') || currentUrl?.includes('.webm') || bucketName === 'vehicle-videos';

  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block">{label}</label>}
      
      {currentUrl ? (
        <div className="relative border border-slate-200 rounded-xl p-4 bg-white flex items-center gap-4 transition-all hover:border-slate-300">
          {/* Preview panel */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center relative">
            {isVideo ? (
              <video src={currentUrl} className="w-full h-full object-cover" muted />
            ) : (
              <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
            )}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/5 flex items-center justify-center">
              {isVideo ? <VideoIcon className="w-4 h-4 text-white drop-shadow-md" /> : <ImageIcon className="w-4 h-4 text-white drop-shadow-md" />}
            </div>
          </div>

          {/* Url specs info */}
          <div className="flex-grow space-y-1 overflow-hidden">
            <span className="text-[10px] font-mono bg-green-50 text-green-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-bold">
              <Check className="w-3 h-3" /> Ready
            </span>
            <p className="text-[11px] font-mono text-slate-400 truncate max-w-full">{currentUrl}</p>
          </div>

          {/* Delete action */}
          <button
            type="button"
            onClick={handleDeleteMedia}
            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-xl transition cursor-pointer"
            title="Delete media from storage"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelectFile}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            isDragging
              ? 'border-gold-500 bg-gold-50/20'
              : 'border-slate-250 bg-slate-50 hover:bg-slate-100 hover:border-slate-350'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept={bucketName === 'vehicle-videos' ? 'video/*' : 'image/*'}
          />

          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-3 w-full py-2">
              <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
              <div className="w-full max-w-xs bg-slate-200 rounded-full h-1.5 dark:bg-slate-300 overflow-hidden">
                <div className="bg-gold-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold">Uploading to cloud storage... {progress}%</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-white rounded-full shadow-sm border border-slate-150">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 font-sans font-semibold text-center">
                Drag & drop or <span className="text-gold-650 hover:underline">browse files</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono text-center">
                Supports {bucketName === 'vehicle-videos' ? 'Videos (MP4, MOV)' : 'Images (PNG, JPG, WebP)'}
              </p>
            </>
          )}
        </div>
      )}

      {localError && (
        <p className="text-[11px] text-red-650 font-mono font-bold">{localError}</p>
      )}
    </div>
  );
}
