import api from './axios.config';

export class BaseService {
  protected baseUrl: string;

  constructor(basePath: string) {
    this.baseUrl = basePath;
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    const { data } = await api.get<T>(`${this.baseUrl}${endpoint}`, { params });
    return data;
  }

  async post<T>(endpoint: string, body: any, config?: any): Promise<T> {
    const { data } = await api.post<T>(`${this.baseUrl}${endpoint}`, body, config);
    return data;
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await api.put<T>(`${this.baseUrl}${endpoint}`, body);
    return data;
  }
   async patch<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await api.patch<T>(`${this.baseUrl}${endpoint}`, body);
    return data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const { data } = await api.delete<T>(`${this.baseUrl}${endpoint}`);
    return data;
  }
}
