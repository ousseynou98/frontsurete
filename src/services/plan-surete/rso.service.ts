import { BaseService } from "services/base.service";



export class RsoService extends BaseService {
  constructor() {
    super('/rsos');
  }

  getAllRsos(): Promise<any[]> {
    return this.get<any[]>('');
  }

  getRsoById(id: string) {
    return this.get<any>(`/${id}`);
  }

  createRso(data: any) {
    return this.post<any>('', data);
  }

  updateRso(id: string, data: any) {
    return this.patch<any>(`/${id}`, data);
  }

  deleteRso(id: string) {
    return this.delete<any>(`/${id}`);
  }
}

export const rsoService = new RsoService();