'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordGate from '@/components/PasswordGate';
import Landing from '@/components/Landing';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('silvyn_authenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isChecking) {
    return null; // Or a loading spinner
  }

  return isAuthenticated ? <Landing /> : <PasswordGate onSuccess={handleSuccess} />;
}
