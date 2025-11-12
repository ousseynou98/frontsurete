import axios from '../axios.config';

export interface Comite {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'EN COURS' | 'CLOTURÉ';
  rso: {
    id: string;
    name: string;
  };
  ip: {
    id: string;
    name: string;
  };
  analyses?: Array<{
    id: string;
    titre: string;
  }>;
  inspections?: Array<{
    id: string;
    desc: string;
    style: string;
    type: string;
    status: string;
  }>;
}

export interface CreateComiteDto {
  name: string;
  startDate: string;
  endDate?: string;
  status: 'EN COURS' | 'CLOTURÉ';
  rsoId: string;
  ipId: string;
}

class ComiteService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/comites`;

  async getAll(): Promise<Comite[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<Comite> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateComiteDto): Promise<Comite> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateComiteDto>): Promise<Comite> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new ComiteService();

