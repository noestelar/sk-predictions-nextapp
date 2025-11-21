'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function DebugProfilePage() {
  const { data: session, status } = useSession();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>;
  }

  if (!session) {
    return <div className="p-8">Not logged in</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile Picture Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Data:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Profile Image URL:</h2>
          <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
            {session.user?.image || 'No image URL'}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Image Test:</h2>
          {session.user?.image ? (
            <div className="space-y-2">
              <div>
                <p>Status: {imageError ? '❌ Failed to load' : imageLoaded ? '✅ Loaded successfully' : '⏳ Loading...'}</p>
              </div>
              <Image
                src={session.user.image}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border"
                onError={() => {
                  console.error('Image failed to load:', session.user?.image);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', session.user?.image);
                  setImageLoaded(true);
                }}
                unoptimized
              />
              
              <div>
                <h3 className="font-semibold">Direct link test:</h3>
                <a 
                  href={session.user.image} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Open image in new tab
                </a>
              </div>
            </div>
          ) : (
            <p>No image URL available</p>
          )}
        </div>
      </div>
    </div>
  );
}
