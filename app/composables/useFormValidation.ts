// composables/useFormValidation.ts
import type { RegisterData } from "~/types/auth";

export interface ValidationRules {
  [key: string]: {
    required?: boolean;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: (value: unknown, formData: unknown) => string | null;
  };
}

export interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = () => {
  const registerFormRules: ValidationRules = {
    surname: {
      required: true,
      maxLength: 255,
    },
    name: {
      required: true,
      maxLength: 255,
    },
    middle_name: {
      maxLength: 255,
    },
    phone: {
      required: true,
      maxLength: 32,
      pattern: /^[+]?[0-9\s\-()]{10,}$/,
      patternMessage: "Введите корректный телефон",
    },
    email: {
      required: true,
      maxLength: 255,
      pattern: /^\S+@\S+\.\S+$/,
      patternMessage: "Введите корректный email",
    },
    country: {
      required: true,
      maxLength: 255,
    },
    password: {
      required: true,
      custom: (value: string) => {
        if (!value) return "Пароль обязателен";
        if (value.length <= 8)
          return "Пароль должен содержать минимум 8 символов";
        return null;
      },
    },
    password_confirmation: {
      required: true,
      custom: (value: string, formData: RegisterData) => {
        if (!value) return "Подтвердите пароль";
        if (value !== formData.password) return "Пароли не совпадают";
        return null;
      },
    },
  };

  const validateField = (
    fieldName: string,
    value: unknown,
    rules: ValidationRules,
    formData?: unknown,
  ): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    if (
      rule.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      return getFieldLabel(fieldName) + " обязателен";
    }

    if (rule.maxLength && value && value.length > rule.maxLength) {
      return `${getFieldLabel(fieldName)} не должен превышать ${rule.maxLength} символов`;
    }

    if (rule.pattern && value && !rule.pattern.test(value)) {
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

  const validateRegisterForm = (
    formData: RegisterData,
    agreeTerms: boolean = false,
  ): ValidationErrors => {
    const errors: ValidationErrors = {};

    Object.keys(registerFormRules).forEach((fieldName) => {
      const error = validateField(
        fieldName,
        formData[fieldName as keyof RegisterData],
        registerFormRules,
        formData,
      );
      if (error) {
        errors[fieldName] = error;
      }
    });

    if (!agreeTerms) {
      errors.agreeTerms = "Необходимо согласие с правилами";
    }

    return errors;
  };

  const getFieldLabel = (fieldName: string): string => {
    const labels: { [key: string]: string } = {
      surname: "Фамилия",
      name: "Имя",
      middle_name: "Отчество",
      phone: "Телефон",
      email: "Почта",
      country: "Страна",
      password: "Пароль",
      password_confirmation: "Подтверждение пароля",
    };

    return labels[fieldName] || fieldName;
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
    validateField,
    registerFormRules,
    useValidationErrors,
  };
};
