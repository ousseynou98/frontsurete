// project-imports
import planSurete from './plan-surete';
import gestionIncidents from './gestion-incidents';

// types
import { NavItemType } from 'types/menu';
import gestionInspections from './gestion-inspections';
import gestionFormations from './gestion-formations';
import utilisateur from './utilisateur';
import gardiennage from './gardiennage';

// ==============================|| MENU ITEMS ||============================== //

interface MenuConfig {
  role?: string;
}

const menuItems = (config?: MenuConfig): { items: NavItemType[] } => {
  const role = config?.role?.toLowerCase();

  const filterByRole = (items: NavItemType[]): NavItemType[] =>
    items.reduce<NavItemType[]>((acc, item) => {
      if (item.requiredRoles) {
        if (!role || !item.requiredRoles.includes(role)) {
          return acc;
        }
      }

      const filteredChildren = item.children ? filterByRole(item.children) : undefined;
      const nextItem: NavItemType = {
        ...item,
        ...(filteredChildren && filteredChildren.length > 0 ? { children: filteredChildren } : { children: undefined }),
      };

      acc.push(nextItem);
      return acc;
    }, []);

  const items = filterByRole([utilisateur, planSurete, gestionIncidents, gestionInspections, gestionFormations, gardiennage]);
  return { items };
};

export default menuItems;
