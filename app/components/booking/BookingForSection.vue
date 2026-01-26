<script setup lang="ts">
interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const forSelf = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});
</script>

<template>
  <section :class="$style.personalBlock">
    <NuxtLink to="/rooms/tariff" :class="$style.return"
      >Назад к тарифам</NuxtLink
    >
    <h2 :class="$style.personalTitle">Введите свои данные</h2>
    <div :class="$style.wrapper">
      <h3 :class="$style.sectionHeader">Я бронирую</h3>
      <div :class="$style.btnBlock">
        <Button
          label="Для себя"
          class="btn__bs"
          :class="{ 'btn__bs--active': forSelf }"
          unstyled
          @click="forSelf = true"
        />
        <Button
          label="Для другого"
          class="btn__bs ghost"
          :class="{ 'btn__bs--active': !forSelf }"
          unstyled
          @click="forSelf = false"
        />
      </div>
      <p :class="$style.personalNote">
        Укажите данные основного гостя. Остальных гостей — при заселении
      </p>
    </div>
  </section>
</template>

<style module lang="scss">
@use "~/assets/styles/variables/resolutions" as size;

.personalBlock {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: rem(12) rem(20);

  @media (min-width: #{size.$desktopMedium}) {
    max-width: #{size.$desktop};
    margin: 0 auto;
  }
}

.return {
  position: relative;
  margin-bottom: rem(40);
  padding-left: rem(30);
  font-family: "Lora", serif;
  font-size: rem(20);
  color: var(--a-text-dark);
  text-decoration: none;
  transition: color 0.3s ease;
  &:hover {
    color: var(--a-primary);
  }
  &:before {
    content: "<";
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 10px;
  }
}

.personalTitle {
  margin-bottom: rem(24);
  text-align: center;
  font-family: "Lora", serif;
  font-size: rem(28);
  font-weight: 600;
  color: var(--a-text-dark);
  text-transform: uppercase;
}

.wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 0 rem(25) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
}

.sectionHeader {
  font-family: "Inter", sans-serif;
  font-size: rem(24);
  font-weight: 400;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
}

.btnBlock {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  margin-bottom: rem(25);
  @media (min-width: #{size.$tablet}) {
    flex-direction: row;
  }
}

.personalNote {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 400;
  color: var(--a-text-light);
}
</style>
