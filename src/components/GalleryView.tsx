import React, { useState } from 'react';
import { Image as ImageIcon, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { GalleryItem, GalleryCategory } from '../types';

interface GalleryViewProps {
  gallery: GalleryItem[];
}

export default function GalleryView({ gallery }: GalleryViewProps) {
  const [activeFilter, setActiveFilter] = useState<GalleryCategory | 'all'>('all');
  const [selectedItemIdx, setSelectedItemIdx] = useState<number | null>(null);

  const filters: { value: GalleryCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Photos' },
    { value: 'hospital', label: 'Hospital Campus' },
    { value: 'surgery', label: 'Surgeries' },
    { value: 'team', label: 'Our Team' },
    { value: 'camps', label: 'Outreach Camps' }
  ];

  // Filter list
  const filteredGallery = activeFilter === 'all'
    ? gallery
    : gallery.filter(item => item.category === activeFilter);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIdx !== null && filteredGallery.length > 0) {
      setSelectedItemIdx((selectedItemIdx + 1) % filteredGallery.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIdx !== null && filteredGallery.length > 0) {
      setSelectedItemIdx((selectedItemIdx - 1 + filteredGallery.length) % filteredGallery.length);
    }
  };

  return (
    <div className="w-full flex flex-col py-12 px-4 bg-slate-50" id="gallery-view-container">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Gallery Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/60 px-3 py-1 rounded-full">Our Gallery</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            A Glimpse Into Our Hospital
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Take a visual tour of our advanced consultation rooms, sterile operation complexes, and rural screening eye camps across Odisha.
          </p>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center" id="gallery-filter-tabs">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setActiveFilter(f.value);
                setSelectedItemIdx(null);
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                activeFilter === f.value
                  ? 'text-white bg-blue-600 shadow-sm'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="gallery-image-grid">
            {filteredGallery.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemIdx(idx)}
                className="bg-white border border-slate-150 p-3 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group text-left flex flex-col"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Floating category */}
                  <span className="absolute top-3 left-3 text-[10px] font-bold font-mono uppercase tracking-wider bg-slate-900/85 backdrop-blur text-white px-2.5 py-1 rounded-md border border-white/10">
                    {item.category}
                  </span>
                  {/* Hover overlay indicator */}
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-slate-800 transform scale-90 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <div className="mt-3 px-1 flex flex-col justify-between flex-grow">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{item.title}</h4>
                  <span className="block text-[10px] text-slate-400 font-mono mt-1">
                    Captured: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No photos found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal Carousel */}
      {selectedItemIdx !== null && filteredGallery[selectedItemIdx] && (
        <div
          onClick={() => setSelectedItemIdx(null)}
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-[999] animate-in fade-in duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedItemIdx(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Carousel contents */}
          <div className="relative w-full max-w-4xl flex flex-col gap-4 items-center">
            {/* Navigation buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 p-2 rounded-2xl max-w-full overflow-hidden shadow-2xl flex flex-col gap-3"
            >
              <img
                src={filteredGallery[selectedItemIdx].image}
                alt={filteredGallery[selectedItemIdx].title}
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
              <div className="px-4 py-2 text-left">
                <span className="inline-block text-[10px] font-bold font-mono uppercase tracking-wider text-blue-400 mb-1">
                  {filteredGallery[selectedItemIdx].category}
                </span>
                <h3 className="text-white font-bold text-base sm:text-lg">
                  {filteredGallery[selectedItemIdx].title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
