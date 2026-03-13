// WebSocket connections for real-time features

import { WS_BASE_URL } from '../config';
import { getStoredAccessToken } from '../store';

export class WebSocketManager {
  constructor() {
    this.ws = null;
    this.roomId = null;
    this.handlers = {};
    this.latestMessages = {};
  }

  connect(roomId) {
    if (this.ws && this.roomId === roomId && this.ws.readyState !== WebSocket.CLOSED) {
      return;
    }

    if (this.ws) {
      this.disconnect();
    }

    this.roomId = roomId;

    const url = new URL(`/ws/rooms/${roomId}/`, WS_BASE_URL);
    const token = getStoredAccessToken();
    if (token) {
      url.searchParams.set('token', token);
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected', roomId);
      this.emit('open', { roomId });
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type } = data;
        if (type) {
          this.latestMessages[type] = data;
        }

        if (type && this.handlers[type]) {
          this.emit(type, data);
        }
      } catch (err) {
        console.error('Invalid WS message', err);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected');
      this.emit('close', event);
    };

    this.ws.onerror = () => {
      this.emit('error', { roomId });
    };
  }

  emit(type, data) {
    this.handlers[type]?.forEach((callback) => callback(data));
  }

  on(type, callback, options = {}) {
    if (!this.handlers[type]) {
      this.handlers[type] = new Set();
    }

    this.handlers[type].add(callback);

    if (options.replayLatest && this.latestMessages[type] !== undefined) {
      callback(this.latestMessages[type]);
    }
  }

  off(type, callback) {
    this.handlers[type]?.delete(callback);
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.roomId = null;
    this.latestMessages = {};
  }
}

export const wsManager = new WebSocketManager();
