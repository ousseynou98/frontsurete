// assets
import { Story, Fatrows, PresentionChart } from '@wandersonalwes/iconsax-react';

// types
import { NavItemType } from 'types/menu';

// icons
const icons = {
  widgets: Story,
  statistics: Story,
  data: Fatrows,
  chart: PresentionChart
};

// ==============================|| MENU ITEMS - WIDGETS ||============================== //

const utilisateur: NavItemType = {
  id: 'users',
  title: 'Gestion des utilisateurs',
  icon: icons.widgets,
  type: 'group',
  requiredRoles: ['super_admin', 'admin'],
  children: [
    {
      id: 'user-list',
      title: 'Utilisateur',
      type: 'item',
      url: '/users',
      icon: icons.statistics,
      requiredRoles: ['super_admin', 'admin']
    },
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/roles',
      icon: icons.data,
      requiredRoles: ['super_admin', 'admin']
    },
    {
      id: 'permissions',
      title: 'Permissions',
      type: 'item',
      url: '/permissions',
      icon: icons.chart,
      requiredRoles: ['super_admin', 'admin']
    }
  ]
};

export default utilisateur;
