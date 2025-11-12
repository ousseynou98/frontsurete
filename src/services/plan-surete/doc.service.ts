import { BaseService } from "services/base.service";


export class DocService extends BaseService {
  constructor() {
    super('/docs');
  }

uploadFiles(files: File[], analyseId: string): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    console.log(formData.getAll('files'));
    const url =`/upload/${encodeURIComponent(analyseId)}`;
    return this.post<any>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
}

downloadFile(id: string): Promise<Blob> {
    return this.get<Blob>(`/download/${id}`, { responseType: 'blob' });
}

getDocumentById(id: string) {
    return this.get<any>(`/${id}`);
}

deleteDoc(id: string): Promise<void> {
    return this.delete<void>(`/${id}`);
}
}

export const docService = new DocService();