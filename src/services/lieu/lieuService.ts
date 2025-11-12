import axios from '../axios.config';

export interface Lieu {
  id: string;
  name: string;
  description?: string;
  adresse?: string;
  type?: string;
}

class LieuService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/lieu`;

  async getAll(): Promise<Lieu[]> {
    const response = await axios.get(`${this.baseURL}/all`);
    return response.data;
  }

  async getOne(id: string): Promise<Lieu> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: Partial<Lieu>): Promise<Lieu> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<Lieu>): Promise<Lieu> {
    const response = await axios.put(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new LieuService();

