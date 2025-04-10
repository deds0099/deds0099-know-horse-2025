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

export interface Schedule {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  is_published: boolean;
  published_at: string | null;
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

export interface Minicourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructor_photo_url?: string;
  location: string;
  date: string;
  time: string;
  vacancies: number;
  vacancies_left: number;
  type: string;
  theme: string;
  price: number;
  image_url?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface MinicourseRegistration {
  id: string;
  minicourse_id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  institution: string;
  is_paid: boolean;
  payment_id?: string;
  payment_url?: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  minicourse?: Minicourse;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
