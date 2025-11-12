import { BaseService } from "services/base.service";

export interface Permission {
  id: string;
  name: string;
  value: string;
}

export class PermissionService extends BaseService {
  constructor() {
    super('/permissions'); // basePath pour les rôles
  }

  getAllPermissions() {
    return this.get<Permission[]>(''); // GET /Permissions
  }

  getPermissionById(id: string) {
    return this.get<any>(`/${id}`); // GET /Permissions/:id
  }

  createPermission(Permission: Partial<Permission>) {
    return this.post<Permission>('/', Permission); // POST /Permissions
  }

  updatePermission(id: string, Permission: Partial<Permission>) {
    return this.put<Permission>(`/${id}`, Permission); // PUT /Permissions/:id
  }

  deletePermission(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /Permissions/:id
  }
}
