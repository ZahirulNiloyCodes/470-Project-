"use client";

import { useEffect, useRef } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";


// =====================================================
// MESSAGE TYPES
// =====================================================

type CanvasChangeMessage = {
  type: "canvas_changes";

  changes: {
    added: Record<string, any>;

    updated: Record<
      string,
      [any, any]
    >;

    removed: Record<string, any>;
  };
};


type CanvasStateMessage = {
  type: "canvas_state";

  records: any[];
};


// =====================================================
// COMPONENT
// =====================================================

export default function CollaborativeCanvas() {

  // ------------------------------------------
  // Tldraw editor
  // ------------------------------------------

  const editorRef =
    useRef<Editor | null>(null);


  // ------------------------------------------
  // WebSocket
  // ------------------------------------------

  const socketRef =
    useRef<WebSocket | null>(null);


  // ------------------------------------------
  // Tldraw listener cleanup
  // ------------------------------------------

  const cleanupListenerRef =
    useRef<(() => void) | null>(null);


  // ------------------------------------------
  // Used for intentional cleanup
  // ------------------------------------------

  const isClosingRef =
    useRef(false);


  // ------------------------------------------
  // Canvas state received before Tldraw
  // is ready
  // ------------------------------------------

  const pendingCanvasStateRef =
    useRef<any[] | null>(null);


  // =====================================================
  // APPLY CANVAS STATE
  // =====================================================

  const applyCanvasState = (
    editor: Editor,
    records: any[]
  ) => {

    console.log(
      "Applying existing canvas:",
      records.length,
      "records"
    );


    if (records.length === 0) {

      console.log(
        "Canvas state is empty."
      );

      return;
    }


    try {

      editor.store.mergeRemoteChanges(
        () => {

          editor.store.put(
            records
          );

        }
      );


      console.log(
        "Existing canvas applied successfully."
      );

    } catch (error) {

      console.error(
        "Failed to apply canvas state:",
        error
      );

    }
  };


  // =====================================================
  // ATTACH TLDRAW STORE LISTENER
  // =====================================================

  const attachStoreListener = (
    editor: Editor,
    socket: WebSocket
  ) => {

    // ------------------------------------------
    // Prevent duplicate listener
    // ------------------------------------------

    if (
      cleanupListenerRef.current
    ) {

      return;
    }


    console.log(
      "Attaching Tldraw store listener..."
    );


    const cleanup =
      editor.store.listen(

        (entry) => {

          // ----------------------------------------
          // WebSocket must be OPEN
          // ----------------------------------------

          if (
            socket.readyState !==
            WebSocket.OPEN
          ) {

            return;
          }


          // ----------------------------------------
          // Create message
          // ----------------------------------------

          const message:
            CanvasChangeMessage = {

              type: "canvas_changes",

              changes:
                entry.changes,
            };


          // ----------------------------------------
          // Send to backend
          // ----------------------------------------

          try {

            socket.send(
              JSON.stringify(message)
            );


            console.log(
              "Canvas changes sent"
            );

          } catch (error) {

            console.error(
              "Failed to send canvas changes:",
              error
            );

          }

        },

        {
          source: "user",
          scope: "document",
        }
      );


    cleanupListenerRef.current =
      cleanup;
  };


  // =====================================================
  // WEBSOCKET + CANVAS
  // =====================================================

  useEffect(() => {

    // ------------------------------------------
    // Get room ID
    // ------------------------------------------

    const roomId =
      window.location.pathname
        .split("/")
        .pop();


    if (!roomId) {

      console.error(
        "Room ID not found"
      );

      return;
    }


    isClosingRef.current =
      false;


    // ------------------------------------------
    // WebSocket URL
    // ------------------------------------------

    const socketUrl =
      `ws://127.0.0.1:8000/ws/canvas/${roomId}`;


    console.log(
      "Connecting WebSocket:",
      socketUrl
    );


    // ------------------------------------------
    // Create WebSocket
    // ------------------------------------------

    const socket =
      new WebSocket(socketUrl);


    socketRef.current =
      socket;


    // =================================================
    // WEBSOCKET OPEN
    // =================================================
    
    
    socket.onopen = () => {
      
      if (isClosingRef.current) {
        socket.close(
        1000,
        "Component already cleaned up"
        );
        return;
      }
      console.log(
        "WebSocket connected successfully"
      );

      console.log(
        "Room:",
        roomId
      );


      // ----------------------------------------
      // IMPORTANT
      //
      // Ask backend for current canvas state
      // ----------------------------------------

      try {

        socket.send(
          JSON.stringify({
            type:
              "request_canvas_state",
          })
        );


        console.log(
          "Requested current canvas state..."
        );

      } catch (error) {

        console.error(
          "Failed to request canvas state:",
          error
        );

      }


      // ----------------------------------------
      // If Tldraw already mounted
      // attach listener
      // ----------------------------------------

      const editor =
        editorRef.current;


      if (editor) {

        attachStoreListener(
          editor,
          socket
        );

      }

    };


    // =================================================
    // WEBSOCKET MESSAGE
    // =================================================

    socket.onmessage = (
      event
    ) => {

      try {

        const message =
          JSON.parse(
            event.data
          );


        console.log(
          "WebSocket message received:",
          message.type
        );


        // =============================================
        // CURRENT CANVAS STATE
        // =============================================

        if (
          message.type ===
          "canvas_state"
        ) {

          const stateMessage =
            message as CanvasStateMessage;


          const records =
            stateMessage.records || [];


          console.log(
            "Received canvas state:",
            records.length,
            "records"
          );


          const editor =
            editorRef.current;


          // ----------------------------------------
          // Tldraw not ready yet
          // ----------------------------------------

          if (!editor) {

            console.log(
              "Tldraw editor is not ready yet."
            );


            console.log(
              "Saving canvas state temporarily..."
            );


            pendingCanvasStateRef.current =
              records;


            return;
          }


          // ----------------------------------------
          // Tldraw ready
          // ----------------------------------------

          applyCanvasState(
            editor,
            records
          );


          return;
        }


        // =============================================
        // REAL-TIME CANVAS CHANGES
        // =============================================

        if (
          message.type !==
          "canvas_changes"
        ) {

          console.log(
            "Unknown WebSocket message:",
            message.type
          );

          return;
        }


        const changeMessage =
          message as CanvasChangeMessage;


        const editor =
          editorRef.current;


        if (!editor) {

          console.warn(
            "Received canvas changes, "
            + "but Tldraw editor is not ready."
          );


          return;
        }


        const {
          added,
          updated,
          removed,
        } = changeMessage.changes;


        // ----------------------------------------
        // Apply remote changes
        // ----------------------------------------

        editor.store.mergeRemoteChanges(
          () => {

            // ------------------------------------
            // Added records
            // ------------------------------------

            if (
              Object.keys(
                added
              ).length > 0
            ) {

              editor.store.put(
                Object.values(
                  added
                )
              );

            }


            // ------------------------------------
            // Updated records
            // ------------------------------------

            if (
              Object.keys(
                updated
              ).length > 0
            ) {

              editor.store.put(

                Object.values(
                  updated
                ).map(
                  (change) =>
                    change[1]
                )

              );

            }


            // ------------------------------------
            // Removed records
            // ------------------------------------

            if (
              Object.keys(
                removed
              ).length > 0
            ) {

              editor.store.remove(
                Object.keys(
                  removed
                ) as any
              );

            }

          }
        );


        console.log(
          "Remote canvas changes applied."
        );


      } catch (error) {

        console.error(
          "Failed to process WebSocket message:",
          error
        );

      }

    };


    // =================================================
    // WEBSOCKET ERROR
    // =================================================

    socket.onerror = () => {

      /*
       * Don't use console.error here.
       *
       * Next.js development mode can trigger
       * WebSocket error events during cleanup.
       */

      if (
        !isClosingRef.current
      ) {

        console.warn(
          "WebSocket connection problem."
        );

      }

    };


    // =================================================
    // WEBSOCKET CLOSE
    // =================================================

    socket.onclose = (
      event
    ) => {

      console.log(
        "WebSocket closed:",
        {
          code:
            event.code,

          reason:
            event.reason,

          wasClean:
            event.wasClean,
        }
      );

    };


    // =================================================
    // CLEANUP
    // =================================================

    return () => {

      console.log(
        "Cleaning up WebSocket..."
      );


      isClosingRef.current =
        true;


      // ----------------------------------------
      // Remove Tldraw listener
      // ----------------------------------------

      if (
        cleanupListenerRef.current
      ) {

        cleanupListenerRef.current();

        cleanupListenerRef.current =
          null;

      }


      // ----------------------------------------
      // Close OPEN WebSocket
      // ----------------------------------------

      if (socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING) {

          socket.close(
            1000,
            "Component cleanup"
          );

      }


      // ----------------------------------------
      // Clear socket reference
      // ----------------------------------------

      if (
        socketRef.current ===
        socket
      ) {

        socketRef.current =
          null;

      }

    };

  }, []);


  // =====================================================
  // TLDRAW MOUNT
  // =====================================================

  const handleMount = (
    editor: Editor
  ) => {

    console.log(
      "Tldraw editor mounted"
    );


    editorRef.current =
      editor;


    // ------------------------------------------
    // WebSocket
    // ------------------------------------------

    const socket =
      socketRef.current;


    if (!socket) {

      console.warn(
        "WebSocket is not available yet."
      );

      return;
    }


    // ------------------------------------------
    // Attach listener if socket is open
    // ------------------------------------------

    if (
      socket.readyState ===
      WebSocket.OPEN
    ) {

      attachStoreListener(
        editor,
        socket
      );

    } else {

      console.log(
        "WebSocket is still connecting."
      );

    }


    // ------------------------------------------
    // IMPORTANT:
    //
    // Canvas state may have arrived BEFORE
    // Tldraw mounted.
    //
    // Apply it now.
    // ------------------------------------------

    const pendingRecords =
      pendingCanvasStateRef.current;


    if (
      pendingRecords !== null
    ) {

      console.log(
        "Applying pending canvas state:",
        pendingRecords.length,
        "records"
      );


      applyCanvasState(
        editor,
        pendingRecords
      );


      // Clear pending state
      pendingCanvasStateRef.current =
        null;

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
      }}
    >

      <Tldraw
        onMount={handleMount}
      />

    </div>

  );

}