import { reactive, ref, watch } from "vue";
import type {
  UserProfile,
  ProfileResponse,
  UpdateProfileResponse,
} from "~/types/auth";
import { useAuthStore } from "~/stores/auth";
import { useBookingStore } from "~/stores/booking";
import { useNotificationToast } from "~/composables/useToast";
import { useApi } from "~/composables/useApi";

export const useUserProfile = () => {
  const authStore = useAuthStore();
  const bookingStore = useBookingStore();
  const toast = useNotificationToast();

  const originalData = reactive<UserProfile>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  const formData = reactive<UserProfile>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  const isLoadingProfile = ref(false);
  const isSaving = ref(false);
  const hasChanges = ref(false);

  const handleError = (
    err: unknown,
    defaultMessage: string,
    summary = "Ошибка",
  ) => {
    if (import.meta.dev) {
      console.error("💥 Ошибка:", err);
    }
    const message = (err as { message?: string })?.message || defaultMessage;
    toast.add({
      severity: "error",
      summary,
      detail: message,
      life: 5000,
    });
  };

  // Отслеживаем изменения пользователя в authStore
  watch(
    () => authStore.user,
    (user) => {
      if (!user) return;

      const saved = user.id ? bookingStore.getUserProfile(user.id) : null;

      const source = saved || {
        name: user.name || "",
        surname: user.surname || "",
        middle_name: (user as { middle_name?: string }).middle_name || "",
        phone: user.phone || "",
        email: user.email || "",
        country: user.country || "",
      };
      Object.assign(originalData, source);
      Object.assign(formData, originalData);
      hasChanges.value = false;
    },
    { immediate: true },
  );

  const checkChanges = () => {
    const keys = Object.keys(originalData) as Array<keyof typeof originalData>;
    hasChanges.value = keys.some((key) => formData[key] !== originalData[key]);
  };

  const saveChanges = async () => {
    if (!authStore.user) return;

    isSaving.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Отправка обновленных данных профиля...");
      }

      const { put } = useApi();
      const response = (await put("/v1/users/profile", {
        name: formData.name,
        surname: formData.surname,
        middle_name: formData.middle_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
      })) as UpdateProfileResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (обновление профиля):", response);
      }

      if (response.success) {
        const updatedUser = { ...authStore.user, ...formData };
        authStore.setUser(updatedUser);

        if (authStore.user?.id) {
          bookingStore.saveUserProfile(authStore.user.id, {
            name: formData.name,
            surname: formData.surname,
            middle_name: formData.middle_name,
            phone: formData.phone,
            email: formData.email,
            country: formData.country,
          });
        }

        Object.assign(originalData, formData);
        hasChanges.value = false;

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: response.message || "Данные профиля успешно обновлены",
          life: 3000,
        });

        if (import.meta.dev) {
          console.log("✅ Данные профиля обновлены:", updatedUser);
        }
      } else {
        if (import.meta.dev) {
          console.warn("⚠️ Не удалось обновить профиль:", response.message);
        }
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail: response.message || "Не удалось обновить данные профиля",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось обновить данные профиля");
    } finally {
      isSaving.value = false;
    }
  };

  const fetchUserProfile = async () => {
    if (!authStore.user) return;

    isLoadingProfile.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Загрузка профиля пользователя...");
      }

      const { get } = useApi();
      const response = (await get("/v1/users/profile")) as ProfileResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (профиль):", response);
      }

      if (response.success && response.payload) {
        const updatedUser = {
          ...authStore.user,
          id: response.payload.id,
          name: response.payload.name || authStore.user?.name || "",
          surname: response.payload.surname || authStore.user?.surname || "",
          middle_name:
            response.payload.middle_name ||
            (authStore.user as { middle_name?: string })?.middle_name ||
            "",
          email: response.payload.email || authStore.user?.email || "",
          phone: response.payload.phone || authStore.user?.phone || "",
          country: response.payload.country || authStore.user?.country || "",
        };
        authStore.setUser(updatedUser);

        // Проверяем, есть ли уже сохраненный профиль в bookingStore
        const savedProfile = bookingStore.getUserProfile(response.payload.id);

        // Если есть сохраненный профиль, используем его вместо данных с API
        const profileData = savedProfile || {
          name: response.payload.name || "",
          surname: response.payload.surname || "",
          middle_name: response.payload.middle_name || "",
          phone: response.payload.phone || "",
          email: response.payload.email || "",
          country: response.payload.country || "",
        };

        Object.assign(originalData, profileData);
        Object.assign(formData, profileData);
        hasChanges.value = false;

        if (!savedProfile) {
          bookingStore.saveUserProfile(response.payload.id, profileData);
        }

        if (import.meta.dev) {
          console.log("✅ Профиль загружен:", profileData);
          console.log(
            "✅ Пользователь обновлен в authStore с id:",
            response.payload.id,
          );
        }
      } else {
        if (import.meta.dev) {
          console.warn("⚠️ Не удалось загрузить профиль:", response.message);
        }
        toast.add({
          severity: "warn",
          summary: "Внимание",
          detail: response.message || "Не удалось загрузить данные профиля",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось загрузить данные профиля");
    } finally {
      isLoadingProfile.value = false;
    }
  };

  return {
    formData,
    originalData,
    isLoadingProfile,
    isSaving,
    hasChanges,
    checkChanges,
    saveChanges,
    fetchUserProfile,
  };
};
