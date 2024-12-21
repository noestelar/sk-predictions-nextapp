'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-gold-100">
            <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                    <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gold-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/2 w-1/2 h-1/2 bg-gold-500/10 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
                </div>
                <div className="relative text-center space-y-6 max-w-md mx-auto">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gold-500/20 rounded-full"></div>
                    <h1 className="text-4xl font-bold mb-2 text-white">
                        Predicciones SK Toxqui 2024 ✨
                    </h1>
                    <p className="text-white mb-6">Join the festive fun with your friends!</p>
                    <button
                        onClick={() => signIn('facebook')}
                        className="w-full bg-gold-600 text-white py-3 px-6 rounded-lg shadow-lg hover:bg-gold-500 transition-colors duration-300 font-semibold flex items-center justify-center space-x-2"
                    >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>Log in with Facebook</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
