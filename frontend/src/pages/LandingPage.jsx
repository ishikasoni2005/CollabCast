import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { buildInvitePath, parseInviteCode } from '../invite';

const heroStats = [
  { value: 'Live', label: 'room presence' },
  { value: 'Instant', label: 'invite joins' },
  { value: 'Shared', label: 'slides and chat' },
];

const roomSignals = [
  { title: 'Presentation sync', description: 'Everyone sees slide updates as soon as they happen.' },
  { title: 'Built-in chat', description: 'Discuss the work without leaving the room context.' },
  { title: 'Voice ready', description: 'Jump in with camera and mic controls when the room starts.' },
];

const LandingPage = () => {
  const [inviteInput, setInviteInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoinInvite = () => {
    const inviteCode = parseInviteCode(inviteInput);

    if (!inviteCode) {
      setError('Paste a valid invite link or invite code.');
      return;
    }

    setError('');
    navigate(buildInvitePath(inviteCode));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#fff7ec_0%,#eef7ff_42%,#e0ecff_100%)] text-slate-950">
      <div className="landing-grid absolute inset-0 opacity-70" />
      <div className="landing-orb landing-orb-sky landing-float-slow left-[-5rem] top-[-4rem]" />
      <div className="landing-orb landing-orb-amber landing-float-fast bottom-[-6rem] right-[-3rem]" />
      <div className="landing-orb landing-orb-slate landing-float-slow right-[18%] top-[15%]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/20">
              CC
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">CollabCast</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live presentation rooms</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Start free
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
          <section className="landing-reveal max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-800 backdrop-blur">
              Realtime collaboration for rooms that move fast
            </div>

            <h1 className="mt-8 max-w-3xl font-['Georgia','Times_New_Roman',serif] text-5xl leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Present, talk, and iterate
              <span className="block text-sky-700">without breaking the room.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              CollabCast brings slides, live chat, voice, and invite-based room entry into one focused workflow for demos, classes, team reviews, and quick collaborative sessions.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Create a room
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                Open existing workspace
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="landing-card rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_20px_40px_rgba(148,163,184,0.12)] backdrop-blur">
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {roomSignals.map((signal) => (
                <div key={signal.title} className="rounded-[24px] border border-slate-200/80 bg-white/65 p-5 shadow-[0_18px_34px_rgba(148,163,184,0.08)] backdrop-blur">
                  <div className="mb-4 h-2 w-16 rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400" />
                  <p className="text-base font-semibold text-slate-950">{signal.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{signal.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="landing-card landing-reveal rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.26)] sm:p-8">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">Join a live room</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Paste an invite. Enter together.</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  Live ready
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Drop in a room link or invite code and we will guide you straight to the shared session experience.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
                <label htmlFor="inviteInput" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Invite link or code
                </label>
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    id="inviteInput"
                    type="text"
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
                        handleJoinInvite();
                      }
                    }}
                    placeholder="https://.../invite/abcd1234 or just abcd1234"
                    className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/20"
                  />
                  <button
                    type="button"
                    onClick={handleJoinInvite}
                    className="rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
                  >
                    Join by invite
                  </button>
                </div>
                {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Room snapshot</p>
                    <p className="mt-2 text-xl font-semibold text-white">Weekly product review</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">4 active</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl bg-white px-4 py-3 text-slate-900 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Slide sync</p>
                    <p className="mt-1 text-sm font-medium">Presentation is updating live for every participant.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chat pulse</p>
                    <p className="mt-1 text-sm text-slate-200">Messages appear inside the room, not buried in another app.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What friends see</p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">Open invite</div>
                  <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-slate-200">Authenticate if needed</div>
                  <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100">Join room in realtime</div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="pb-4 pt-2 text-sm text-slate-500">
          Designed for quick collaboration: rooms, invites, slide edits, voice, and chat in one flow.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
