<template>
  <div :class="$style.container">
    <div :class="$style.content">
      <h1 :class="$style.title">{{ error.statusCode }}</h1>
      <h2 :class="$style.message">{{ error.message }}</h2>

      <div :class="$style.illustration">
        <CancelRounded :class="$style.logo" />
      </div>

      <p :class="$style.description">Что-то пошло не так. Пожалуйста, попробуйте позже или вернитесь на главную.</p>

      <NuxtLink to="/" :class="$style.button">
        Вернуться на главную
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import CancelRounded from '~/assets/images/cancel-rounded.svg'

const props = defineProps({
  error: Object
})

// Устанавливаем сообщение по умолчанию для 404 ошибки
if (props.error.statusCode === 404) {
  props.error.message = 'Страница не найдена'
}
</script>

<style module lang="scss">
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: rem(32);
}

.content {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: white;
  padding: rem(42);
  border-radius: rem(16);
  box-shadow: 0 rem(10) rem(30) rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    padding: rem(32);
  }
}

.title {
  font-size: rem(64);
  margin: 0;
  color: var(--a-accentDarkBg);
  font-weight: 900;
  line-height: 1;
  animation: bounce 1s ease infinite alternate;

  @media (max-width: 640px) {
    font-size: rem(42);
  }
}

.message {
  font-size: rem(24);
  margin: rem(16) 0 rem(32);
  color: #2f3542;

  @media (max-width: 640px) {
    font-size: rem(24);
  }
}

.illustration {
  width: rem(80);
  height: rem(80);
  margin: 0 auto rem(32);
  color: var(--a-accentDarkBg);
  animation: pulse 2s ease infinite;

  @media (max-width: 640px) {
    width: rem(60);
    height: rem(60);
  }
}

.logo {
  width: 100%;
  height: 100%;
}

.description {
  font-size: rem(18);
  color: #57606f;
  margin-bottom: rem(40);
  line-height: 1.6;
}

.button {
  display: inline-block;
  background: var(--a-btnAccentBg);
  color: var(--a-white);
  padding: rem(12) rem(32);
  border-radius: rem(50);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid var(--a-btnAccentBg);

  &:hover {
    background: white;
    color: var(--a-btnAccentBg);
  }
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>