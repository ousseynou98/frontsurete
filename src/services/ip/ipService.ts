import axios from '../axios.config';

export interface Ip {
  id: string;
  name: string;
  startDate: string;
  refDate: string;
  expiredDate: string;
  site?: {
    id: string;
    name: string;
  };
}

export interface CreateIpDto {
  name: string;
  startDate: string;
  refDate: string;
  expiredDate: string;
  siteId: string;
}

class IpService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/ips`;

  async getAll(): Promise<Ip[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<Ip> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateIpDto): Promise<Ip> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateIpDto>): Promise<Ip> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new IpService();

