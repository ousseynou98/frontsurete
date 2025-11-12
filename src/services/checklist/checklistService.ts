import axios from '../axios.config';

export interface Checklist {
  id: string;
  name: string;
  inspection?: {
    id: string;
  };
  items?: ItemChecklistEntity[];
}

export interface ItemChecklistEntity {
  id: string;
  name: string;
  isChecked: boolean;
  commentaire?: string;
}

export interface CreateChecklistDto {
  name: string;
  inspectionId: string;
}

class ChecklistService {
  private baseURL =  `${process.env.NEXT_PUBLIC_API_URL}/checklist`;

  async getAll(): Promise<Checklist[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<Checklist> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateChecklistDto): Promise<Checklist> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateChecklistDto>): Promise<Checklist> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new ChecklistService();

