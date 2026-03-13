import { useEffect } from 'react';
import { useRoomStore } from '../store';
import { wsManager } from '../websocket';

const ParticipantsList = () => {
  const participants = useRoomStore((state) => state.participants);
  const addParticipant = useRoomStore((state) => state.addParticipant);
  const removeParticipant = useRoomStore((state) => state.removeParticipant);
  const setParticipants = useRoomStore((state) => state.setParticipants);

  useEffect(() => {
    const snapshotHandler = (data) => {
      setParticipants(data.participants ?? []);
    };

    const joinedHandler = (data) => {
      if (data.username) {
        addParticipant(data.username);
      }
    };

    const leftHandler = (data) => {
      if (data.username) {
        removeParticipant(data.username);
      }
    };

    wsManager.on('participants_snapshot', snapshotHandler, { replayLatest: true });
    wsManager.on('participant_joined', joinedHandler);
    wsManager.on('participant_left', leftHandler);

    return () => {
      wsManager.off('participants_snapshot', snapshotHandler);
      wsManager.off('participant_joined', joinedHandler);
      wsManager.off('participant_left', leftHandler);
    };
  }, [addParticipant, removeParticipant, setParticipants]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
        {participants.length} active
      </span>
      {participants.length > 0 ? (
        participants.map((participant) => (
          <span
            key={participant}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
          >
            {participant}
          </span>
        ))
      ) : (
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-500">
          Waiting for collaborators
        </span>
      )}
    </div>
  );
};

export default ParticipantsList;
