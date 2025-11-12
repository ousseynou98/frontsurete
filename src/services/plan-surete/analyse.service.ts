import { BaseService } from "services/base.service";

export class AnalyseService extends BaseService {
  constructor() {
    super('/analyses');
  }

  getAllAnalyses(): Promise<any[]> {
    return this.get<any[]>('');
  }

  getAnalyseById(id: string) {
    return this.get<any>(`/${id}`);
  }

  createAnalyse(data: any) {
    return this.post<any>('', data);
  }

  updateAnalyse(id: string, data: any) {
    return this.patch<any>(`/${id}`, data);
  }

  deleteAnalyse(id: string) {
    return this.delete<any>(`/${id}`);
  }
}

export const analyseService = new AnalyseService();