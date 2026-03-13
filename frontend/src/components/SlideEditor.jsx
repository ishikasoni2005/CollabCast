import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getStoredAccessToken, useRoomStore } from '../store';
import { wsManager } from '../websocket';

const DEFAULT_SLIDE_BACKGROUND = '#fff7ed';

const SlideEditor = ({ roomId, roomReady }) => {
  const slides = useRoomStore((state) => state.slides);
  const currentSlide = useRoomStore((state) => state.currentSlide);
  const setCurrentSlide = useRoomStore((state) => state.setCurrentSlide);
  const updateSlide = useRoomStore((state) => state.updateSlide);
  const upsertSlide = useRoomStore((state) => state.upsertSlide);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftBackground, setDraftBackground] = useState(DEFAULT_SLIDE_BACKGROUND);
  const [isCreatingSlide, setIsCreatingSlide] = useState(false);
  const [status, setStatus] = useState('');

  const activeSlide = slides[currentSlide] ?? null;

  useEffect(() => {
    if (!activeSlide) {
      setDraftTitle('');
      setDraftContent('');
      setDraftBackground(DEFAULT_SLIDE_BACKGROUND);
      return;
    }

    setDraftTitle(activeSlide.title);
    setDraftContent(activeSlide.content);
    setDraftBackground(activeSlide.background_color);
  }, [activeSlide]);

  useEffect(() => {
    const normalizeSlide = (slide) => ({
      ...slide,
    });

    const updateHandler = (data) => {
      if (data?.slide) {
        upsertSlide(normalizeSlide(data.slide));
      }
    };

    const createdHandler = (data) => {
      if (data?.slide) {
        upsertSlide(normalizeSlide(data.slide));
      }
    };

    wsManager.on('slide_update', updateHandler);
    wsManager.on('slide_created', createdHandler);

    return () => {
      wsManager.off('slide_update', updateHandler);
      wsManager.off('slide_created', createdHandler);
    };
  }, [upsertSlide]);

  const broadcastSlideUpdate = (changes) => {
    if (!activeSlide) {
      return;
    }

    updateSlide(activeSlide.id, changes);
    wsManager.send('slide_update', {
      slide_id: activeSlide.id,
      updates: changes,
    });
  };

  const handleTitleChange = (value) => {
    setDraftTitle(value);
    broadcastSlideUpdate({ title: value });
  };

  const handleContentChange = (value) => {
    setDraftContent(value);
    broadcastSlideUpdate({ content: value });
  };

  const handleBackgroundChange = (value) => {
    setDraftBackground(value);
    broadcastSlideUpdate({ background_color: value });
  };

  const handleCreateSlide = async () => {
    if (!roomId) {
      setStatus('Join a room before creating slides.');
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      setStatus('Authentication required to create slides.');
      return;
    }

    try {
      setIsCreatingSlide(true);
      setStatus('');
      const nextSlide = await api.slides.create(roomId, token, {
        title: `Slide ${slides.length + 1}`,
        content: 'Start typing to collaborate live...',
        background_color: DEFAULT_SLIDE_BACKGROUND,
      });

      const nextSlides = [...slides, nextSlide].sort((left, right) => left.order - right.order);
      const nextIndex = nextSlides.findIndex((slide) => slide.id === nextSlide.id);

      upsertSlide(nextSlide);
      setCurrentSlide(nextIndex >= 0 ? nextIndex : 0);
      wsManager.send('slide_created', { slide_id: nextSlide.id });
      setStatus('New slide added to the room.');
    } catch (createError) {
      setStatus(createError instanceof Error ? createError.message : 'Unable to create a new slide.');
    } finally {
      setIsCreatingSlide(false);
    }
  };

  if (!roomReady) {
    return (
      <div className="flex h-full items-center justify-center rounded-[28px] border border-slate-200/80 bg-white/85 p-8 text-center shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Preparing room</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Setting up live collaboration</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            We are loading room details, participants, and slide state so everyone stays in sync.
          </p>
        </div>
      </div>
    );
  }

  if (!activeSlide) {
    return (
      <div className="flex h-full flex-col justify-between rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Slides</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">No slides yet</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
            Create the first slide to start collaborating. New slides will appear for other room members in real time.
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <button
            type="button"
            onClick={() => void handleCreateSlide()}
            disabled={isCreatingSlide}
            className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCreatingSlide ? 'Creating first slide...' : 'Create first slide'}
          </button>
          {status ? <p className="mt-3 text-sm text-slate-500">{status}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-[28px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Slide deck</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{slides.length} slides</h2>
          </div>
          <button
            type="button"
            onClick={() => void handleCreateSlide()}
            disabled={isCreatingSlide}
            className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            {isCreatingSlide ? 'Adding...' : 'Add slide'}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`w-full rounded-[22px] border p-4 text-left transition ${
                  isActive
                    ? 'border-sky-300 bg-sky-50 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div
                  className="mb-3 h-16 rounded-2xl border border-black/5"
                  style={{ backgroundColor: slide.background_color }}
                />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Slide {slide.order}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                  {slide.title || `Untitled slide ${slide.order}`}
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">
                  {slide.content || 'No content yet'}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_rgba(148,163,184,0.12)] backdrop-blur">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Live editor</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Editing slide {activeSlide.order}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Every change you make here is broadcast to the room over websockets for all connected members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Live sync active
            </div>
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Background
              <input
                type="color"
                value={draftBackground}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border-none bg-transparent p-0"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <input
            value={draftTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-2xl font-semibold tracking-tight text-slate-950 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Give this slide a title"
          />

          <div
            className="rounded-[28px] border border-slate-200 p-5 shadow-inner"
            style={{ backgroundColor: draftBackground }}
          >
            <textarea
              value={draftContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="h-[24rem] w-full resize-none rounded-[22px] border border-black/10 bg-white/90 p-5 text-base leading-7 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              placeholder="Write the content everyone in the room should see..."
            />
          </div>

          <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
            <p>
              Slide updates are shared live with everyone connected to this room. Selected slide changes stay local to your workspace.
            </p>
            {status ? <p className="font-medium text-slate-700">{status}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SlideEditor;
