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

const planSurete: NavItemType = {
  id: 'plan-surete',
  title: 'plan surete',
  icon: icons.widgets,
  type: 'group',
  children: [
    {
      id: 'site-list',
      title: 'site',
      type: 'item',
      url: '/plan-surete/site',
      icon: icons.statistics
    },
    {
      id: 'installation-portuaires',
      title: 'installation portuaires',
      type: 'item',
      url: '/plan-surete/ips',
      icon: icons.data
    },
    {
      id: 'com-pi',
      title: 'Comité de pilotage',
      type: 'item',
      url: '/plan-surete/comite',
      icon: icons.chart
    }
  ]
};

export default planSurete;
