import { BaseService } from "services/base.service";

export interface Entite {
  id: string;
  name: string;
  address: string;
}

export class EntiteService extends BaseService {
  constructor() {
    super('/entite'); // basePath pour les Entites
  }

  getAllEntites() {
    return this.get<Entite[]>(''); // GET /Entites
  }

  getEntiteById(id: string) {
    return this.get<any>(`/${id}`); // GET /Entites/:id
  }

  createEntite(Entite: Partial<Entite>) {
    return this.post<Entite>('', Entite); // POST /Entites
  }

  updateEntite(id: string, Entite: Partial<Entite>) {
    return this.put<Entite>(`/${id}`, Entite); // PUT /Entites/:id
  }

  deleteEntite(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /Entites/:id
  }
}
