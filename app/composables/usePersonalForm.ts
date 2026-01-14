import type { BookingData } from "~/types/booking";
import { countriesRu } from "~/utils/countries";

export interface GuestData {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  citizenship: string;
}

export interface PersonalFormData {
  mainGuest: GuestData;
  additionalGuests: GuestData[];
  smsConfirmation: boolean;
  specialOffers: boolean;
  checkInTime: string;
  checkOutTime: string;
  comment: string;
  paymentMethod: string;
  agreement: boolean;
  forSelf: boolean;
}

export interface FormField {
  key: keyof GuestData;
  placeholder: string;
  type: string;
  required: boolean;
}

export interface FormErrors {
  mainGuest: Partial<GuestData>;
  additionalGuests: Array<Partial<GuestData>>;
  agreement: string;
}

const initialGuestData = (): GuestData => ({
  lastName: "",
  firstName: "",
  middleName: "",
  phone: "",
  email: "",
  citizenship: "",
});

export const usePersonalForm = () => {
  const { validateRegisterForm } = useFormValidation();

  const formFields: FormField[] = [
    {
      key: "lastName",
      placeholder: "Фамилия",
      type: "text",
      required: true,
    },
    {
      key: "firstName",
      placeholder: "Имя",
      type: "text",
      required: true,
    },
    {
      key: "middleName",
      placeholder: "Отчество",
      type: "text",
      required: false,
    },
    {
      key: "phone",
      placeholder: "Номер телефона",
      type: "tel",
      required: true,
    },
    {
      key: "email",
      placeholder: "Почта",
      type: "email",
      required: true,
    },
    {
      key: "citizenship",
      placeholder: "Гражданство",
      type: "text",
      required: false,
    },
  ];

  const paymentMethods = [
    { label: "Банковской картой", value: "card" },
    { label: "Наличными при заселении", value: "cash" },
    { label: "Банковским переводом", value: "transfer" },
  ];

  const checkboxOptions = [
    {
      id: "sms",
      key: "smsConfirmation" as const,
      label: "Пришлите SMS-подтверждение",
    },
    {
      id: "information",
      key: "specialOffers" as const,
      label: "Я хочу узнавать о специальных предложениях и новостях",
    },
  ];

  const additionalFields = [
    {
      key: "checkInTime" as const,
      placeholder: "Время заезда",
      type: "text",
    },
    {
      key: "checkOutTime" as const,
      placeholder: "Время выезда",
      type: "text",
    },
    {
      key: "comment" as const,
      placeholder: "Комментарий",
      type: "text",
    },
  ];

  const createFormData = (): PersonalFormData => ({
    mainGuest: initialGuestData(),
    additionalGuests: [],
    smsConfirmation: false,
    specialOffers: false,
    checkInTime: "",
    checkOutTime: "",
    comment: "",
    paymentMethod: "",
    agreement: false,
    forSelf: true,
  });

  const guestToRegisterData = (guest: GuestData) => ({
    surname: guest.lastName,
    name: guest.firstName,
    middle_name: guest.middleName || null,
    phone: guest.phone,
    email: guest.email,
    country: guest.citizenship,
    password: "dummy_password",
    password_confirmation: "dummy_password",
  });

  const validateGuest = (guest: GuestData): Partial<GuestData> => {
    const guestErrors: Partial<GuestData> = {};
    const registerData = guestToRegisterData(guest);
    const guestValidation = validateRegisterForm(registerData, true);

    if (guestValidation.surname) guestErrors.lastName = guestValidation.surname;
    if (guestValidation.name) guestErrors.firstName = guestValidation.name;
    if (guestValidation.middle_name)
      guestErrors.middleName = guestValidation.middle_name;
    if (guestValidation.phone) guestErrors.phone = guestValidation.phone;
    if (guestValidation.email) guestErrors.email = guestValidation.email;
    if (guestValidation.country)
      guestErrors.citizenship = guestValidation.country;

    return guestErrors;
  };

  const validateForm = (
    formData: PersonalFormData,
    errors: FormErrors,
  ): boolean => {
    let isValid = true;
    errors.mainGuest = {};
    errors.additionalGuests = [];
    errors.agreement = "";

    const mainGuestErrors = validateGuest(formData.mainGuest);
    if (Object.keys(mainGuestErrors).length > 0) {
      errors.mainGuest = mainGuestErrors;
      isValid = false;
    }

    formData.additionalGuests.forEach((guest, index) => {
      const guestErrors = validateGuest(guest);
      if (Object.keys(guestErrors).length > 0) {
        if (!errors.additionalGuests[index]) {
          errors.additionalGuests[index] = {};
        }
        Object.assign(errors.additionalGuests[index], guestErrors);
        isValid = false;
      }
    });

    if (!formData.agreement) {
      errors.agreement = "Необходимо согласие с правилами бронирования.";
      isValid = false;
    }

    return isValid;
  };

  const formatDateTime = (date: Date, time: string): string | null => {
    if (!date || !time) return null;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      console.warn(`Неверный формат времени: ${time}. Ожидается HH:mm.`);
      return null;
    }
    const [hours, minutes] = time.split(":").map(Number);
    if (hours === undefined || minutes === undefined) return null;
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toISOString();
  };

  const prepareBookingData = (
    formData: PersonalFormData,
    date: [Date, Date] | null,
    selectedRoomType: string | null,
    selectedTariff: { rate_plan_code: string } | null,
    formatDate: (date: Date) => string,
    guestsData?: {
      adults: number;
      children: number;
      childrenAges: number[];
    },
    packages?: string[],
  ): BookingData | null => {
    if (!date || !selectedRoomType || !selectedTariff) return null;

    const allGuests = [
      {
        name: formData.mainGuest.firstName,
        surname: formData.mainGuest.lastName,
        middle_name: formData.mainGuest.middleName || null,
        phone: formData.mainGuest.phone,
        email: formData.mainGuest.email,
        nationality: formData.mainGuest.citizenship || "",
        sms_confirmation: formData.smsConfirmation,
        email_subscribe: formData.specialOffers,
      },
      ...formData.additionalGuests.map((guest) => ({
        name: guest.firstName,
        surname: guest.lastName,
        middle_name: guest.middleName || null,
        phone: guest.phone,
        email: guest.email,
        nationality: guest.citizenship || "",
        sms_confirmation: false,
        email_subscribe: false,
      })),
    ];

    const adults = guestsData?.adults ?? 1;
    const children = guestsData?.children ?? 0;
    const childrenAges = guestsData?.childrenAges ?? [];

    return {
      for_self: formData.forSelf,
      start_at: formatDate(date[0]),
      end_at: formatDate(date[1]),
      adults,
      children,
      payment: formData.paymentMethod || "",
      agreements: formData.agreement,
      children_ages: childrenAges,
      additional: {
        start_at: formData.checkInTime
          ? formatDateTime(date[0], formData.checkInTime)
          : null,
        end_at: formData.checkOutTime
          ? formatDateTime(date[1], formData.checkOutTime)
          : null,
        comment: formData.comment || null,
      },
      rooms: [
        {
          room_type_code: selectedRoomType,
          rate_type_code: selectedTariff.rate_plan_code,
          packages: packages && packages.length > 0 ? packages : undefined,
          guests: allGuests,
        },
      ],
    };
  };

  return {
    formFields,
    paymentMethods,
    checkboxOptions,
    additionalFields,
    countriesRu,
    createFormData,
    initialGuestData,
    validateGuest,
    validateForm,
    formatDateTime,
    prepareBookingData,
  };
};
