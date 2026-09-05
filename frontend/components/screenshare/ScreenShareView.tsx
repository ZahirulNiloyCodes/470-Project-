"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  useTracks,
  useLocalParticipant,
  ParticipantTile,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  fetchLiveKitToken,
  createScreenShareSocket,
  notifyStart,
  notifyStop,
  LiveKitTokenResponse,
  ScreenShareSession,
} from "@/services/screenshareService";

interface ScreenShareViewProps {
  roomId: string;
  participantId: string;
  participantName: string;
}

function ScreenShareStage({
  isBusy,
  onToggle,
}: {
  isBusy: boolean;
  onToggle: () => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const isSharing = localParticipant.isScreenShareEnabled;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b flex justify-end">
        <button
          onClick={onToggle}
          disabled={isBusy}
          className={`px-4 py-2 rounded-md text-sm text-white disabled:opacity-50 ${
            isSharing ? "bg-red-500" : "bg-blue-500"
          }`}
        >
          {isBusy ? "Please wait..." : isSharing ? "Stop Sharing" : "Share Screen"}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-2 p-2 overflow-y-auto">
        {screenShareTracks.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">
            কেউ এখনো screen share করছে না।
          </p>
        )}
        {screenShareTracks.map((trackRef) => (
          <ParticipantTile key={trackRef.publication?.trackSid} trackRef={trackRef} />
        ))}
      </div>
    </div>
  );
}

export default function ScreenShareView({
  roomId,
  participantId,
  participantName,
}: ScreenShareViewProps) {
  const [tokenData, setTokenData] = useState<LiveKitTokenResponse | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  // currentSessionId কে ref এ রাখছি যাতে socket.onmessage (closure) সবসময়
  // সবচেয়ে latest value পায় — state directly closure তে পুরনো থেকে যেতে পারে।
  const currentSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  useEffect(() => {
    let isMounted = true;

    fetchLiveKitToken(roomId, participantId, participantName).then((data) => {
      if (isMounted) setTokenData(data);
    });

    const socket = createScreenShareSocket(roomId, (msg) => {
      if (msg.type === "error") {
        console.error("Screenshare error:", msg.detail);
        return;
      }

      if (msg.type === "started") {
        const session: ScreenShareSession = msg.session;
        // এই broadcast টা যদি এই client-এরই start request এর response হয়,
        // তাহলে backend থেকে ফেরত আসা আসল session.id ধরে রাখছি —
        // এটাই সেই id যেটা পরে "stop" পাঠানোর সময় লাগবে।
        if (session.participant_id === participantId) {
          setCurrentSessionId(session.id);
        }
      } else if (msg.type === "stopped") {
        const session: ScreenShareSession = msg.session;
        if (session.participant_id === participantId) {
          setCurrentSessionId(null);
        }
      }
    });

    socketRef.current = socket;
    return () => {
      isMounted = false;
      socket.close();
    };
  }, [roomId, participantId, participantName]);

  const handleToggle = useCallback(
    async (localParticipant: ReturnType<typeof useLocalParticipant>["localParticipant"]) => {
      const socket = socketRef.current;
      if (!socket || isBusy) return;

      setIsBusy(true);
      try {
        if (localParticipant.isScreenShareEnabled) {
          // === STOP FLOW ===
          const sessionId = currentSessionIdRef.current;
          if (!sessionId) {
            console.error("No active session id found — cannot notify backend of stop.");
            // তবুও local track বন্ধ করে দিচ্ছি যাতে UI অন্তত consistent থাকে
            await localParticipant.setScreenShareEnabled(false);
            return;
          }

          // আগে backend কে notify করছি, তারপর local track বন্ধ করছি —
          // এতে backend request fail করলে UI এখনো "sharing" অবস্থায় থাকবে (ভুল state এড়ানো যায়)
          notifyStop(socket, sessionId, participantId);
          await localParticipant.setScreenShareEnabled(false);
          setCurrentSessionId(null);
        } else {
          // === START FLOW ===
          await localParticipant.setScreenShareEnabled(true);
          notifyStart(socket, participantId);
          // session.id এখনো জানি না — সেটা উপরের socket.onmessage("started") থেকে আসবে
          // এবং সেখানেই setCurrentSessionId() কল হবে।
        }
      } catch (err) {
        console.error("Screen share toggle failed:", err);
      } finally {
        setIsBusy(false);
      }
    },
    [isBusy, participantId]
  );

  if (!tokenData) {
    return <div className="p-4 text-sm text-gray-400">Connecting...</div>;
  }

  return (
    <LiveKitRoom
      token={tokenData.token}
      serverUrl={tokenData.livekit_url}
      connect={true}
      video={false}
      audio={false}
      style={{ height: "100%" }}
    >
      <ScreenShareToggleWrapper isBusy={isBusy} onToggle={handleToggle} />
    </LiveKitRoom>
  );
}

function ScreenShareToggleWrapper({
  isBusy,
  onToggle,
}: {
  isBusy: boolean;
  onToggle: (
    localParticipant: ReturnType<typeof useLocalParticipant>["localParticipant"]
  ) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  return (
    <ScreenShareStage isBusy={isBusy} onToggle={() => onToggle(localParticipant)} />
  );
}