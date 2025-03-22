export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  image_size?: 'small' | 'medium' | 'full' | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
}

export type Subscription = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  institution: string;
  status: string;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string;
};

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
