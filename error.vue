<template>
  <NuxtLayout>
    <div class="error-container">
      <h1 v-if="error.statusCode === 404">404</h1>
      <h1 v-else>Ошибка {{ error.statusCode }}</h1>
      <p>{{ error.message || "Что-то пошло не так" }}</p>
      <button @click="handleError">На главную</button>
    </div>
  </NuxtLayout>
</template>

<script setup>
const error = useError();
const handleError = () => clearError({ redirect: "/" });
</script>

<style scoped>
.error-container {
  text-align: center;
  padding: 2rem;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
</style>