import React from 'react';
import { Send } from 'lucide-react';

export default function SidebarChat() {
  const messages = [
    { user: 'Sarah', color: 'bg-blue-500', time: '2m ago', text: 'Working on the header component' },
    { user: 'Alex', color: 'bg-green-500', time: '1m ago', text: 'LGTM! The animations look great 🚀' },
    { user: 'Sarah', color: 'bg-blue-500', time: '30s ago', text: 'Thanks! Can you review the responsive styles?' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0B0E14]">
      <div className="p-4 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Online</span>
          <span className="text-[10px] text-cyan-400 font-bold">2 active</span>
        </div>
        <div className="flex gap-3">
          {['S', 'A', 'M'].map((u, i) => (
            <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white relative border-2 border-[#0B0E14] ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-green-500' : 'bg-purple-500'}`}>
              {u}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0B0E14] rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Chat</span>
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3 animate-in fade-in duration-500">
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${m.color}`}>{m.user[0]}</div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[12px] font-bold text-gray-200">{m.user}</span>
                <span className="text-[10px] text-gray-600">{m.time}</span>
              </div>
              <p className="text-[12px] text-gray-400 leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="relative">
          <input type="text" placeholder="Type a message..." className="w-full bg-[#161B22] border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-[13px] text-gray-200 focus:outline-none focus:border-cyan-500/50" />
          <Send size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 cursor-pointer" />
        </div>
      </div>
    </div>
  );
}