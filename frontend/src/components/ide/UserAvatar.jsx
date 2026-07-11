
import React from "react";

const gradientPairs = [
  ["#E4895F", "#BF5E3D"], // clay
  ["#7FB39E", "#4F8873"], // teal
  ["#D9A05B", "#B87B3A"], // gold
  ["#7C9CBF", "#4F7396"], // slate blue
  ["#C97B84", "#A2545E"], // muted rose
  ["#9B8AC4", "#6E5C99"], // muted violet
  ["#8FA66E", "#657A47"], // olive
  ["#C98F5E", "#9C6538"], // amber brown
];

export default function UserAvatar({ name, className = "w-8 h-8 text-sm", onClick, style }) {
  const displayName = name || "?";
  const firstLetter = displayName.charAt(0).toUpperCase();

  let hash = 0;
  for (let i = 0; i < displayName.length; i++) {
    hash = displayName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const [from, to] = gradientPairs[Math.abs(hash) % gradientPairs.length];

  return (
    <div
      onClick={onClick}
      className={`rounded-full text-white font-semibold flex items-center justify-center select-none cursor-pointer transition-transform hover:scale-105 active:scale-95 ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})`, ...style }}
    >
      {firstLetter}
    </div>
  );
}