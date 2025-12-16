import { reactive, ref, watch, nextTick } from "vue";
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

      // Не обновляем данные во время сохранения или обновления с сервера
      if (isSaving.value) {
        return;
      }

      // Используем данные из authStore.user как приоритетные (данные с сервера)
      const source = {
        name: user.name || "",
        surname: user.surname || "",
        middle_name: (user as { middle_name?: string }).middle_name || "",
        phone: user.phone || "",
        email: user.email || "",
        country: user.country || "",
      };

      // Проверяем, изменились ли данные в originalData, чтобы не перезаписывать formData без необходимости
      const hasOriginalDataChanged =
        originalData.name !== source.name ||
        originalData.surname !== source.surname ||
        originalData.middle_name !== source.middle_name ||
        originalData.phone !== source.phone ||
        originalData.email !== source.email ||
        originalData.country !== source.country;

      if (hasOriginalDataChanged) {
        // Обновляем originalData
        Object.assign(originalData, source);

        // Проверяем, есть ли несохраненные изменения в formData
        const hasUnsavedChanges =
          formData.name !== originalData.name ||
          formData.surname !== originalData.surname ||
          formData.middle_name !== originalData.middle_name ||
          formData.phone !== originalData.phone ||
          formData.email !== originalData.email ||
          formData.country !== originalData.country;

        // Перезаписываем formData только если нет несохраненных изменений
        // или если это первая загрузка данных (originalData был пустым)
        const wasOriginalDataEmpty =
          !originalData.name && !originalData.surname && !originalData.email;

        if (!hasUnsavedChanges || wasOriginalDataEmpty) {
          Object.assign(formData, source);
          hasChanges.value = false;
        }
        // Если есть несохраненные изменения, сохраняем их и только обновляем originalData
      }
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

      if (response.success && response.payload) {
        // Проверяем, что payload - это объект, а не массив
        // Если payload - массив или не объект, используем данные из формы
        let payloadData: UpdateProfileResponse["payload"];

        if (Array.isArray(response.payload)) {
          // Если payload - массив, это ошибка API, используем данные из формы
          if (import.meta.dev) {
            console.warn(
              "⚠️ API вернул массив вместо объекта, используем данные из формы",
            );
          }
          payloadData = {
            id: authStore.user?.id || 0,
            name: formData.name,
            surname: formData.surname,
            middle_name: formData.middle_name,
            phone: formData.phone,
            email: formData.email,
            country: formData.country,
          };
        } else {
          payloadData = response.payload as UpdateProfileResponse["payload"];
        }

        // Используем данные из ответа сервера, а не из формы
        const serverData = {
          name: payloadData.name || "",
          surname: payloadData.surname || "",
          middle_name: payloadData.middle_name || "",
          phone: payloadData.phone || "",
          email: payloadData.email || "",
          country: payloadData.country || "",
        };

        // Сначала обновляем originalData и formData данными с сервера
        // Это нужно сделать ДО обновления authStore, чтобы watcher не перезаписал данные
        Object.assign(originalData, serverData);
        Object.assign(formData, serverData);
        hasChanges.value = false;

        // Затем обновляем пользователя в authStore данными с сервера
        // Используем nextTick, чтобы гарантировать, что обновления formData и originalData завершены
        await nextTick();
        const updatedUser = {
          ...authStore.user,
          id: payloadData.id,
          name: serverData.name,
          surname: serverData.surname,
          middle_name: serverData.middle_name,
          phone: serverData.phone,
          email: serverData.email,
          country: serverData.country,
        };

        authStore.setUser(updatedUser);

        // Сохраняем данные в bookingStore
        if (payloadData.id) {
          bookingStore.saveUserProfile(payloadData.id, serverData);
        }

        toast.add({
          severity: "success",
          summary: "Успешно",
          detail: response.message || "Данные профиля успешно обновлены",
          life: 3000,
        });

        if (import.meta.dev) {
          console.log(
            "✅ Данные профиля обновлены из ответа сервера:",
            updatedUser,
          );
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
        // Используем данные из ответа сервера как приоритетные
        const profileData = {
          name: response.payload.name || "",
          surname: response.payload.surname || "",
          middle_name: response.payload.middle_name || "",
          phone: response.payload.phone || "",
          email: response.payload.email || "",
          country: response.payload.country || "",
        };

        // Сначала обновляем originalData и formData, чтобы watcher не перезаписал их старыми данными
        Object.assign(originalData, profileData);
        Object.assign(formData, profileData);
        hasChanges.value = false;

        // Затем обновляем пользователя в authStore данными с сервера
        // Используем nextTick, чтобы гарантировать, что обновления formData и originalData завершены
        const updatedUser = {
          ...authStore.user,
          id: response.payload.id,
          name: profileData.name,
          surname: profileData.surname,
          middle_name: profileData.middle_name,
          phone: profileData.phone,
          email: profileData.email,
          country: profileData.country,
        };

        await nextTick();
        authStore.setUser(updatedUser);

        // Сохраняем актуальные данные в bookingStore для использования в других местах
        if (response.payload.id) {
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
    updateFormData: (data: Partial<UserProfile>) => {
      Object.assign(formData, data);
    },
  };
};
