import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildInvitePath } from '../invite';
import AuthShell from '../components/AuthShell';
import { api } from '../services/api';
import { useAuthStore } from '../store';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.auth.register(username, email, password);
      login(response.user, response.access, response.refresh);
      navigate(inviteCode ? buildInvitePath(inviteCode) : '/dashboard');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      accentLabel="Create Account"
      alternateHref={inviteCode ? `/login?invite=${encodeURIComponent(inviteCode)}` : '/login'}
      alternateLabel="Sign in"
      alternateText="Already working with an account?"
      inviteCode={inviteCode}
      subtitle="Create your identity once and you can jump into shared rooms, invites, and live sessions instantly."
      title="Create your CollabCast account"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-800">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Choose a display name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-800">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-500">
          {inviteCode ? 'Your invite will still be waiting after signup.' : 'Start collaborating in minutes.'}
        </p>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
