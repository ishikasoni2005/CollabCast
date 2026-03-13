import { Link } from 'react-router-dom';

const highlights = [
  {
    title: 'Live collaboration',
    description: 'Slides, messages, and call activity stay in sync while your room is active.',
  },
  {
    title: 'Invite-ready',
    description: 'Share a room link and let teammates jump straight into the session.',
  },
  {
    title: 'Presentation friendly',
    description: 'Built for quick standups, demos, class sessions, and creative reviews.',
  },
];

const AuthShell = ({
  accentLabel,
  alternateHref,
  alternateLabel,
  alternateText,
  children,
  inviteCode,
  subtitle,
  title,
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7fbff_0%,#eef6ff_48%,#fff6ea_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-[-5rem] h-56 w-56 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-3rem] h-72 w-72 rounded-full bg-amber-200/70 blur-3xl" />
        <div className="absolute right-[12%] top-[12%] h-28 w-28 rounded-full border border-sky-200/70 bg-white/50" />
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[32px] bg-slate-900 px-8 py-10 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:px-10 lg:min-h-[720px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.16),transparent_30%)]" />
          <div className="relative flex h-full flex-col">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
                {accentLabel}
              </span>
              <h1 className="mt-6 max-w-lg text-4xl font-semibold tracking-tight sm:text-5xl">
                Welcome back to live collaboration that actually feels alive.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                CollabCast keeps your room, slides, voice, and chat in one place so teammates can join quickly and stay aligned.
              </p>
            </div>

            {inviteCode ? (
              <div className="relative mt-8 rounded-2xl border border-sky-200/20 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">Invite detected</p>
                <p className="mt-2 text-lg font-medium text-white">You are joining a shared room invite.</p>
                <p className="mt-2 text-sm text-slate-200">
                  Finish authentication and we will take you right back to the invite flow.
                </p>
                <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-sky-100">
                  Code: {inviteCode}
                </p>
              </div>
            ) : null}

            <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div key={highlight.title} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">{highlight.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{highlight.description}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-auto pt-10">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-5">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Built for shared rooms</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-100">
                  <span className="rounded-full bg-white/10 px-3 py-1">Instant room joins</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Live chat</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">Voice and video</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)] backdrop-blur sm:p-8 lg:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{accentLabel}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
              {alternateText}{' '}
              <Link to={alternateHref} className="font-semibold text-sky-700 transition hover:text-sky-900">
                {alternateLabel}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthShell;
