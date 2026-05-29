import type { RegisterData } from "~/types/auth";

const REQUIRED_FIELD_MESSAGE = "Обязательное поле";

const requiredTextField = { required: true, maxLength: 255 } as const;

const phoneFieldRule = {
  required: true,
  maxLength: 32,
  pattern: /^[+]?[0-9\s\-()]{10,}$/,
  patternMessage: "Введите корректный телефон",
} as const;

const emailFieldRule = {
  required: true,
  maxLength: 255,
  pattern: /^\S+@\S+\.\S+$/,
  patternMessage: "Введите корректный email",
} as const;

const countryFieldRule = { required: true, maxLength: 255 } as const;

export interface ValidationRules<FormData = unknown> {
  [key: string]: {
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: (value: unknown, formData?: FormData) => string | null;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

const isRequiredValueEmpty = (value: unknown): boolean =>
  value == null || (typeof value === "string" && !value.trim());

const FIELD_LABELS: Record<string, string> = {
  surname: "Фамилия",
  name: "Имя",
  middle_name: "Отчество",
  phone: "Телефон",
  email: "Почта",
  country: "Страна",
  password: "Пароль",
  password_confirmation: "Подтверждение пароля",
};

const getFieldLabel = (fieldName: string): string =>
  FIELD_LABELS[fieldName] ?? fieldName;

export const useFormValidation = () => {
  const registerFormRules: ValidationRules<RegisterData> = {
    surname: requiredTextField,
    name: requiredTextField,
    middle_name: { maxLength: 255 },
    phone: phoneFieldRule,
    email: emailFieldRule,
    country: countryFieldRule,
    password: {
      required: true,
      custom: (value: unknown) => {
        if (typeof value === "string" && value.length < 3) {
          return "Пароль должен содержать минимум 3 символов";
        }
        return null;
      },
    },
    password_confirmation: {
      required: true,
      custom: (value: unknown, formData?: RegisterData) => {
        const valueStr = typeof value === "string" ? value : "";
        if (formData && valueStr !== formData.password) {
          return "Пароли не совпадают";
        }
        return null;
      },
    },
  };

  const guestFieldsRules: ValidationRules = {
    surname: requiredTextField,
    name: requiredTextField,
    middle_name: { maxLength: 255 },
    phone: phoneFieldRule,
    email: emailFieldRule,
    country: countryFieldRule,
  };

  const validateField = <FormData = unknown>(
    fieldName: string,
    value: unknown,
    rules: ValidationRules<FormData>,
    formData?: FormData,
  ): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    if (rule.required && isRequiredValueEmpty(value)) {
      return REQUIRED_FIELD_MESSAGE;
    }

    if (
      rule.maxLength &&
      typeof value === "string" &&
      value.length > rule.maxLength
    ) {
      return `${getFieldLabel(fieldName)} не должен превышать ${rule.maxLength} символов`;
    }

    if (
      rule.pattern &&
      typeof value === "string" &&
      !rule.pattern.test(value)
    ) {
      return (
        rule.patternMessage ||
        `Некорректный формат ${getFieldLabel(fieldName).toLowerCase()}`
      );
    }

    if (rule.custom) {
      return rule.custom(value, formData);
    }

    return null;
  };

  const collectValidationErrors = <FormData extends Record<string, unknown>>(
    rules: ValidationRules<FormData>,
    data: FormData,
    formData?: FormData,
  ): ValidationErrors => {
    const errors: ValidationErrors = {};
    for (const fieldName of Object.keys(rules)) {
      const error = validateField(fieldName, data[fieldName], rules, formData);
      if (error) errors[fieldName] = error;
    }
    return errors;
  };

  const validateGuestFields = (data: {
    surname: string;
    name: string;
    middle_name: string | null;
    phone: string;
    email: string;
    country: string;
  }): ValidationErrors => collectValidationErrors(guestFieldsRules, data);

  const validateRegisterForm = (
    formData: RegisterData,
    agreeTerms: boolean = false,
  ): ValidationErrors => {
    const errors = collectValidationErrors(
      registerFormRules,
      formData,
      formData,
    );

    if (!agreeTerms) {
      errors.agreeTerms = "Необходимо согласие с правилами";
    }

    return errors;
  };

  const useValidationErrors = () => {
    const errors = ref<ValidationErrors>({});

    const setErrors = (newErrors: ValidationErrors) => {
      errors.value = newErrors;
    };

    const clearErrors = () => {
      errors.value = {};
    };

    const hasErrors = computed(() => Object.keys(errors.value).length > 0);

    return {
      errors: readonly(errors),
      setErrors,
      clearErrors,
      hasErrors,
    };
  };

  return {
    validateRegisterForm,
    validateGuestFields,
    validateField,
    registerFormRules,
    useValidationErrors,
  };
};
