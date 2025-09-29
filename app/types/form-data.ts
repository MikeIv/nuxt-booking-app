export interface FormData {
  lastName: string;
  firstName: string;
  phone: string;
  email: string;
  citizenship: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface FormErrors {
  lastName?: string;
  firstName?: string;
  phone?: string;
  email?: string;
  citizenship?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}
