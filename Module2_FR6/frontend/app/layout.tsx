import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Real-Time Chat",
  description:
    "Module 2 FR6 Real-Time Collaboration Chat",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body>
        {children}
      </body>

    </html>
  );
}