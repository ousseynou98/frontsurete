// src/services/auth.service.ts
import Cookies from 'js-cookie';
import { BaseService } from './base.service';
import { swalService } from './swalService';
import Swal from 'sweetalert2';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(email: string, password: string) {
    try {
      const data = await this.post<{ access_token: string; user: any }>('/login', { email, password });  
      // Stocker le token JWT dans les cookies
      Cookies.set('anam-auth.csrf-token', data.access_token, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });

      Cookies.set('anam-auth.csrf-user', JSON.stringify(data.user), { path: '/' });

      swalService.toast('Connexion réussie', 'success');

      return data;
    } catch (error: any) {
      swalService.toast(error.response.data.message, 'error');
      throw error;
    }
  }



 async logout() {
  const confirmed = await swalService.confirm(
    'Voulez-vous vous déconnecter ?',
    'Vous serez redirigé vers la page de connexion.',
    'Oui, déconnecter'
  );

  if (confirmed) {
    Swal.close();
    window.location.href = '/login';
    Cookies.remove('anam-auth.csrf-token');
    Cookies.remove('anam-auth.csrf-user');
  } else {
    swalService.toast('Déconnexion annulée.', 'info');
  }
}


  getToken() {
    return Cookies.get('anam-auth.csrf-token');
  }

  getUser() {
    const user = Cookies.get('anam-auth.csrf-user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!Cookies.get('anam-auth.csrf-token');
  }
}

export const authService = new AuthService();
