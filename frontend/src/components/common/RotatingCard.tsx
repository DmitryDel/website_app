import React, { useState } from 'react';

interface RotatingCardProps {
  frontText: string;
  backText: string;
}

const RotatingCard: React.FC<RotatingCardProps> = ({ frontText, backText }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="w-96 h-56 perspective-1000 cursor-pointer"
      onClick={handleCardClick}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Передняя сторона */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-2xl flex items-center justify-center p-6">
          <p className="text-2xl font-semibold text-center text-gray-800">{frontText}</p>
        </div>
        {/* Задняя сторона */}
        <div className="absolute w-full h-full backface-hidden bg-indigo-600 rounded-xl shadow-2xl flex items-center justify-center p-6 rotate-y-180">
          <p className="text-2xl font-semibold text-center text-white">{backText}</p>
        </div>
      </div>
    </div>
  );
};

export default RotatingCard;