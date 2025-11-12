import { BaseService } from "services/base.service";


export class IpService extends BaseService {
  constructor() {
    super('/ips');
  }

  getAllIps(): Promise<any[]> {
    return this.get<any[]>('');
  }

  getIpById(id: string) {
    return this.get<any>(`/${id}`);
  }

  createIp(data: any) {
    return this.post<any>('', data);
  }

  updateIp(id: string, data: any) {
    return this.patch<any>(`/${id}`, data);
  }
  updateSiteIp(id: string, data: any) {
    return this.put<any>(`/site/${id}`, data);
  }
  updateCoordinates(id: string, data: any) {
    return this.patch<any>(`/${id}/coordinates`, data);
  }


  deleteSite(id: string) {
    return this.delete<any>(`/${id}`);
  }

}

export const ipService = new IpService();
