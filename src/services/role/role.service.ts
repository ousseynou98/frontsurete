import { BaseService } from "services/base.service";

export interface Role {
  id: string;
  name: string;
  permissions:any[]
}

export class RoleService extends BaseService {
  constructor() {
    super('/roles'); // basePath pour les rôles
  }

  getAllRoles() {
    return this.get<Role[]>(''); // GET /roles
  }

  getRoleById(id: string) {
    return this.get<any>(`/${id}`); // GET /roles/:id
  }

  createRole(role: Partial<Role>) {
    return this.post<Role>('/', role); // POST /roles
  }

  updateRole(id: string, role: Partial<Role>) {
    return this.put<Role>(`/${id}`, role); // PUT /roles/:id
  }

  deleteRole(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /roles/:id
  }
}
