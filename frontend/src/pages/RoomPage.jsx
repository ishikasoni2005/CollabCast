import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SlideEditor from '../components/SlideEditor';
import VideoGrid from '../components/VideoGrid';
import ChatPanel from '../components/ChatPanel';
import ParticipantsList from '../components/ParticipantsList';
import { api } from '../services/api';
import { getStoredAccessToken } from '../store';
import { wsManager } from '../websocket';
import { useRoomStore } from '../store';

const DEFAULT_SLIDE_BACKGROUND = '#fff7ed';

const RoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const setRoom = useRoomStore((s) => s.setRoom);
  const setParticipants = useRoomStore((s) => s.setParticipants);
  const setSlides = useRoomStore((s) => s.setSlides);
  const participants = useRoomStore((s) => s.participants);
  const slides = useRoomStore((s) => s.slides);
  const [roomName, setRoomName] = useState('');
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [roomError, setRoomError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    let isCancelled = false;

    const ensureAtLeastOneSlide = async (token, loadedSlides) => {
      if (loadedSlides.length > 0) {
        return loadedSlides;
      }

      const createdSlide = await api.slides.create(roomId, token, {
        title: 'Welcome slide',
        content: 'Start typing to collaborate live with everyone in this room.',
        background_color: DEFAULT_SLIDE_BACKGROUND,
      });

      wsManager.send('slide_created', { slide_id: createdSlide.id });
      return [createdSlide];
    };

    const initializeRoom = async () => {
      const token = getStoredAccessToken();
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setRoomError('');
        setIsRoomReady(false);
        await api.rooms.join(roomId, token);
        setRoom(roomId);
        wsManager.connect(roomId);

        const [roomData, slides] = await Promise.all([
          api.rooms.get(roomId, token),
          api.slides.get(roomId, token),
        ]);

        const ensuredSlides = await ensureAtLeastOneSlide(token, slides);

        if (isCancelled) {
          return;
        }

        const activeParticipants = Array.isArray(roomData.participants)
          ? roomData.participants
              .filter((participant) => participant.is_active)
              .map((participant) => participant.user)
          : [];

        setRoomName(roomData.name);
        setParticipants(activeParticipants);
        setSlides(Array.isArray(ensuredSlides) ? ensuredSlides : []);
        setIsRoomReady(true);
      } catch (e) {
        console.error('Failed to initialize room', e);
        if (!isCancelled) {
          setRoomError(e instanceof Error ? e.message : 'Unable to open this room.');
          setIsRoomReady(true);
        }
      }
    };

    void initializeRoom();

    return () => {
      isCancelled = true;
      wsManager.disconnect();
    };
  }, [navigate, roomId, setParticipants, setRoom, setSlides]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fffaf0_0%,#eef6ff_44%,#eef2ff_100%)] text-slate-950">
      <div className="landing-grid absolute inset-0 opacity-60" />
      <div className="landing-orb landing-orb-sky landing-float-slow left-[-6rem] top-[-5rem]" />
      <div className="landing-orb landing-orb-amber landing-float-fast bottom-[-6rem] right-[-3rem]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <main className="grid flex-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="min-h-[36rem]">
            <SlideEditor roomId={roomId} roomReady={isRoomReady} />
            {roomError ? (
              <div className="mt-4 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {roomError}
              </div>
            ) : null}
          </section>

          <section className="grid gap-6">
            <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(148,163,184,0.14)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Collaboration</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Voice and presence</h2>
                </div>
                <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Room live
                </div>
              </div>
              <VideoGrid />
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(148,163,184,0.14)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Room chat</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Discuss changes live</h2>
                </div>
              </div>
              <div className="h-[22rem]">
                <ChatPanel />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RoomPage;
