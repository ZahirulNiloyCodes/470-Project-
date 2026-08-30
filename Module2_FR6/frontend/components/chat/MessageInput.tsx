"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";


interface Props {
  onSend: (
    content: string
  ) => void;

  editing: boolean;

  initialValue?: string;

  onCancelEdit: () => void;
}


export default function MessageInput({
  onSend,
  editing,
  initialValue = "",
  onCancelEdit,
}: Props) {

  const [content, setContent] =
    useState(initialValue);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    const value =
      content.trim();

    if (!value) {
      return;
    }

    onSend(value);

    setContent("");

  }


  return (
    <div className="border-t p-4">

      {editing && (

        <div className="mb-2 flex items-center justify-between">

          <span className="text-sm text-gray-500">
            Editing message
          </span>

          <button
            onClick={() => {
              setContent("");
              onCancelEdit();
            }}
            className="text-sm text-red-500"
          >
            Cancel
          </button>

        </div>

      )}


      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
      >

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder={
            "Write a message... Markdown is supported"
          }
          rows={3}
          className="
            flex-1 resize-none
            rounded-lg border
            bg-transparent
            px-4 py-3
            text-white
            caret-white
            placeholder-gray-400
            outline-none
            focus:ring-2
          "
          onKeyDown={(event) => {

            if (
              event.key === "Enter" &&
              !event.shiftKey
            ) {
              event.preventDefault();

              handleSubmit(
                event as unknown as FormEvent
              );
            }

          }}
        />


        <button
          type="submit"
          className="
            self-end rounded-lg
            bg-black px-5 py-3
            text-white
            hover:bg-gray-800
          "
        >
          {editing
            ? "Update"
            : "Send"}
        </button>

      </form>


      <p className="mt-2 text-xs text-gray-500">
        Markdown supported. Use
        {" ```python "} for code blocks.
      </p>

    </div>
  );
}