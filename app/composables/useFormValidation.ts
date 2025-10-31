import type { RegisterData } from "~/types/auth";

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

export const useFormValidation = () => {
  const registerFormRules: ValidationRules<RegisterData> = {
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
      custom: (value: unknown) => {
        if (
          value == null ||
          (typeof value === "string" && value.trim().length === 0)
        ) {
          return "Пароль обязателен";
        }
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
        if (valueStr.trim().length === 0) return "Подтвердите пароль";
        if (formData && valueStr !== formData.password)
          return "Пароли не совпадают";
        return null;
      },
    },
  };

  const validateField = <FormData = unknown>(
    fieldName: string,
    value: unknown,
    rules: ValidationRules<FormData>,
    formData?: FormData,
  ): string | null => {
    const rule = rules[fieldName];
    if (!rule) return null;

    if (
      rule.required &&
      (!value || (typeof value === "string" && !value.trim()))
    ) {
      return getFieldLabel(fieldName) + " обязателен";
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
