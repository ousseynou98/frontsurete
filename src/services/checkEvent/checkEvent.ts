import { BaseService } from "services/base.service";

export interface CheckEvent {
  id?: string;
  checkIn?: string;
  checkOut?: string;
  agentIds: any[];
}


export class CheckEventService extends BaseService {
  constructor() {
    super('/check-event'); // basePath pour les rôles
  }

  getAllCheckEvent() {
    return this.get<CheckEvent[]>(''); // GET /CheckEvent
  }
  getAllCheckEventByUser() {
    return this.get<CheckEvent[]>(`/me`); // GET /CheckEvent
  }

  getCheckEventById(id: string) {
    return this.get<any>(`/${id}`); // GET /CheckEvent/:id
  }

  createCheckEvent(Agent: Partial<CheckEvent>) {
    return this.post<CheckEvent>('', Agent); // POST /CheckEvent
  }

  updateCheckEvent(id: string, checkEvent: Partial<CheckEvent>) {
    return this.put<CheckEvent>(`/${id}`, checkEvent); // PUT /CheckEvent/:id
  }

  deleteCheckEvent(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /CheckEvent/:id
  }
}
