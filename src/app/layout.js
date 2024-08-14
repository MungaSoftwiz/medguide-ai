import { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react"
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Healthcare Assistant",
  description: "A healthcare assistant chatbot app buitl using Next.js, tailwindcss, and pinecone as the serverless databse. The book is updated using RAG with the CMDT.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{ children }</body>
      <Analytics />
    </html>
  );
}
