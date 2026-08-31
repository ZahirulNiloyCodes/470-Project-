"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { ChatMessage } from "@/types/chat";


interface Props {
  message: ChatMessage;
  currentUserId: string;

  onEdit: (
    message: ChatMessage
  ) => void;

  onDelete: (
    message: ChatMessage
  ) => void;
}


export default function MessageItem({
  message,
  currentUserId,
  onEdit,
  onDelete,
}: Props) {

  const [showMenu, setShowMenu] =
    useState(false);


  const isOwner =
    message.user_id === currentUserId;


  if (message.is_deleted) {

    return (
      <div className="py-2">
        <div className="text-sm italic text-gray-500">
          This message was deleted.
        </div>
      </div>
    );

  }


  return (
    <div className="group relative flex gap-3 py-3">

      <div
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-full
          bg-gray-800
          text-sm
          font-semibold
          text-white
        "
      >
        {message.username
          .charAt(0)
          .toUpperCase()}
      </div>


      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-2">

          <span className="text-sm font-semibold text-white">
            {message.username}
          </span>

          <span className="text-xs text-gray-400">
            {new Date(message.created_at).toLocaleDateString("en-GB")}{" , "}
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {message.is_edited && (
            <span className="text-xs text-gray-400">
              (edited)
            </span>
          )}

        </div>


        <div className="text-white prose prose-sm max-w-none dark:prose-invert">

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                className,
                children,
                ...props
              }) {

                const match =
                  /language-(\w+)/.exec(
                    className || ""
                  );

                return match ? (
                  <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 text-sm text-white">
                    <code {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code
                    className="rounded bg-gray-800 px-1 py-0.5 text-white"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

        </div>

      </div>


      {isOwner && (

        <div className="relative">

          <button
            onClick={() =>
              setShowMenu(!showMenu)
            }
            className="
              rounded px-2 py-1
              text-lg text-gray-300
              hover:bg-gray-800
              hover:text-white
            "
          >
            ⋮
          </button>


          {showMenu && (

            <div
              className="
                absolute right-0 top-8 z-50
                w-28 rounded-md
                border border-gray-700
                bg-gray-900
                p-1 shadow-lg
              "
            >

              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(message);
                }}
                className="
                  block w-full
                  rounded px-3 py-2
                  text-left text-sm
                  text-white
                  hover:bg-gray-800
                "
              >
                Edit
              </button>


              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(message);
                }}
                className="
                  block w-full
                  rounded px-3 py-2
                  text-left text-sm
                  text-red-400
                  hover:bg-gray-800
                "
              >
                Delete
              </button>

            </div>

          )}

        </div>

      )}

    </div>
  );
}