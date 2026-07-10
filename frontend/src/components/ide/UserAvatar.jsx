import React from 'react';

export default function UserAvatar({ name, className = "w-8 h-8 text-sm", onClick }) {
  const displayName = name || "?";
  const firstLetter = displayName.charAt(0).toUpperCase();

  // Vibrant tailwind gradients for a premium visual identity
  const bgGradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-teal-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-red-500 to-orange-600",
    "from-fuchsia-600 to-pink-600",
    "from-indigo-600 to-violet-600",
    "from-sky-500 to-blue-600",
    "from-emerald-600 to-teal-600"
  ];

  // Hash code to assign a consistent gradient based on the user's name
  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgGradients.length;
  const gradient = bgGradients[index];

  return (
    <div
      onClick={onClick}
      className={`rounded-full bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center select-none shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 ${className}`}
    >
      {firstLetter}
    </div>
  );
}
