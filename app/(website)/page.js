'use client';

import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      router.replace('/dashboard/login'); // redirect to login if not authenticated
    } else {
      router.replace('/dashboard'); // redirect to login if not authenticated
    }
  }, [token, router]);


  return null;
}
