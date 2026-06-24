import type {
  PersonalFormData,
  GuestData,
  RoomGuestData,
} from "~/composables/usePersonalForm";
import type { SelectedEntry } from "~/types/booking";
import { useAuthStore } from "~/stores/auth";
import { useUserProfile } from "~/composables/useUserProfile";
import { getSortedMultiRoomEntries } from "~/utils/multiBooking";

type UserProfileSource =
  | {
      name?: string;
      surname?: string;
      middle_name?: string;
      phone?: string;
      email?: string;
      country?: string;
    }
  | null
  | undefined;

export const usePersonalPageLogic = () => {
  const authStore = useAuthStore();
  const { formData: userProfileData, fetchUserProfile } = useUserProfile();

  const userToGuestData = (user: UserProfileSource): GuestData => {
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

  const isMainGuestFormFilled = (guest: GuestData): boolean =>
    Boolean(guest.firstName || guest.lastName || guest.phone || guest.email);

  const applyGuestDataToForm = (
    formData: PersonalFormData,
    isMultiRoomsMode: boolean,
    selectedMultiRooms: Record<string, SelectedEntry>,
    createRoomGuestData: () => RoomGuestData,
    guestData: GuestData,
  ) => {
    if (isMultiRoomsMode) {
      const firstEntry = getSortedMultiRoomEntries(selectedMultiRooms)[0];
      if (!firstEntry) return;

      const { roomIdx } = firstEntry;
      if (!formData.roomGuests[roomIdx]) {
        formData.roomGuests[roomIdx] = createRoomGuestData();
      }

      const roomMainGuest = formData.roomGuests[roomIdx].mainGuest;
      if (!isMainGuestFormFilled(roomMainGuest)) {
        formData.roomGuests[roomIdx].mainGuest = { ...guestData };
      }
      return;
    }

    if (!isMainGuestFormFilled(formData.mainGuest)) {
      formData.mainGuest = { ...guestData };
    }
  };

  /**
   * Заполняет форму данными пользователя, если он авторизован.
   * В мультибронировании — только основной гость первого номера.
   */
  const fillFormWithUserData = async (
    formData: PersonalFormData,
    isMultiRoomsMode: Ref<boolean>,
    selectedMultiRooms: Ref<Record<string, SelectedEntry>>,
    createRoomGuestData: () => RoomGuestData,
  ) => {
    if (!authStore.isAuthenticated || !authStore.user) {
      return;
    }

    const applyFromUser = (user: UserProfileSource) => {
      const guestData = userToGuestData(user);
      if (!isMainGuestFormFilled(guestData)) return;

      applyGuestDataToForm(
        formData,
        isMultiRoomsMode.value,
        selectedMultiRooms.value,
        createRoomGuestData,
        guestData,
      );
    };

    try {
      await fetchUserProfile();

      const userData =
        userProfileData.value &&
        (userProfileData.value.name || userProfileData.value.surname)
          ? userProfileData.value
          : authStore.user;

      applyFromUser(userData);
    } catch {
      applyFromUser(authStore.user);
    }
  };

  return {
    fillFormWithUserData,
    userToGuestData,
    isMainGuestFormFilled,
  };
};
