"use client";

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import './styles/globals.css';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4 fixed top-0 left-0 w-full z-10">
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
      <main className="flex-1 overflow-hidden bg-muted w-full pt-[64px] pb-[72px]">
        <div className="container h-full flex flex-col py-8">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start mb-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type !== 'user' && (
                  <div className="w-8 h-8 rounded-full mr-4 bg-sky-200"></div>
                )}
                <div className={`p-4 rounded-lg ${message.type === 'user' ? 'bg-blue-100' : 'bg-sky-200'}`}>
                  <p className="text-lg">{message.text}</p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full ml-4 bg-blue-100"></div>
                )}
              </div>
            ))}
            <div ref={messageEndRef} /> {/* Scroll to this element */}
          </div>
        </div>
      </main>

      {/* Fixed Textarea */}
      <form className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4">
        <Textarea
          className="w-full text-lg rounded-md"
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
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          disabled={!input}
        >
          <Send size={24} />
        </Button>
      </form>
    </div>
  );
}
