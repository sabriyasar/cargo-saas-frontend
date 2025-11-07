'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      router.push('/login');
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) return null; // yönlendirme yapılmadan sayfa gösterilmesin

  return <>{children}</>;
}
