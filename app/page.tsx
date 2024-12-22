'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const VALID_NAMES = [
  'Noé',
  'Miriam',
  'Martín',
  'Iris',
  'Ilse',
  'Alex',
  'Esteban Cesar',
  'Brenda',
  'Queso'
];

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedName, setSelectedName] = useState('');

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  // Redirect authenticated users to the predictions page
  if (status === 'authenticated') {
    router.push('/predictions');
    return null;
  }

  const handleLogin = async () => {
    if (!selectedName) return;
    await signIn('credentials', {
      name: selectedName,
      callbackUrl: '/predictions'
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gold-100">
      <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gold-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/2 w-1/2 h-1/2 bg-gold-500/10 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="relative text-center space-y-6 max-w-md mx-auto">
          <div className="w-12 h-12 mx-auto mb-4 bg-gold-500/20 rounded-full"></div>
          <h1 className="text-4xl font-bold mb-2 text-white">¡Bienvenido a Predicciones SKToxqui!</h1>
          <p className="text-white mb-6">Selecciona tu nombre para comenzar</p>
          <select
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg shadow-lg border-2 border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent mb-4"
          >
            <option value="">Selecciona tu nombre</option>
            {VALID_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={handleLogin}
            disabled={!selectedName}
            className="w-full bg-gold-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-gold-500 transition-colors duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}