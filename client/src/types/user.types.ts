export interface User {
  id: string;
  login: string;
  email: string;
  imageUrl: string;
  intendToHelp: boolean;
  firstVisit: boolean;
}

export type UserRole = "volunteer" | "observer" | null;