// stores/auth.ts
import { defineStore } from "pinia";

export interface User {
  id: string;
  email: string;
  name: string;
  // другие поля пользователя
}

export const useAuthStore = defineStore(
  "auth",
  () => {
    const token = ref<string | null>(null);
    const user = ref<User | null>(null);

    const isAuthenticated = computed(() => !!token.value);

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function setUser(userData: User) {
      user.value = userData;
    }

    function logout() {
      token.value = null;
      user.value = null;
    }

    return {
      token,
      user,
      isAuthenticated,
      setToken,
      setUser,
      logout,
    };
  },
  {
    persist: {
      key: "auth-store",
      paths: ["token", "user"],
    },
  },
);
