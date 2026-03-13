import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildInvitePath, copyInviteLink, parseInviteCode } from '../invite';
import { api } from '../services/api';
import { getStoredAccessToken, useAuthStore } from '../store';

const workspaceSignals = [
  {
    title: 'Invite-first rooms',
    description: 'Share one link and bring new collaborators into the room without extra setup.',
  },
  {
    title: 'Realtime activity',
    description: 'Slides, chat, voice, and presence update inside the same shared space.',
  },
  {
    title: 'Ready to present',
    description: 'Move from planning to live presentation without switching tools mid-session.',
  },
];

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedInviteCode, setCopiedInviteCode] = useState(null);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const totalParticipants = rooms.reduce((count, room) => count + room.participants_count, 0);

  useEffect(() => {
    const loadRooms = async () => {
      const token = getStoredAccessToken();
      if (!token) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.rooms.myRooms(token);
        setRooms(Array.isArray(data) ? data : []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load rooms.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadRooms();
  }, []);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    const token = getStoredAccessToken();
    if (!token) {
      setError('Sign in to create a room.');
      return;
    }

    try {
      setError('');
      await api.rooms.create(newRoomName.trim(), token);
      const refreshedRooms = await api.rooms.myRooms(token);
      setRooms(Array.isArray(refreshedRooms) ? refreshedRooms : []);
      setNewRoomName('');
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create room.');
    }
  };

  const handleCopyInvite = async (inviteCode) => {
    try {
      await copyInviteLink(inviteCode);
      setCopiedInviteCode(inviteCode);
      window.setTimeout(() => {
        setCopiedInviteCode((currentCode) => (currentCode === inviteCode ? null : currentCode));
      }, 2000);
    } catch {
      setError('Unable to copy invite link.');
    }
  };

  const handleJoinByInvite = () => {
    const inviteCode = parseInviteCode(inviteInput);

    if (!inviteCode) {
      setError('Paste a valid invite link or invite code.');
      return;
    }

    setError('');
    navigate(buildInvitePath(inviteCode));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fff9ef_0%,#eff6ff_44%,#eef2ff_100%)] text-slate-950">
      <div className="landing-grid absolute inset-0 opacity-60" />
      <div className="landing-orb landing-orb-sky landing-float-slow left-[-5rem] top-[-5rem]" />
      <div className="landing-orb landing-orb-amber landing-float-fast right-[-4rem] top-[8rem]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/70 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.14)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              {user
                ? `Signed in as ${user.username}. Create rooms, invite friends, and jump back into live sessions.`
                : 'Sign in to create rooms and collaborate in real time.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-[24px] border border-slate-200 bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/10">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-semibold">{rooms.length}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Rooms</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-semibold">{totalParticipants}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Participants</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-2xl font-semibold">{rooms.length > 0 ? 'On' : 'Idle'}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Status</p>
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-8">
            <div className="rounded-[34px] bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Control center</p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Keep your rooms moving without losing the flow.
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                    Spin up a new collaborative room, share an invite instantly, or jump back into an existing session when your team is ready.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {workspaceSignals.map((signal) => (
                    <div key={signal.title} className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                      <div className="mb-3 h-2 w-12 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300" />
                      <p className="text-sm font-semibold text-white">{signal.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{signal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Create room</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Start a fresh session</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Give your room a clear name, invite collaborators, and start working live right away.
                </p>
                <div className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Product review, Demo rehearsal, Team sync..."
                    value={newRoomName}
                    onChange={(e) => {
                      setNewRoomName(e.target.value);
                      if (error) {
                        setError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void createRoom();
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                  />
                  <button
                    type="button"
                    onClick={() => void createRoom()}
                    className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Create room
                  </button>
                </div>
              </section>

              <section className="rounded-[30px] border border-white/70 bg-white/75 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Join by invite</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Enter a shared room fast</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Paste any invite link or invite code and we will route you to the room join flow automatically.
                </p>
                <div className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Paste invite link or code"
                    value={inviteInput}
                    onChange={(e) => {
                      setInviteInput(e.target.value);
                      if (error) {
                        setError('');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleJoinByInvite();
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                  <button
                    type="button"
                    onClick={handleJoinByInvite}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-200 to-amber-100 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:brightness-105"
                  >
                    Join by invite
                  </button>
                </div>
              </section>
            </div>

            {error ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                {error}
              </div>
            ) : null}
          </section>

          <section className="rounded-[34px] border border-white/70 bg-white/75 p-6 shadow-[0_22px_70px_rgba(148,163,184,0.16)] backdrop-blur">
            <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Your rooms</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent collaboration spaces</h2>
              </div>
              <p className="text-sm text-slate-500">
                {rooms.length === 0 ? 'No active rooms yet.' : `${rooms.length} room${rooms.length === 1 ? '' : 's'} available`}
              </p>
            </div>

            {isLoading ? (
              <div className="mt-6 space-y-4">
                {[1, 2, 3].map((placeholder) => (
                  <div key={placeholder} className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 animate-pulse">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-4 h-3 w-48 rounded bg-slate-200" />
                    <div className="mt-6 h-10 rounded-2xl bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : null}

            {!isLoading && rooms.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">No rooms yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create a room on the left and your collaboration spaces will appear here with quick invite actions.
                </p>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(148,163,184,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(148,163,184,0.18)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Room {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 className="mt-2 truncate text-xl font-semibold text-slate-950">{room.name}</h3>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {room.participants_count} participant{room.participants_count === 1 ? '' : 's'}
                        </span>
                        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                          Invite {room.invite_code}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Join state</p>
                      <p className="mt-1 text-sm font-semibold">Ready now</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Invite path</p>
                    <p className="mt-1 truncate text-sm text-slate-700">{buildInvitePath(room.invite_code)}</p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/room/${room.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open room
                    </Link>
                    <Link
                      to={buildInvitePath(room.invite_code)}
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View invite
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleCopyInvite(room.invite_code)}
                      className="inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      {copiedInviteCode === room.invite_code ? 'Invite copied' : 'Copy invite link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
