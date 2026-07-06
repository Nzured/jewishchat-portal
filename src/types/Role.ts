import { UserRef } from "./User";

export interface Role {
  id: string;
  role: string;
  description: string;
  users?: UserRef[];
}
