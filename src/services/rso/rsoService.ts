import axios from '../axios.config';

export interface Rso {
  id: string;
  name: string;
}

export interface CreateRsoDto {
  name: string;
}

class RsoService  {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/rsos`;

  async getAll(): Promise<Rso[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<Rso> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateRsoDto): Promise<Rso> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateRsoDto>): Promise<Rso> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new RsoService();

