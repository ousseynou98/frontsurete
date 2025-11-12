import { ReactNode } from 'react';

import type { Metadata } from 'next';

import './globals.css';

// project-imports
import ProviderWrapper from './ProviderWrapper';

export const metadata: Metadata = {
  title: 'Surete ANAM - Dashboard de Gestion',
  description:
    'Surete ANAM Dashboard de Gestion - Application de gestion de la sûreté portuaire et aéroportuaire pour l\'Agence Nationale des Affaires Maritimes'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://fomo.codedthemes.com/pixel/CDkpF1sQ8Tt5wpMZgqRvKpQiUhpWE3bc"></script>
      </head>
      <body>
        <ProviderWrapper>{children}</ProviderWrapper>
      </body>
    </html>
  );
}
