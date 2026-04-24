export interface User {
  id: string;
  login: string;
  email: string;
  imageUrl: string;
  intendToHelp: boolean;
  firstVisit: boolean;
  waterCount: number;
}

export type UserRole = "volunteer" | "observer" | null;