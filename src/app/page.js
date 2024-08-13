"use client";

import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import "./styles/globals.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  //const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setIsLoggedIn(true); //TBD
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    // Add user message to chat
    setMessages([...messages, { text: input, type: 'user' }]);
    setInput("");

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      setMessages([...messages, { text: input, type: 'user' }, { text: data, type: 'ai' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...messages, { text: input, type: 'user' }, { text: 'Error: Could not fetch response', type: 'ai' }]);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <a href="#" className="text-2xl font-semibold">Medguide</a>
          <div className="hidden max-w-max px-4 py-2 mx-auto rounded shadow-md lg:flex space-x-8">
            <a href="#welcome" className="hover:text-sky-200">Welcome</a>
            <a href="#about" className="hover:text-sky-200">About Us</a>
            <a href="#health-tips" className="hover:text-sky-200">Health Tips</a>
            <a href="#appointment" className="hover:text-sky-200">Book Appointment</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden bg-muted">
        <div className="container h-full flex flex-col py-8">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start mb-4">
                <div className="w-8 h-8 bg-primary rounded-full mr-4"></div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-lg">{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="mt-auto relative">
            <Textarea
              className="w-full text-lg"
              placeholder="How may I be of help today?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              onClick={handleSend}
              className="absolute top-1/3 right-4 rounded-full"
              disabled={!input}
            >
              <Send size={24} />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
