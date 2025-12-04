import type { ContactsPayload } from "~/types/contacts";

export const useContacts = () => {
  const { get } = useApi();

  const contacts = useState<ContactsPayload | null>("contacts", () => null);
  const loading = useState<boolean>("contacts-loading", () => false);
  const error = useState<string | null>("contacts-error", () => null);

  const fetchContacts = async (): Promise<void> => {
    if (contacts.value) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await get<ContactsPayload>("/v1/site/contacts");

      if (response.success && response.payload) {
        contacts.value = response.payload;
      } else {
        error.value = response.message || "Не удалось загрузить контакты";
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Произошла ошибка при загрузке контактов";
      error.value = errorMessage;
      console.error("Ошибка загрузки контактов:", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    contacts: readonly(contacts),
    loading: readonly(loading),
    error: readonly(error),
    fetchContacts,
  };
};
