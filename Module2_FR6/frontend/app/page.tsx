import Link from "next/link";


export default function Home() {

  return (
    <main
      className="
        flex min-h-screen
        items-center justify-center
      "
    >

      <div className="text-center">

        <h1 className="mb-4 text-3xl font-bold">
          Module 2 - Collaboration Tools
        </h1>

        <p className="mb-6 text-gray-500">
          FR6 Real-Time Chat
        </p>

        <Link
          href="/chat"
          className="
            rounded-lg
            bg-black
            px-6 py-3
            text-white
          "
        >
          Open Chat
        </Link>

      </div>

    </main>
  );
}