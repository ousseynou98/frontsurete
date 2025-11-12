// assets
import { ClipboardText, DocumentText, SearchNormal1 } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  inspections: ClipboardText,
  newInspection: DocumentText,
  search: SearchNormal1
};

// ==============================|| MENU ITEMS - INSPECTIONS ||============================== //

const gestionInspections: NavItemType = {
  id: 'gestion-inspections',
  title: 'Gestion des Inspections',
  icon: icons.inspections,
  type: 'group',
  children: [
    {
      id: 'inspections-list',
      title: 'Liste des Inspections',
      type: 'item',
      url: '/inspections',
      icon: icons.search
    },
    {
      id: 'new-inspection',
      title: 'Nouvelle Inspection',
      type: 'item',
      url: '/inspections/new',
      icon: icons.newInspection
    }
  ]
};

export default gestionInspections;

