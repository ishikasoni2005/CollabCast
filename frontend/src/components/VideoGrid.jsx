import { useEffect, useRef, useState } from 'react';
import { webrtcManager } from '../webrtc';
import { wsManager } from '../websocket';
import { useAuthStore } from '../store';

const VideoGrid = () => {
  const localRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micEnabled, setMicEnabled] = useState(webrtcManager.getMicrophoneEnabled());
  const [cameraEnabled, setCameraEnabled] = useState(webrtcManager.getCameraEnabled());
  const username = useAuthStore((state) => state.user?.username ?? '');

  useEffect(() => {
    let isCancelled = false;

    const ensureLocalStream = async () => {
      const stream = webrtcManager.getLocalStream() ?? await webrtcManager.getUserMedia();

      if (!isCancelled && localRef.current && stream) {
        localRef.current.srcObject = stream;
      }

      return stream;
    };

    const handleRemoteStream = (peerId, stream) => {
      if (isCancelled) {
        return;
      }

      setRemoteStreams((currentStreams) => {
        const existingStream = currentStreams.find((entry) => entry.id === peerId);
        if (existingStream) {
          return currentStreams.map((entry) =>
            entry.id === peerId ? { ...entry, stream } : entry,
          );
        }

        return [...currentStreams, { id: peerId, stream }];
      });
    };

    const removeRemoteStream = (peerId) => {
      setRemoteStreams((currentStreams) =>
        currentStreams.filter((entry) => entry.id !== peerId),
      );
    };

    const participantsSnapshotHandler = async (data) => {
      const stream = await ensureLocalStream();
      if (!stream || !data.participants) {
        return;
      }

      data.participants.forEach((participant) => {
        if (!participant || participant === username) {
          return;
        }

        webrtcManager.createPeer(participant, true, stream);
      });
    };

    const signalHandler = async (data) => {
      const fromUser = data.from_user;
      if (!fromUser || fromUser === username) {
        return;
      }

      const stream = await ensureLocalStream();
      if (!stream) {
        return;
      }

      if (!webrtcManager.hasPeer(fromUser)) {
        webrtcManager.createPeer(fromUser, false, stream);
      }

      if (data.signal) {
        webrtcManager.signal(fromUser, data.signal);
      }
    };

    const participantLeftHandler = (data) => {
      if (!data.username || data.username === username) {
        return;
      }

      webrtcManager.removePeer(data.username);
      removeRemoteStream(data.username);
    };

    void ensureLocalStream();

    webrtcManager.onRemoteStream(handleRemoteStream);
    webrtcManager.onPeerClosed(removeRemoteStream);
    wsManager.on('participants_snapshot', participantsSnapshotHandler, { replayLatest: true });
    wsManager.on('webrtc_signal', signalHandler);
    wsManager.on('participant_left', participantLeftHandler);

    return () => {
      isCancelled = true;
      webrtcManager.offRemoteStream(handleRemoteStream);
      webrtcManager.offPeerClosed(removeRemoteStream);
      wsManager.off('participants_snapshot', participantsSnapshotHandler);
      wsManager.off('webrtc_signal', signalHandler);
      wsManager.off('participant_left', participantLeftHandler);
      webrtcManager.destroy();
      setRemoteStreams([]);
    };
  }, [username]);

  const handleToggleMic = () => {
    setMicEnabled(webrtcManager.toggleMicrophone());
  };

  const handleToggleCamera = () => {
    setCameraEnabled(webrtcManager.toggleCamera());
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold">Video Grid</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleToggleMic}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              micEnabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
            }`}
          >
            {micEnabled ? 'Mic On' : 'Mic Off'}
          </button>
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              cameraEnabled
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
            }`}
          >
            {cameraEnabled ? 'Video On' : 'Video Off'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-200 rounded-lg flex items-center justify-center h-32 overflow-hidden">
          <video ref={localRef} className="w-full h-full rounded-lg object-cover" autoPlay muted playsInline />
        </div>
        {remoteStreams.map((r) => (
          <div key={r.id} className="bg-gray-200 rounded-lg flex items-center justify-center h-32 overflow-hidden">
            <video
              className="w-full h-full rounded-lg object-cover"
              ref={(el) => {
                if (el) el.srcObject = r.stream;
              }}
              autoPlay
              playsInline
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
