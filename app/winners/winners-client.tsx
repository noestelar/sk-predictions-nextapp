'use client';

import { Trophy, Medal, Star } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface Score {
  userId: string;
  userName: string;
  correctGuesses: number;
  totalGuesses: number;
}

interface WinnersClientProps {
  scores: Score[];
}

export default function WinnersClient({ scores }: WinnersClientProps) {
  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 2:
        return <Medal className="w-8 h-8 text-amber-700" />;
      default:
        return <Star className="w-8 h-8 text-gold-500 opacity-50" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto relative">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="absolute top-0 right-0 px-4 py-2 bg-transparent border-2 border-gold-500 text-gold-500 rounded-lg shadow-lg hover:bg-gold-500/10 transition-colors duration-300 font-semibold"
        >
          Logout
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
            Prediction Game Winners
          </h1>
          <p className="text-gold-300">
            See who made the most accurate predictions!
          </p>
        </div>

        <div className="space-y-4">
          {scores.map((score, index) => (
            <div
              key={score.userId}
              className={`
                relative p-6 rounded-lg border-2 transition-all duration-300
                ${index === 0 ? 'border-yellow-500 bg-yellow-500/10' : 
                  index === 1 ? 'border-gray-400 bg-gray-400/10' :
                  index === 2 ? 'border-amber-700 bg-amber-700/10' :
                  'border-gold-500/50 bg-gold-500/5'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getPositionIcon(index)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{score.userName}</h2>
                    <p className="text-gold-300">
                      {score.correctGuesses} correct out of {score.totalGuesses} predictions
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold">
                  {((score.correctGuesses / score.totalGuesses) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/predictions"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold-400 to-gold-600 text-black rounded-lg shadow-lg hover:from-gold-500 hover:to-gold-700 transition-colors duration-300 font-semibold"
          >
            Back to Predictions
          </a>
        </div>
      </div>
    </div>
  );
} 