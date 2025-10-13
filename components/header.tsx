'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, ChevronDown, LogOut, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl font-cinzel text-primary">SK Predictions</span>
        </Link>

        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-primary/20"></div>
          ) : session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors p-1 pr-3"
              >
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-primary/30"
                  />
                )}
                <span className="text-sm font-medium text-primary hidden sm:inline-block">
                  {session.user.name}
                </span>
                <ChevronDown 
                  className={`h-4 w-4 text-primary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-black border border-primary/20 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {session?.user?.isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-primary/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => signIn('facebook')}
              className="gap-2 bg-primary text-black hover:bg-primary/90 font-semibold"
              size="sm"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

