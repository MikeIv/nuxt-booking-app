<template>
  <NuxtLayout>
    <div class="error-container">
      <h1 v-if="error?.statusCode === 404">
        404
      </h1>
      <h1 v-else-if="error?.statusCode">
        Ошибка {{ error.statusCode }}
      </h1>
      <h1 v-else>
        Произошла ошибка
      </h1>

      <p>{{ error?.message || "Что-то пошло не так" }}</p>

      <button @click="handleError">
        На главную
      </button>
    </div>

    <div>
      <button
        :disabled="pending"
        @click="testApi"
      >
        {{ pending ? 'Загрузка...' : 'Тест API' }}
      </button>
      <div v-if="data">
        Ответ сервера: {{ data.message }}
      </div>
      <div
        v-if="error"
        class="error"
      >
        Ошибка: {{ error.message }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
defineOptions({
  name: 'ErrorPage',
})

const error = useError() || {
  statusCode: 500,
  message: 'Неизвестная ошибка',
}

const handleError = () => {
  clearError({ redirect: '/' })
}

const { data, pending, error: errorApi, refresh } = useFetch('/api/test')

const testApi = async () => {
  await refresh()
  if (errorApi.value) {
    console.error('Ошибка:', errorApi.value)
  }
}
</script>

<style scoped>
.error-container {
  text-align: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

h1 {
  color: #ff4343;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #4a6bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #3a5bef;
}
</style>
