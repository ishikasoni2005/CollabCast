import Peer from 'simple-peer/simplepeer.min.js';
import { wsManager } from '../websocket';
import { getStoredUser } from '../store';

export class WebRTCManager {
  constructor() {
    this.peers = new Map();
    this.localStream = null;
    this.remoteStreamHandlers = new Set();
    this.peerClosedHandlers = new Set();
    this.microphoneEnabled = true;
    this.cameraEnabled = true;
  }

  applyLocalMediaState() {
    if (!this.localStream) {
      return;
    }

    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = this.microphoneEnabled;
    });

    this.localStream.getVideoTracks().forEach((track) => {
      track.enabled = this.cameraEnabled;
    });
  }

  async getUserMedia() {
    if (this.localStream) {
      this.applyLocalMediaState();
      return this.localStream;
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.applyLocalMediaState();
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getMicrophoneEnabled() {
    return this.microphoneEnabled;
  }

  getCameraEnabled() {
    return this.cameraEnabled;
  }

  setMicrophoneEnabled(enabled) {
    this.microphoneEnabled = enabled;
    this.applyLocalMediaState();
    return this.microphoneEnabled;
  }

  toggleMicrophone() {
    return this.setMicrophoneEnabled(!this.microphoneEnabled);
  }

  setCameraEnabled(enabled) {
    this.cameraEnabled = enabled;
    this.applyLocalMediaState();
    return this.cameraEnabled;
  }

  toggleCamera() {
    return this.setCameraEnabled(!this.cameraEnabled);
  }

  hasPeer(peerId) {
    return this.peers.has(peerId);
  }

  onRemoteStream(callback) {
    this.remoteStreamHandlers.add(callback);
  }

  offRemoteStream(callback) {
    this.remoteStreamHandlers.delete(callback);
  }

  onPeerClosed(callback) {
    this.peerClosedHandlers.add(callback);
  }

  offPeerClosed(callback) {
    this.peerClosedHandlers.delete(callback);
  }

  createPeer(peerId, initiator, stream) {
    const existingPeer = this.peers.get(peerId);
    if (existingPeer) {
      return existingPeer;
    }

    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
    });

    peer.on('signal', (data) => {
      const user = getStoredUser()?.username;
      if (!user) {
        return;
      }

      wsManager.send('webrtc_signal', { from_user: user, to_user: peerId, signal: data });
    });

    peer.on('stream', (remoteStream) => {
      this.remoteStreamHandlers.forEach((callback) => callback(peerId, remoteStream));
    });

    peer.on('close', () => {
      this.peers.delete(peerId);
      this.peerClosedHandlers.forEach((callback) => callback(peerId));
    });

    peer.on('error', (error) => {
      console.error(`WebRTC peer error for ${peerId}`, error);
      peer.destroy();
    });

    this.peers.set(peerId, peer);
    return peer;
  }

  signal(peerId, signal) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.signal(signal);
    }
  }

  removePeer(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return;
    }

    peer.destroy();
    this.peers.delete(peerId);
  }

  destroy() {
    this.peers.forEach((peer) => peer.destroy());
    this.peers.clear();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    this.localStream = null;
  }
}

export const webrtcManager = new WebRTCManager();
