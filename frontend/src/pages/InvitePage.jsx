import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, api } from '../services/api';
import { buildInvitePath, buildInviteUrl, copyInviteLink } from '../invite';
import { getStoredAccessToken, useAuthStore } from '../store';

const InvitePage = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasAttemptedAutoJoin, setHasAttemptedAutoJoin] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  const loginPath = useMemo(
    () => `/login${inviteCode ? `?invite=${encodeURIComponent(inviteCode)}` : ''}`,
    [inviteCode],
  );
  const registerPath = useMemo(
    () => `/register${inviteCode ? `?invite=${encodeURIComponent(inviteCode)}` : ''}`,
    [inviteCode],
  );
  const inviteUrl = useMemo(
    () => (inviteCode ? buildInviteUrl(inviteCode) : ''),
    [inviteCode],
  );

  useEffect(() => {
    if (!inviteCode) {
      setError('Invite link is missing.');
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const loadInvite = async () => {
      try {
        setError('');
        const response = await api.rooms.getInvite(inviteCode);
        if (!isCancelled) {
          setRoom(response);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load invite.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInvite();

    return () => {
      isCancelled = true;
    };
  }, [inviteCode]);

  const handleJoin = async () => {
    if (!inviteCode) {
      setError('Invite link is missing.');
      return;
    }

    const token = getStoredAccessToken();
    if (!token) {
      navigate(loginPath);
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      const response = await api.rooms.joinByInvite(inviteCode, token);
      navigate(`/room/${response.room.id}`);
    } catch (joinError) {
      if (joinError instanceof ApiError && joinError.status === 401) {
        logout();
        navigate(loginPath, { replace: true });
        return;
      }

      setError(joinError instanceof Error ? joinError.message : 'Unable to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  useEffect(() => {
    if (!room || !user || hasAttemptedAutoJoin) {
      return;
    }

    setHasAttemptedAutoJoin(true);
    void handleJoin();
  }, [hasAttemptedAutoJoin, room, user]);

  const handleCopyInvite = async () => {
    if (!inviteCode) {
      return;
    }

    try {
      await copyInviteLink(inviteCode);
      setCopyStatus('Invite link copied');
      window.setTimeout(() => {
        setCopyStatus('');
      }, 2000);
    } catch {
      setCopyStatus('Unable to copy invite link');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white shadow rounded-xl p-8">
        <p className="text-sm uppercase tracking-wide text-indigo-600 font-semibold">Room Invite</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {room ? room.name : 'Join CollabCast Room'}
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          {room
            ? `${room.created_by} invited you to collaborate live.`
            : 'Open the invite to join a room in real time.'}
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {isLoading ? <p className="text-sm text-gray-500">Loading invite details...</p> : null}
          {!isLoading && room ? (
            <>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Invite Link</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => void handleCopyInvite()}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Copy
                </button>
              </div>
              {copyStatus ? <p className="mt-2 text-sm text-gray-500">{copyStatus}</p> : null}
              <p className="text-sm text-gray-700">
                Active participants: <span className="font-semibold">{room.participants_count}</span>
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Capacity: <span className="font-semibold">{room.max_participants}</span>
              </p>
            </>
          ) : null}
          {!isLoading && !room && !error ? (
            <p className="text-sm text-gray-500">Invite details are unavailable.</p>
          ) : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {user ? (
            <button
              type="button"
              onClick={handleJoin}
              disabled={isJoining || !room}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {isJoining ? 'Joining room...' : 'Join Room Now'}
            </button>
          ) : (
            <>
              <Link
                to={loginPath}
                className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium text-center hover:bg-indigo-700"
              >
                Login To Join
              </Link>
              <Link
                to={registerPath}
                className="w-full rounded-lg border border-indigo-600 px-4 py-3 text-indigo-600 font-medium text-center hover:bg-indigo-50"
              >
                Create Account And Join
              </Link>
            </>
          )}
          {inviteCode ? (
            <Link to={buildInvitePath(inviteCode)} className="text-sm text-center text-gray-500 hover:text-gray-700">
              Refresh invite
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
