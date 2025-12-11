import { defineStore } from "pinia";

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  middle_name?: string;
  phone: string;
  country: string;
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function setUser(userData: User) {
      user.value = userData;
    }

    function setAuthData(newToken: string, userData: User) {
      token.value = newToken;
      user.value = userData;
      error.value = null;
    }

    function logout() {
      token.value = null;
      user.value = null;
      error.value = null;
    }

    function setLoading(value: boolean) {
      loading.value = value;
    }

    function setError(errorMessage: string | null) {
      error.value = errorMessage;
    }

    return {
      token,
      user,
      isAuthenticated,
      loading,
      error,
      setToken,
      setUser,
      setAuthData,
      logout,
      setLoading,
      setError,
    };
  },
  {
    persist: {
      key: "auth-store",
      paths: ["token", "user"],
    },
  },
);
