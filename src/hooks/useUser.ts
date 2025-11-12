// next
import Cookies from 'js-cookie';

interface UserProps {
  name: string;
  email: string;
  avatar: string;
  thumb: string;
  role: string;
}

export default function useUser() {
  const userCookie = Cookies.get('anam-auth.csrf-user') ?? Cookies.get('user');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      const thumb = user?.avatar || '/assets/images/users/avatar-1.png';
      const rawRole = user?.role?.name || user?.role || 'user';
      let normalizedRole = typeof rawRole === 'string' ? rawRole.toLowerCase().trim() : 'user';
      
      // Normaliser les anciens rôles vers les nouveaux
      if (normalizedRole === 'rso_formateur') {
        normalizedRole = 'rso';
      }
      // S'assurer que chef_surete est bien normalisé
      if (normalizedRole === 'chef_surete' || normalizedRole === 'chef surete') {
        normalizedRole = 'chef_surete';
      }
      // S'assurer que dsm est bien normalisé
      if (normalizedRole === 'dsm') {
        normalizedRole = 'dsm';
      }
      
      const newUser: UserProps = {
        name: user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : user?.name || 'User',
        email: user?.email || 'user@example.com',
        avatar: user?.avatar || '/assets/images/users/avatar-1.png',
        thumb,
        role: normalizedRole
      };

      return newUser;
    } catch (error) {
      console.error('Error parsing user cookie:', error);
      return false;
    }
  }
  return false;
}
