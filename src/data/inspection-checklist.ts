export interface ChecklistItem {
  id: string;
  question: string;
  value?: 'OUI' | 'NON' | 'N/A';
  commentaire?: string;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export const INSPECTION_CHECKLIST: ChecklistSection[] = [
  {
    id: 'A',
    title: 'A. Documentation et Certificats',
    items: [
      {
        id: 'A1',
        question: 'Certificat International de Sûreté du Navire (ISSC) présent et valide ?'
      },
      {
        id: 'A2',
        question: 'Portée (provisoire, intérimaire, pleine validité) ?'
      },
      {
        id: 'A3',
        question: 'Dates de vérification intermédiaires et de renouvellement respectées ?'
      },
      {
        id: 'A4',
        question: 'Plan de Sûreté du Navire (SSP) présent à bord et approuvé ?'
      },
      {
        id: 'A5',
        question: 'Accessible uniquement au personnel autorisé ?'
      },
      {
        id: 'A6',
        question: 'Correspond-il à la configuration actuelle du navire ?'
      },
      {
        id: 'A7',
        question: 'Est-il en version papier ou électronique sécurisée ?'
      },
      {
        id: 'A8',
        question: 'Rapports des exercices et entraînements de sûreté tenus à jour ?'
      },
      {
        id: 'A9',
        question: 'Lacunes identifiées documentées et corrigées ?'
      },
      {
        id: 'A10',
        question: 'Registres des incidents de sûreté consignés ?'
      },
      {
        id: 'A11',
        question: 'Mesures correctives prises ?'
      },
      {
        id: 'A12',
        question: 'Déclarations de Sûreté (DoS) disponibles si requises ?'
      }
    ]
  },
  {
    id: 'B',
    title: 'B. Officier de Sûreté du Navire (OSN) / Personnel de Sûreté',
    items: [
      {
        id: 'B1',
        question: 'L\'OSN est-il désigné et sa formation est-elle certifiée conforme au Code ISPS ?'
      },
      {
        id: 'B2',
        question: 'L\'OSN comprend-il ses responsabilités et celles du personnel ?'
      },
      {
        id: 'B3',
        question: 'L\'OSN et le personnel clé ont-ils une bonne connaissance du SSP ?'
      },
      {
        id: 'B4',
        question: 'Tout le personnel a-t-il reçu une formation ou une sensibilisation à la sûreté ?'
      },
      {
        id: 'B5',
        question: 'Des registres de formation sont-ils tenus ?'
      }
    ]
  },
  {
    id: 'C',
    title: 'C. Niveaux de Sûreté et Procédures',
    items: [
      {
        id: 'C1',
        question: 'Le personnel comprend-il les trois niveaux de sûreté (1, 2, 3) et les actions requises ?'
      },
      {
        id: 'C2',
        question: 'Le navire est-il actuellement au niveau approprié ?'
      },
      {
        id: 'C3',
        question: 'Les procédures d\'escalade sont-elles connues et mises en œuvre ?'
      }
    ]
  },
  {
    id: 'D',
    title: 'D. Contrôle d\'Accès',
    items: [
      {
        id: 'D1',
        question: 'Procédure de contrôle des billets et d\'identité des passagers ?'
      },
      {
        id: 'D2',
        question: 'Équipement de détection (rayons X, portiques) fonctionnel et utilisé ?'
      },
      {
        id: 'D3',
        question: 'Fouille aléatoire ou systématique des bagages ?'
      },
      {
        id: 'D4',
        question: 'Système d\'identification (badges) en place pour le personnel ?'
      },
      {
        id: 'D5',
        question: 'Registre des visiteurs tenu et vérifié ?'
      },
      {
        id: 'D6',
        question: 'Procédures pour le personnel de réparation/service externe ?'
      },
      {
        id: 'D7',
        question: 'Contrôle des véhicules accédant au navire (vérification, fouille) ?'
      },
      {
        id: 'D8',
        question: 'Zones de stationnement sécurisées ?'
      },
      {
        id: 'D9',
        question: 'Points d\'accès contrôlés et surveillés (personnel, caméras) ?'
      }
    ]
  },
  {
    id: 'E',
    title: 'E. Zones Restreintes',
    items: [
      {
        id: 'E1',
        question: 'Toutes les zones restreintes sont-elles clairement identifiées ?'
      },
      {
        id: 'E2',
        question: 'Seul le personnel autorisé a-t-il accès à ces zones ?'
      },
      {
        id: 'E3',
        question: 'Des registres d\'accès sont-ils tenus ?'
      },
      {
        id: 'E4',
        question: 'Ces zones sont-elles surveillées (caméras, rondes) ?'
      }
    ]
  },
  {
    id: 'F',
    title: 'F. Manipulation du Fret et des Provisions de Bord',
    items: [
      {
        id: 'F1',
        question: 'Procédures de contrôle et vérification des bagages non accompagnés ?'
      },
      {
        id: 'F2',
        question: 'Sécurité de la chaîne d\'approvisionnement des bagages et du fret ?'
      },
      {
        id: 'F3',
        question: 'Contrôle des provisions de bord et colis postaux ?'
      },
      {
        id: 'F4',
        question: 'Consignation des livraisons ?'
      },
      {
        id: 'F5',
        question: 'Gestion sécurisée des déchets pour éviter l\'introduction d\'articles illicites ?'
      }
    ]
  },
  {
    id: 'G',
    title: 'G. Équipements de Sûreté',
    items: [
      {
        id: 'G1',
        question: 'Système de vidéosurveillance (CCTV) fonctionnel et enregistrement disponible ?'
      },
      {
        id: 'G2',
        question: 'Couverture adéquate des zones critiques et points d\'accès ?'
      },
      {
        id: 'G3',
        question: 'Éclairage suffisant sur toutes les zones critiques ?'
      },
      {
        id: 'G4',
        question: 'Alarmes de sûreté fonctionnelles et testées régulièrement ?'
      },
      {
        id: 'G5',
        question: 'Barrières physiques (clôtures, barricades, etc.) en bon état et efficaces ?'
      }
    ]
  },
  {
    id: 'H',
    title: 'H. Mesures de Sûreté Spécifiques aux Navires à Passagers',
    items: [
      {
        id: 'H1',
        question: 'Procédures pour la gestion des passagers à risque ?'
      },
      {
        id: 'H2',
        question: 'Système fiable de comptage des passagers et de l\'équipage ?'
      },
      {
        id: 'H3',
        question: 'Procédures de fouille, identification et stationnement des véhicules sur les ponts garages ?'
      }
    ]
  },
  {
    id: 'I',
    title: 'I. Communication de Sûreté',
    items: [
      {
        id: 'I1',
        question: 'Systèmes de communication interne fonctionnels ?'
      },
      {
        id: 'I2',
        question: 'Moyens de communication externes avec les autorités portuaires et forces de l\'ordre ?'
      },
      {
        id: 'I3',
        question: 'Numéros d\'urgence à jour et disponibles ?'
      }
    ]
  }
];

