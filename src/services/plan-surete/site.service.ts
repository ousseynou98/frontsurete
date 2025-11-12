import { BaseService } from "services/base.service";


export class SiteService extends BaseService {
  constructor() {
    super('/sites');
  }

  getAllSites(): Promise<any[]> {
    return this.get<any[]>('');
  }

  getSiteById(id: string) {
    return this.get<any>(`/${id}`);
  }

  createSite(data: any) {
    return this.post<any>('', data);
  }

  updateSite(id: string, data: any) {
    return this.patch<any>(`/${id}`, data);
  }

  deleteSite(id: string) {
    return this.delete<any>(`/${id}`);
  }
}

export const siteService = new SiteService();
