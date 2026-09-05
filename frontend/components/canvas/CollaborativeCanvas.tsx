"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tldraw, Editor, TLRecord, TLShapeId, createTLStore, defaultShapeUtils } from "tldraw";
import "tldraw/tldraw.css";
import {
  fetchCanvasSnapshot,
  createCanvasSocket,
  CanvasWSMessage,
} from "@/services/canvasService";

interface CollaborativeCanvasProps {
  roomId: string;
}

export default function CollaborativeCanvas({ roomId }: CollaborativeCanvasProps) {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  const socketRef = useRef<WebSocket | null>(null);
  const applyingRemote = useRef(false);

  useEffect(() => {
    let isMounted = true;

    fetchCanvasSnapshot(roomId).then((records) => {
      if (!isMounted || records.length === 0) return;
      applyingRemote.current = true;
      store.mergeRemoteChanges(() => store.put(records));
      applyingRemote.current = false;
    });

    const socket = createCanvasSocket(roomId, (msg: CanvasWSMessage) => {
      applyingRemote.current = true;
      store.mergeRemoteChanges(() => {
        if (msg.type === "update") {
          store.put(msg.records);
        } else if (msg.type === "delete") {
          store.remove(msg.ids as TLShapeId[]);
        }
      });
      applyingRemote.current = false;
    });

    socketRef.current = socket;
    return () => {
      isMounted = false;
      socket.close();
    };
  }, [roomId, store]);

  useEffect(() => {
    const unsubscribe = store.listen(
      (entry) => {
        if (applyingRemote.current) return;
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        const updated = [
          ...Object.values(entry.changes.added),
          ...Object.values(entry.changes.updated).map(([, next]) => next),
        ] as TLRecord[];
        const removed = Object.keys(entry.changes.removed);

        if (updated.length > 0) {
          socket.send(JSON.stringify({ type: "update", records: updated }));
        }
        if (removed.length > 0) {
          socket.send(JSON.stringify({ type: "delete", ids: removed }));
        }
      },
      { source: "user", scope: "document" }
    );
    return () => unsubscribe();
  }, [store]);

  const handleMount = useCallback((editor: Editor) => {
    // future extension: cursor presence ইত্যাদির জন্য editor reference কাজে লাগবে
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw store={store} onMount={handleMount} />
    </div>
  );
}