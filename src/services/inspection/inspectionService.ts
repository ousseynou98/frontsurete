import axios from '../axios.config';

export interface Inspection {
  id: string;
  style: string;
  type: string;
  desc: string;
  date_insp: string;
  porteur?: string;
  inspecteur?: string;
  status: string;
  data?: any;
  navire?: string;
  imo_number?: string;
  osn_capitaine?: string;
  comite: {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    status: string;
    rso?: {
      id: string;
      name: string;
    };
    ip?: {
      id: string;
      name: string;
    };
  };
  checklists?: Array<{
    id: string;
    name: string;
  }>;
}

export interface CreateInspectionDto {
  style: string;
  type: string;
  desc: string;
  date_insp: string;
  porteur?: string;
  inspecteur?: string;
  status?: string;
  data?: any;
  navire?: string;
  imo_number?: string;
  osn_capitaine?: string;
  comiteId: string;
}

class InspectionService {
  private baseURL = `${process.env.NEXT_PUBLIC_API_URL}/inspections`;

  async getAll(): Promise<Inspection[]> {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async getOne(id: string): Promise<Inspection> {
    const response = await axios.get(`${this.baseURL}/${id}`);
    return response.data;
  }

  async create(data: CreateInspectionDto): Promise<Inspection> {
    const response = await axios.post(this.baseURL, data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateInspectionDto>): Promise<Inspection> {
    const response = await axios.patch(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  async submit(id: string, data: any): Promise<Inspection> {
    const response = await axios.patch(`${this.baseURL}/${id}/submit`, { data });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/${id}`);
  }
}

export default new InspectionService();

