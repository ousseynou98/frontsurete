'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export function useAuthRedirect(redirectPath = '/dashboard/default') {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token'); // ou autre cookie de session
    if (token) {
      router.replace(redirectPath); // redirige si déjà connecté
    } else {
      setChecking(false); // on continue l’affichage de la page
    }
  }, [router, redirectPath]);

  return checking; // true = encore en vérification, false = prêt à afficher page
}
