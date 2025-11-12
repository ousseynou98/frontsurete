// types
import { NavItemType } from 'types/menu';

// icons
import { Book, UserSquare, Award, DocumentText } from '@wandersonalwes/iconsax-react';

const icons = {
  formation: Book,
  participants: UserSquare,
  diplomes: Award,
  rapports: DocumentText
};

const gestionFormations: NavItemType = {
  id: 'gestion-formations',
  title: 'Demande de supervision de formation ',
  type: 'group',
  children: [
    {
      id: 'formations',
      title: 'Formations',
      type: 'item',
      url: '/formations',
      icon: icons.formation,
      breadcrumbs: false
    }
  ]
};

export default gestionFormations;

