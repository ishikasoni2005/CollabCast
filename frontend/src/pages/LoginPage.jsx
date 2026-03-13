import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildInvitePath } from '../invite';
import AuthShell from '../components/AuthShell';
import { api } from '../services/api';
import { useAuthStore } from '../store';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const inviteCode = searchParams.get('invite');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.auth.login(email, password);
      login(response.user, response.access, response.refresh);
      const inviteCode = searchParams.get('invite');
      navigate(inviteCode ? buildInvitePath(inviteCode) : '/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      accentLabel="Sign In"
      alternateHref={inviteCode ? `/register?invite=${encodeURIComponent(inviteCode)}` : '/register'}
      alternateLabel="Create an account"
      alternateText="Need a CollabCast account?"
      inviteCode={inviteCode}
      subtitle="Access your rooms, rejoin invites, and continue collaborating without losing your session context."
      title="Sign in to your workspace"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-700"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-slate-500">
          You will land {inviteCode ? 'back on your room invite' : 'on your dashboard'} right after login.
        </p>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
