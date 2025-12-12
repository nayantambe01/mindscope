import React from 'react';

export function HighlightedText({ text, keywords }) {
  if (!keywords || keywords.length === 0) {
    return (
      <p className="mt-2 italic text-slate-600">
        Our AI detected subtle patterns in the overall tone and context of the text.
      </p>
    );
  }

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <div className="mt-4 leading-relaxed text-slate-700">
      {parts.map((part, index) => {
        const isKeyword = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
        
        if (isKeyword) {
          return (
            <span
              key={index}
              className="p-1 font-semibold bg-red-100 rounded-md"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
