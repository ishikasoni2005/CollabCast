import { useEffect, useMemo } from 'react';
import { useRoomStore } from '../store';
import { wsManager } from '../websocket';

const SlideViewer = () => {
  const slides = useRoomStore((s) => s.slides);
  const currentSlide = useRoomStore((s) => s.currentSlide);
  const upsertSlide = useRoomStore((s) => s.upsertSlide);
  const activeSlide = useMemo(() => slides[currentSlide] ?? slides[0] ?? null, [currentSlide, slides]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.slide) {
        upsertSlide(data.slide);
      }
    };
    wsManager.on('slide_update', handler);
    return () => {
      wsManager.off('slide_update', handler);
    };
  }, [upsertSlide]);

  if (!activeSlide) {
    return (
      <div className="flex h-full items-center justify-center rounded-[30px] bg-white text-slate-500">
        No slide selected yet.
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-[30px] p-10 text-black"
      style={{ backgroundColor: activeSlide.background_color }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Slide {activeSlide.order}
        </p>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">
          {activeSlide.title || 'Untitled slide'}
        </h2>
        <p className="mt-6 whitespace-pre-wrap text-2xl leading-[1.5] text-slate-800">
          {activeSlide.content}
        </p>
      </div>
    </div>
  );
};

export default SlideViewer;
