import type {
  PersonalFormData,
  GuestData,
  RoomGuestData,
} from "~/composables/usePersonalForm";
import { useAuthStore } from "~/stores/auth";
import { useUserProfile } from "~/composables/useUserProfile";

export const usePersonalPageLogic = () => {
  const authStore = useAuthStore();
  const { formData: userProfileData, fetchUserProfile } = useUserProfile();

  /**
   * Преобразует данные пользователя из профиля в формат GuestData
   */
  const userToGuestData = (
    user:
      | {
          name?: string;
          surname?: string;
          middle_name?: string;
          phone?: string;
          email?: string;
          country?: string;
        }
      | null
      | undefined,
  ): GuestData => {
    if (!user) {
      return {
        firstName: "",
        lastName: "",
        middleName: "",
        phone: "",
        email: "",
        citizenship: "",
      };
    }
    return {
      firstName: user.name || "",
      lastName: user.surname || "",
      middleName: user.middle_name || "",
      phone: user.phone || "",
      email: user.email || "",
      citizenship: user.country || "",
    };
  };

  /**
   * Проверяет, заполнена ли форма основного гостя
   */
  const isMainGuestFormFilled = (guest: GuestData): boolean => {
    return !!(guest.firstName || guest.lastName || guest.phone || guest.email);
  };

  /**
   * Заполняет форму данными пользователя, если он авторизован
   */
  const fillFormWithUserData = async (
    formData: PersonalFormData,
    isMultiRoomsMode: Ref<boolean>,
    selectedMultiRooms: Ref<
      Record<
        number,
        {
          roomIdx: number;
          roomCardIdx: number;
          roomTitle: string;
          room_type_code: string;
          ratePlanCode: string;
          price: number | null | undefined;
          title: string;
        }
      >
    >,
    createRoomGuestData: () => RoomGuestData,
  ) => {
    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    try {
      await fetchUserProfile();

      const userData =
        userProfileData.value &&
        (userProfileData.value.name || userProfileData.value.surname)
          ? userProfileData.value
          : authStore.user;

      // Проверяем, что userData существует перед преобразованием
      if (!userData) {
        return;
      }

      const guestData = userToGuestData(userData);

      if (
        guestData.firstName ||
        guestData.lastName ||
        guestData.phone ||
        guestData.email
      ) {
        if (isMultiRoomsMode.value) {
          // В режиме мультибронирования заполняем данные для всех номеров
          // Используем Object.values() чтобы получить правильные roomIdx из объектов
          Object.values(selectedMultiRooms.value).forEach((entry) => {
            const roomIdx = entry.roomIdx;
            if (!formData.roomGuests[roomIdx]) {
              formData.roomGuests[roomIdx] = createRoomGuestData();
            }
            // Заполняем только если форма пустая
            const roomMainGuest = formData.roomGuests[roomIdx].mainGuest;
            if (!isMainGuestFormFilled(roomMainGuest)) {
              formData.roomGuests[roomIdx].mainGuest = guestData;
            }
          });
        } else {
          // В режиме одного номера заполняем основную форму
          if (!isMainGuestFormFilled(formData.mainGuest)) {
            formData.mainGuest = guestData;
          }
        }
      }
    } catch {
      if (authStore.user) {
        // Проверяем, что authStore.user существует и имеет необходимые свойства
        const guestData = userToGuestData(authStore.user);
        if (
          guestData.firstName ||
          guestData.lastName ||
          guestData.phone ||
          guestData.email
        ) {
          if (isMultiRoomsMode.value) {
            // В режиме мультибронирования заполняем данные для всех номеров
            // Используем Object.values() чтобы получить правильные roomIdx из объектов
            Object.values(selectedMultiRooms.value).forEach((entry) => {
              const roomIdx = entry.roomIdx;
              if (!formData.roomGuests[roomIdx]) {
                formData.roomGuests[roomIdx] = createRoomGuestData();
              }
              const roomMainGuest = formData.roomGuests[roomIdx].mainGuest;
              if (!isMainGuestFormFilled(roomMainGuest)) {
                formData.roomGuests[roomIdx].mainGuest = guestData;
              }
            });
          } else {
            // В режиме одного номера заполняем основную форму
            if (!isMainGuestFormFilled(formData.mainGuest)) {
              formData.mainGuest = guestData;
            }
          }
        }
      }
    }
  };

  return {
    fillFormWithUserData,
    userToGuestData,
    isMainGuestFormFilled,
  };
};
