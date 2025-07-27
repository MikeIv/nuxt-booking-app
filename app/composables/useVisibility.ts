import { onMounted, ref } from "vue";

export const useVisibility = (delay = 1000) => {
  const isVisible = ref(false);

  onMounted(() => {
    setTimeout(() => {
      isVisible.value = true;
    }, delay);
  });

  return { isVisible };
};
