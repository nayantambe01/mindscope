import React from 'react';

// Map emotion keys to display names - RAF-DB standard
const PRETTY_EMOTION_NAMES = {
  angry: 'Angry',
  disgust: 'Disgust',
  fear: 'Fear',
  happy: 'Happy',
  sad: 'Sad',
  surprise: 'Surprise',
  neutral: 'Neutral',
};

// Map emotion keys to Tailwind colors
const EMOTION_COLORS = {
  angry: 'bg-red-500',
  disgust: 'bg-orange-500',
  fear: 'bg-purple-500',
  happy: 'bg-yellow-400',
  sad: 'bg-blue-500',
  surprise: 'bg-pink-500',
  neutral: 'bg-gray-400',
};

export function EmotionChart({ expressions }) {
  if (!expressions) {
    return (
      <div className="mt-4 text-sm italic text-center text-slate-500">
        Position your face in the camera to begin analysis.
      </div>
    );
  }

  // Convert the expressions object into a sorted array by probability
  const sortedEmotions = Object.entries(expressions)
    .map(([emotion, probability]) => ({ name: emotion, probability }))
    .sort((a, b) => b.probability - a.probability);

  return (
    <div className="mt-4 space-y-2">
      {sortedEmotions.map(({ name, probability }) => (
        <div key={name} className="flex items-center space-x-2">
          <span className="w-20 text-sm font-medium capitalize text-slate-600">
            {PRETTY_EMOTION_NAMES[name] || name}
          </span>
          <div className="w-full h-4 rounded-full bg-slate-200">
            <div
              className={`h-4 rounded-full ${EMOTION_COLORS[name]} transition-all duration-300 ease-in-out`}
              style={{ width: `${Math.min(probability * 100, 100)}%` }}
            />
          </div>
          <span className="w-12 font-mono text-sm text-right text-slate-500">
            {(probability * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

