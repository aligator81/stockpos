import { Admin, Employee } from './index';

export interface AuthContextType {
  admin: Admin | null;
  employee: Employee | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}