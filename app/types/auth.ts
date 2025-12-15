export interface RegisterData {
  name: string;
  surname: string;
  middle_name?: string | null;
  email: string;
  phone: string;
  country: string;
  password: string;
  password_confirmation: string;
}

export interface RegisterResponse {
  accessToken: string;
}

export interface LoginResponse {
  accessToken: string;
  user?: {
    id: number;
    name?: string;
    surname?: string;
    phone?: string;
    country?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  payload: RegisterResponse;
}

// Профиль пользователя
export interface UserProfile {
  name: string;
  surname: string;
  middle_name: string;
  phone: string;
  email: string;
  country: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  payload: {
    id: number;
    name: string;
    surname: string;
    middle_name: string;
    email: string;
    phone: string;
    country: string;
  };
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  payload: Record<string, unknown>;
}
