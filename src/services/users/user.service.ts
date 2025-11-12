import { BaseService } from "services/base.service";

export interface User {
  id: string;
  lastname: string;
  firstname: string;
  password: string;
  genre: string;
  address: string;
  email:string;
  role:any;
  entite:any;
  isActive:boolean;
  lastLoginAt:Date,
  roleId: string;
  entiteId: string;
  phone: string;
}

export class UserService extends BaseService {
  constructor() {
    super('/users'); // basePath pour les rôles
  }

  getAllUsers() {
    return this.get<{ data: User[] }>('/list'); // GET /Users
  }

  getUserById(id: string) {
    return this.get<User>(`/${id}`); // GET /Users/:id
  }

  createUser(User: Partial<User>) {
    return this.post<User>('', User); // POST /Users
  }

  updateUser(id: string, User: Partial<User>) {
    return this.put<User>(`/${id}`, User); // PUT /Users/:id
  }
  updateUserStatus(id: string, User: Partial<User>) {
    return this.put<User>(`/${id}/status`, User); // PUT /Users/:id
  }

  deleteUser(id: string) {
    return this.delete<void>(`/${id}`); // DELETE /Users/:id
  }
}
