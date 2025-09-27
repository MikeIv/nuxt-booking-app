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

export interface AuthResponse {
  success: boolean;
  message: string;
  payload: RegisterResponse;
}
