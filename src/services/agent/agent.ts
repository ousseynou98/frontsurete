import { BaseService } from "services/base.service";

export interface Agent {
  id: string;
  name: string;
  mat:string;
  email:string;
  active:boolean;
}

export class AgentService extends BaseService {
  constructor() {
    super('/agent'); // basePath pour les rôles
  }

  getAllAgents() {
    return this.get<Agent[]>(''); // GET /Agents
  }
  getAllAgentsByUser() {
    return this.get<Agent[]>(`/me`); // GET /Agents
  }

  getAgentById(id: string) {
    return this.get<any>(`/byId/${id}`); // GET /Agents/:id
  }

  createAgent(Agent: Partial<Agent>) {
    return this.post<Agent>('', Agent); // POST /Agents
  }

  updateAgent(id: string, Agent: Partial<Agent>) {
    return this.put<Agent>(`/${id}`, Agent); // PUT /Agents/:id
  }

  deleteAgent(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /Agents/:id
  }

    updateAgentStatus(id: string, agent: Partial<Agent>) {
      return this.put<Agent>(`/${id}/status`, agent); // PUT /agent/:id/status
    }
  
}
