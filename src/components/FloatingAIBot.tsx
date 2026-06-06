import React, { useState } from 'react';
import { Bot, Send, X } from 'lucide-react';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  text: string;
};

export default function FloatingAIBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Hi! I am your AI project assistant. How can I help?',
    },
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
    };

    const aiMessage: Message = {
      id: Date.now() + 1,
      sender: 'ai',
      text: 'I can help you with tasks, backlog, sprint planning, and team updates.',
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput('');
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[460px] w-[360px] flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between rounded-t-3xl bg-blue-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>

            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Ask something..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <button
              onClick={sendMessage}
              className="rounded-xl bg-blue-600 px-3 text-white hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-cyan-300 to-blue-600 text-white shadow-2xl hover:scale-105"
      >
        <Bot className="h-8 w-8" />
      </button>
    </>
  );
}