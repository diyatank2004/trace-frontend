import React, { useState } from 'react';

type ChatUser = {
  id: number;
  name: string;
  type: 'channel' | 'member';
};

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
};

const chatList: ChatUser[] = [
  { id: 1, name: '# general', type: 'channel' },
  { id: 2, name: '# project-updates', type: 'channel' },
  { id: 3, name: 'Priya Sharma', type: 'member' },
  { id: 4, name: 'Vikram Patil', type: 'member' },
];

const initialMessages: Record<string, Message[]> = {
  '# general': [
    {
      id: 1,
      sender: 'Sejal',
      text: 'Welcome to the project discussion channel.',
      time: '10:30 AM',
    },
  ],

  '# project-updates': [
    {
      id: 2,
      sender: 'Admin',
      text: 'Kanban workflow updated successfully.',
      time: '11:15 AM',
    },
  ],

  'Priya Sharma': [
    {
      id: 3,
      sender: 'Priya',
      text: 'Please review the UI changes.',
      time: '12:10 PM',
    },
  ],

  'Vikram Patil': [
    {
      id: 4,
      sender: 'Vikram',
      text: 'API integration is pending.',
      time: '01:00 PM',
    },
  ],
};

export default function TeamChatPage() {
  const [selectedChat, setSelectedChat] = useState(chatList[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now(),
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages({
      ...messages,
      [selectedChat.name]: [...messages[selectedChat.name], message],
    });

    setNewMessage('');
  };

  return (
    <div className="flex h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      
      <div className="w-[300px] border-r border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-xl font-bold text-slate-900">
            Team Chat
          </h2>
        </div>

        <div className="space-y-1 p-2">
          {chatList.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                selectedChat.id === chat.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-200'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-bold">
                {chat.type === 'channel'
                  ? '#'
                  : chat.name.charAt(0)}
              </div>

              <div>
                <p className="font-semibold">{chat.name}</p>

                <p className="text-xs opacity-70">
                  {chat.type === 'channel'
                    ? 'Team discussion'
                    : 'Direct message'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      
      <div className="flex flex-1 flex-col">
        
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-xl font-bold text-slate-900">
            {selectedChat.name}
          </h2>
        </div>

        
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          {messages[selectedChat.name]?.map((message) => (
            <div
              key={message.id}
              className={`max-w-[70%] rounded-2xl p-4 shadow-sm ${
                message.sender === 'You'
                  ? 'ml-auto bg-blue-600 text-white'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold">
                  {message.sender}
                </p>

                <p className="text-xs opacity-70">
                  {message.time}
                </p>
              </div>

              <p className="mt-2 text-sm">
                {message.text}
              </p>
            </div>
          ))}
        </div>

        
        <div className="flex gap-3 border-t border-slate-200 p-4">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            onClick={sendMessage}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}