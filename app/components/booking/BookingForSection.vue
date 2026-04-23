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
    <NuxtLink to="/services" :class="$style.return"
      >Назад к услугам</NuxtLink
    >
    <div :class="$style.wrapper">
      <h3 :class="$style.sectionHeader">Я бронирую</h3>
      <div :class="$style.btnBlock">
        <Button
          label="Для себя"
          class="btn__bs"
          :class="{ ghost: !forSelf }"
          unstyled
          @click="forSelf = true"
        />
        <Button
          label="Для другого"
          class="btn__bs"
          :class="{ ghost: forSelf }"
          unstyled
          @click="forSelf = false"
        />
      </div>
      <p v-if="!forSelf" :class="$style.personalNote">
        Настоящим подтверждаю, что предоставляю персональные данные лиц, на
        которых производится бронирование с их согласия
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
  font-family: var(--a-font-heading);
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
    width: rem(10);
  }
}

.wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: rem(24);
  row-gap: rem(12);
  width: 100%;
  padding: 0 0 rem(25) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
}

.sectionHeader {
  font-family: var(--a-font-body);
  font-size: rem(24);
  font-weight: 400;
  color: var(--a-text-dark);
  margin: 0;
}

.btnBlock {
  display: flex;
  flex-direction: row;
  gap: rem(24);
  margin: 0;
}

.personalNote {
  width: 100%;
  margin-top: rem(8);
  font-family: var(--a-font-body);
  font-size: rem(16);
  font-weight: 400;
  color: var(--a-text-light);
}
</style>
