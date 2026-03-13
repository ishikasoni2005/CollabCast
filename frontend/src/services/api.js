import { API_BASE_URL } from '../config';
import { getStoredRefreshToken, useAuthStore } from '../store';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const getErrorMessage = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if ('error' in payload && typeof payload.error === 'string') {
    return payload.error;
  }

  if ('detail' in payload && typeof payload.detail === 'string') {
    return payload.detail;
  }

  if ('message' in payload && typeof payload.message === 'string') {
    return payload.message;
  }

  const firstValue = Object.values(payload)[0];
  if (typeof firstValue === 'string') {
    return firstValue;
  }

  if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
    return firstValue[0];
  }

  return null;
};

const jsonHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

async function request(path, init = {}, hasRetriedAuth = false) {
  const authorizationHeader = new Headers(init.headers ?? {}).get('Authorization');
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const text = await response.text();

  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authorizationHeader && path !== '/auth/refresh' && !hasRetriedAuth) {
      const refreshedToken = await refreshAccessToken();

      if (refreshedToken) {
        const retryHeaders = new Headers(init.headers ?? {});
        retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        return request(path, { ...init, headers: retryHeaders }, true);
      }

      useAuthStore.getState().logout();
      throw new ApiError('Authentication expired. Please sign in again.', response.status);
    }

    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new ApiError('Authentication expired. Please sign in again.', response.status);
    }

    throw new ApiError(
      getErrorMessage(payload) ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return payload;
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: jsonHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        });

        const text = await response.text();
        const payload = text ? JSON.parse(text) : {};

        if (!response.ok || !payload?.access) {
          useAuthStore.getState().logout();
          return null;
        }

        useAuthStore.getState().setTokens(payload.access, payload.refresh ?? null);
        return payload.access;
      } catch {
        useAuthStore.getState().logout();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export const api = {
  auth: {
    register: (username, email, password) =>
      request('/auth/register', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ username, email, password, password_confirm: password }),
      }),
    login: (email, password) =>
      request('/auth/login', {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ email, password }),
      }),
  },
  rooms: {
    create: (name, token) =>
      request('/rooms/create', {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify({ name }),
      }),
    get: (roomId, token) =>
      request(`/rooms/${roomId}`, {
        headers: authHeaders(token),
      }),
    join: (roomId, token) =>
      request(`/rooms/${roomId}/join`, {
        method: 'POST',
        headers: authHeaders(token),
      }),
    myRooms: (token) =>
      request('/rooms/my_rooms/', {
        headers: authHeaders(token),
      }),
    getInvite: (inviteCode) =>
      request(`/rooms/invite/${inviteCode}`),
    joinByInvite: (inviteCode, token) =>
      request(`/rooms/invite/${inviteCode}`, {
        method: 'POST',
        headers: authHeaders(token),
      }),
  },
  slides: {
    get: (roomId, token) =>
      request(`/slides/${roomId}`, {
        headers: authHeaders(token),
      }),
    create: (roomId, token, payload) =>
      request(`/slides/${roomId}`, {
        method: 'POST',
        headers: jsonHeaders(token),
        body: JSON.stringify(payload),
      }),
  },
  messages: {
    get: (roomId, token) =>
      request(`/messages/${roomId}`, {
        headers: authHeaders(token),
      }),
  },
};
