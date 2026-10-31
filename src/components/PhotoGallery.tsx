import React, { useState } from 'react';
import { Play, Eye, X, ZoomIn, CheckCircle2, Sparkles } from 'lucide-react';
import { GALLERY_IMAGES } from '../data/adData';

interface PhotoGalleryProps {
  onPlayImageInVideo: (imagePath: string) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onPlayImageInVideo }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-red-950/70 border border-red-600/40 text-red-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold mb-3">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>تجهيزات فندقية وتكنولوجيا عالمية</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
          معرض صور فروع وتجهيزات معامل رامي مختار RT LAB
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          جميع الصور الحية الـ 13 المرفقة والمستخدمة في سيناريو الإعلان المرئي، تُبرز دقة الأجهزة وفخامة صالات الاستقبال وأجنحة سحب العينات وفريق العمل الطبي.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {GALLERY_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/60 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-red-950/40 flex flex-col"
          >
            {/* Image container */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-950">
              <img
                src={img.path}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

              {/* Number badge */}
              <span className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                صورة {idx + 1}
              </span>

              {/* Hover quick action overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-xs">
                <button
                  onClick={() => setSelectedPhoto(img.path)}
                  className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl shadow-lg border border-white/20 transition-transform hover:scale-110"
                  title="تكبير الصورة"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onPlayImageInVideo(img.path)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg text-xs font-bold transition-transform hover:scale-105"
                  title="تشغيل الإعلان بهذه الصورة"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>عرض في الفيديو</span>
                </button>
              </div>
            </div>

            {/* Label Footer */}
            <div className="p-3 bg-slate-900/80 flex-1 flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                {img.label}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 left-4 z-10 p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full border border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPhoto}
              alt="معاينة كاملة"
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            <div className="p-4 bg-slate-900 flex items-center justify-between gap-4">
              <span className="text-sm font-bold text-white">معامل رامي مختار RT LAB</span>
              <button
                onClick={() => {
                  onPlayImageInVideo(selectedPhoto);
                  setSelectedPhoto(null);
                }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>تشغيل الإعلان المرئي بهذه الصورة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
