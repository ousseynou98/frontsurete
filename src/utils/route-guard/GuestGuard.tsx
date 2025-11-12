'use client';

import { useEffect, useState } from 'react';

// next
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// project-imports
import Loader from 'components/Loader';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get('anam-auth.csrf-token');
    
    if (token) {
      // Si un token existe, rediriger vers le dashboard
      router.replace('/dashboard/default');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return <Loader />;

  return <>{children}</>;
}
