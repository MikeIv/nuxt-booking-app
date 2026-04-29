import type { BookingData } from "~/types/booking";
import { countriesRu } from "~/utils/countries";

const HH_MM_TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;

export interface GuestData {
  lastName: string;
  firstName: string;
  middleName: string;
  phone: string;
  email: string;
  citizenship: string;
}

export interface RoomGuestData {
  mainGuest: GuestData;
  additionalGuests: GuestData[];
}

export interface PersonalFormData {
  mainGuest: GuestData;
  additionalGuests: GuestData[];
  roomGuests: Record<number, RoomGuestData>;
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

type AdditionalFieldKey = "checkInTime" | "checkOutTime" | "comment";

export interface AdditionalField {
  key: AdditionalFieldKey;
  placeholder: string;
  type: "text" | "select" | "textarea";
}

export interface FormErrors {
  mainGuest: Partial<GuestData>;
  additionalGuests: Array<Partial<GuestData>>;
  roomGuests: Record<
    number,
    {
      mainGuest: Partial<GuestData>;
      additionalGuests: Array<Partial<GuestData>>;
    }
  >;
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
      label: "Я даю согласие на получение специальных предложений и новостей",
    },
  ];

  const additionalFields: AdditionalField[] = [
    {
      key: "checkInTime",
      placeholder: "Время заезда",
      type: "select",
    },
    {
      key: "checkOutTime",
      placeholder: "Время выезда",
      type: "select",
    },
    {
      key: "comment",
      placeholder: "Комментарий",
      type: "textarea",
    },
  ];

  const createFormData = (): PersonalFormData => ({
    mainGuest: initialGuestData(),
    additionalGuests: [],
    roomGuests: {},
    smsConfirmation: false,
    specialOffers: false,
    checkInTime: "",
    checkOutTime: "",
    comment: "",
    paymentMethod: "card",
    agreement: false,
    forSelf: true,
  });

  const createRoomGuestData = (): RoomGuestData => ({
    mainGuest: initialGuestData(),
    additionalGuests: [],
  });

  const validateGuest = (guest: GuestData): Partial<GuestData> => {
    const guestErrors: Partial<GuestData> = {};
    const { validateGuestFields } = useFormValidation();
    const result = validateGuestFields({
      surname: guest.lastName,
      name: guest.firstName,
      middle_name: guest.middleName || null,
      phone: guest.phone,
      email: guest.email,
      country: guest.citizenship,
    });

    if (result.surname) guestErrors.lastName = result.surname;
    if (result.name) guestErrors.firstName = result.name;
    if (result.middle_name) guestErrors.middleName = result.middle_name;
    if (result.phone) guestErrors.phone = result.phone;
    if (result.email) guestErrors.email = result.email;
    if (result.country) guestErrors.citizenship = result.country;

    return guestErrors;
  };

  const validateForm = (
    formData: PersonalFormData,
    errors: FormErrors,
    isMultiRooms: boolean = false,
  ): boolean => {
    let isValid = true;
    errors.mainGuest = {};
    errors.additionalGuests = [];
    errors.roomGuests = {};
    errors.agreement = "";

    if (isMultiRooms) {
      // В режиме мультибронирования валидируем данные по номерам
      Object.keys(formData.roomGuests).forEach((roomIdxStr) => {
        const roomIdx = Number(roomIdxStr);
        const roomData = formData.roomGuests[roomIdx];
        if (!roomData) return;

        if (!errors.roomGuests[roomIdx]) {
          errors.roomGuests[roomIdx] = {
            mainGuest: {},
            additionalGuests: [],
          };
        }

        const roomErrors = errors.roomGuests[roomIdx]!;

        const mainGuestErrors = validateGuest(roomData.mainGuest);
        if (Object.keys(mainGuestErrors).length > 0) {
          roomErrors.mainGuest = mainGuestErrors;
          isValid = false;
        }

        roomData.additionalGuests.forEach((guest, index) => {
          const guestErrors = validateGuest(guest);
          if (Object.keys(guestErrors).length > 0) {
            if (!roomErrors.additionalGuests[index]) {
              roomErrors.additionalGuests[index] = {};
            }
            Object.assign(roomErrors.additionalGuests[index], guestErrors);
            isValid = false;
          }
        });
      });
    } else {
      // В режиме одного номера валидируем основную форму
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
    }

    if (!formData.agreement) {
      errors.agreement = "Необходимо согласие с правилами бронирования.";
      isValid = false;
    }

    return isValid;
  };

  const formatDateTime = (
    date: Date,
    time: string,
    formatDate: (date: Date) => string,
  ): string | null => {
    if (!date || !time) return null;
    if (!HH_MM_TIME_REGEX.test(time)) {
      console.warn(`Неверный формат времени: ${time}. Ожидается HH:mm.`);
      return null;
    }
    const formattedDate = formatDate(date);
    if (!formattedDate) return null;
    return `${formattedDate}T${time}:00Z`;
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
          ? formatDateTime(date[0], formData.checkInTime, formatDate)
          : null,
        end_at: formData.checkOutTime
          ? formatDateTime(date[1], formData.checkOutTime, formatDate)
          : null,
        comment: formData.comment || null,
      },
      rooms: [
        {
          room_type_code: selectedRoomType,
          rate_type_code: selectedTariff.rate_plan_code,
          packages: packages && packages.length > 0 ? packages : undefined,
          adults,
          children,
          children_ages: childrenAges,
          guests: allGuests,
        },
      ],
    };
  };

  const prepareMultiBookingData = (
    formData: PersonalFormData,
    date: [Date, Date] | null,
    selectedMultiRooms: Record<
      number,
      {
        roomIdx: number;
        roomTitle: string;
        room_type_code: string;
        ratePlanCode: string;
        price: number | null | undefined;
        title: string;
      }
    >,
    formatDate: (date: Date) => string,
    guestsList?: Array<{
      adults: number;
      children: number;
      childrenAges: number[];
    }>,
    /** Пакеты (package_code) по индексу номера для мультибронирования */
    packagesPerRoom?: Record<number, string[]>,
  ): BookingData | null => {
    if (!date || Object.keys(selectedMultiRooms).length === 0) return null;

    // Сортируем по roomIdx для корректного порядка
    const sortedEntries = Object.values(selectedMultiRooms).sort(
      (a, b) => a.roomIdx - b.roomIdx,
    );

    // Вычисляем общее количество взрослых и детей
    const totalAdults = sortedEntries.reduce((sum, entry) => {
      const roomGuests = guestsList?.[entry.roomIdx];
      return sum + (roomGuests?.adults || 0);
    }, 0);

    const totalChildren = sortedEntries.reduce((sum, entry) => {
      const roomGuests = guestsList?.[entry.roomIdx];
      return sum + (roomGuests?.children || 0);
    }, 0);

    const allChildrenAges = sortedEntries.reduce((ages, entry) => {
      const roomGuests = guestsList?.[entry.roomIdx];
      return ages.concat(roomGuests?.childrenAges || []);
    }, [] as number[]);

    // Создаем массив комнат с гостями из данных по номерам
    const rooms = sortedEntries.map((entry, index) => {
      const isFirstRoom = index === 0;
      const roomGuestData = formData.roomGuests[entry.roomIdx];

      // Если есть данные для этого номера, используем их, иначе используем основного гостя
      const mainGuest = roomGuestData?.mainGuest || formData.mainGuest;
      const additionalGuests = roomGuestData?.additionalGuests || [];

      // Базовый массив гостей: основной гость номера
      const baseGuests = [
        {
          name: mainGuest.firstName,
          surname: mainGuest.lastName,
          middle_name: mainGuest.middleName || null,
          phone: mainGuest.phone,
          email: mainGuest.email,
          nationality: mainGuest.citizenship || "",
          sms_confirmation: isFirstRoom ? formData.smsConfirmation : false,
          email_subscribe: isFirstRoom ? formData.specialOffers : false,
        },
      ];

      // Добавляем дополнительных гостей для этого номера
      const additionalGuestsData = additionalGuests.map((guest) => ({
        name: guest.firstName,
        surname: guest.lastName,
        middle_name: guest.middleName || null,
        phone: guest.phone,
        email: guest.email,
        nationality: guest.citizenship || "",
        sms_confirmation: false,
        email_subscribe: false,
      }));

      // Объединяем гостей
      const guests = [...baseGuests, ...additionalGuestsData];

      // Получаем состав гостей для этого номера из guestsList
      const roomGuests = guestsList?.[entry.roomIdx];
      const roomAdults = roomGuests?.adults || 0;
      const roomChildren = roomGuests?.children || 0;
      const roomChildrenAges = roomGuests?.childrenAges || [];

      const roomPackages = packagesPerRoom?.[entry.roomIdx];
      return {
        room_type_code: entry.room_type_code,
        rate_type_code: entry.ratePlanCode,
        packages:
          roomPackages && roomPackages.length > 0 ? roomPackages : undefined,
        adults: roomAdults,
        children: roomChildren,
        children_ages: roomChildrenAges,
        guests,
      };
    });

    return {
      for_self: formData.forSelf,
      start_at: formatDate(date[0]),
      end_at: formatDate(date[1]),
      adults: totalAdults,
      children: totalChildren,
      payment: formData.paymentMethod || "",
      agreements: formData.agreement,
      children_ages: allChildrenAges,
      additional: {
        start_at: formData.checkInTime
          ? formatDateTime(date[0], formData.checkInTime, formatDate)
          : null,
        end_at: formData.checkOutTime
          ? formatDateTime(date[1], formData.checkOutTime, formatDate)
          : null,
        comment: formData.comment || null,
      },
      rooms,
    };
  };

  return {
    formFields,
    paymentMethods,
    checkboxOptions,
    additionalFields,
    countriesRu,
    createFormData,
    createRoomGuestData,
    initialGuestData,
    validateGuest,
    validateForm,
    formatDateTime,
    prepareBookingData,
    prepareMultiBookingData,
  };
};
