// assets
import { Story, Fatrows, PresentionChart, User } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  widgets: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart,
  user: User
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const gardiennage: NavItemType = {
  id: 'users',
  title: 'Gestion des gardiennages',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'agent',
      title: 'Agents',
      type: 'item',
      url: '/agent',
      icon: icons.user
    },
    {
      id: 'event',
      title: 'Affectation des agents',
      type: 'item',
      url: '/agent/check-event',
      icon: icons.data
    },
    
  ]
};

export default gardiennage;
