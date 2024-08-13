import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";

export const metadata = {
  title: "Healthcare Assistant",
  description: "A healthcare assistant chatbot app",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
