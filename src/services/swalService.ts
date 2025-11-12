import Swal from 'sweetalert2';

export const swalService = {
  toast: (message: string, icon: 'success' | 'error' | 'warning' | 'info') => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
       customClass: {
              popup: 'my-swal-toast'
            }
    });
  },

    // --- Confirmation générale (pour delete, logout, etc.) ---
  async confirm(
    title: string,
    text: string,
    confirmButtonText = 'Oui',
    cancelButtonText = 'Annuler',
    icon: 'warning' | 'question' | 'info' | 'error' | 'success' = 'warning'
  ): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText,
    });

    return result.isConfirmed;
  }
};
