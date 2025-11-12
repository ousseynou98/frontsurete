import axios from '../axios.config';

export interface ItemChecklist {
  id: string;
  name: string;
  isValid: boolean;
  commentaire?: string;
  checklist?: {
    id: string;
    name: string;
  };
}

export interface CreateItemChecklistDto {
  name: string;
  isValid?: boolean;
  commentaire?: string;
  checklistId: string;
}

class ItemChecklistService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/items-checklist`;

  async getAll(): Promise<ItemChecklist[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<ItemChecklist> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateItemChecklistDto): Promise<ItemChecklist> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateItemChecklistDto>): Promise<ItemChecklist> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }

  // Méthode utilitaire pour créer plusieurs items en une fois
  async createBatch(items: CreateItemChecklistDto[]): Promise<ItemChecklist[]> {
    const promises = items.map(item => this.create(item));
    return Promise.all(promises);
  }
}

export default new ItemChecklistService();

