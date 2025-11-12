import { BaseService } from "services/base.service";



export class ComiteService extends BaseService {
  constructor() {
    super('/comites');
  }

  getAllComites(): Promise<any[]> {
    return this.get<any[]>('');
  }

  getComiteById(id: string) {
    return this.get<any>(`/${id}`);
  }

  createComite(data: any) {
    return this.post<any>('', data);
  }
  updateComiteStatus(id: string, data: any) {
    return this.patch<any>(`/${id}/status`, data);
  }

  updateComite(id: string, data: any) {
    return this.patch<any>(`/${id}`, data);
  }

  deleteComite(id: string) {
    return this.delete<any>(`/${id}`);
  }
}

export const comiteService = new ComiteService();