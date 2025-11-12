// assets
import { Story, Fatrows, PresentionChart } from '@wandersonalwes/iconsax-react';
import { P } from 'framer-motion/dist/types.d-Cjd591yU';

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

const gestionIncidents: NavItemType = {
  id: 'gestion-incidents',
  title: 'gestion des incidents',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'incident',
      title: 'Incidents',
      type: 'item',
      url: '/incident/list',
      icon: icons.statistics
    }
  ]
};

export default gestionIncidents;
