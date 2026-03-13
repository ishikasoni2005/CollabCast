import { create } from 'zustand';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const USER_STORAGE_KEY = 'user';

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const getStoredAccessToken = () => getStorage()?.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? null;
export const getStoredRefreshToken = () => getStorage()?.getItem(REFRESH_TOKEN_STORAGE_KEY) ?? null;

export const getStoredUser = () => {
  const rawUser = getStorage()?.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: getStoredAccessToken(),
  login: (user, token, refreshToken) => {
    const storage = getStorage();
    storage?.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    storage?.setItem(ACCESS_TOKEN_STORAGE_KEY, token);

    if (refreshToken) {
      storage?.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    set({ user, token });
  },
  setTokens: (token, refreshToken) => {
    const storage = getStorage();
    storage?.setItem(ACCESS_TOKEN_STORAGE_KEY, token);

    if (refreshToken) {
      storage?.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    set({ token });
  },
  logout: () => {
    const storage = getStorage();
    storage?.removeItem(USER_STORAGE_KEY);
    storage?.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    storage?.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    set({ user: null, token: null });
  },
}));

const sortSlides = (slides) => [...slides].sort((left, right) => left.order - right.order);

export const useRoomStore = create((set) => ({
  currentRoom: null,
  participants: [],
  slides: [],
  currentSlide: 0,
  setRoom: (roomId) => set({ currentRoom: roomId, participants: [], slides: [], currentSlide: 0 }),
  setParticipants: (participants) => set({ participants: [...new Set(participants)] }),
  addParticipant: (participant) =>
    set((state) => ({
      participants: state.participants.includes(participant)
        ? state.participants
        : [...state.participants, participant],
    })),
  removeParticipant: (participant) =>
    set((state) => ({
      participants: state.participants.filter((entry) => entry !== participant),
    })),
  setSlides: (slides) =>
    set((state) => {
      const sortedSlides = sortSlides(slides);
      const maxIndex = Math.max(sortedSlides.length - 1, 0);
      return {
        slides: sortedSlides,
        currentSlide: Math.min(state.currentSlide, maxIndex),
      };
    }),
  upsertSlide: (slide) =>
    set((state) => {
      const existingIndex = state.slides.findIndex((entry) => entry.id === slide.id);
      const slides = existingIndex >= 0
        ? state.slides.map((entry) => (entry.id === slide.id ? { ...entry, ...slide } : entry))
        : [...state.slides, slide];

      return { slides: sortSlides(slides) };
    }),
  updateSlide: (id, changes) =>
    set((state) => ({
      slides: sortSlides(state.slides.map((s) => (s.id === id ? { ...s, ...changes } : s))),
    })),
  setCurrentSlide: (index) => set({ currentSlide: index }),
}));
