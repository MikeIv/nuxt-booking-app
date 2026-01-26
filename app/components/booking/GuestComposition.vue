<script setup lang="ts">
interface Props {
  adults: number;
  children: number;
}

const props = defineProps<Props>();

const compositionText = computed(() => {
  const { adults, children } = props;
  const parts: string[] = [];

  if (adults > 0) {
    const adultWord = adults === 1 ? 'взрослый' : 'взрослых';
    parts.push(`${adults} ${adultWord} на основном месте`);
  }

  if (children > 0) {
    const childWord = children === 1 ? 'ребенок' : children > 1 && children < 5 ? 'ребенка' : 'детей';
    parts.push(`${children} ${childWord} на дополнительном месте`);
  }

  return parts.join(', ');
});
</script>

<template>
  <div :class="$style.guestCompositionBlock">
    <div :class="$style.guestComposition">
      <div :class="$style.guestIcons">
        <!-- Взрослые на основном месте -->
        <UIcon
          v-for="n in adults"
          :key="'adult-' + n"
          name="i-icon-man"
          :class="$style.guestIconAdult"
          aria-hidden="true"
        />
        <!-- Разделитель если есть дети на дополнительном месте -->
        <UIcon
          v-if="children > 0"
          name="i-icon-plus-person"
          :class="$style.guestIconPlus"
          aria-hidden="true"
        />
        <!-- Дети на дополнительном месте -->
        <UIcon
          v-for="n in children"
          :key="'child-' + n"
          name="i-icon-child"
          :class="$style.guestIconChild"
          aria-hidden="true"
        />
      </div>
      <p :class="$style.guestCompositionText">
        {{ compositionText }}
      </p>
    </div>
    <div :class="$style.mainGuestInfo">
      <UIcon
        name="i-icon-man"
        :class="$style.mainGuestIcon"
        aria-hidden="true"
      />
      <p :class="$style.mainGuestText">
        Заполните данные основного гостя*
      </p>
    </div>
  </div>
</template>

<style module lang="scss">
.guestCompositionBlock {
  display: flex;
  flex-direction: column;
  gap: rem(16);
  margin-bottom: rem(24);
}

.guestComposition {
  display: flex;
  align-items: center;
  gap: rem(16);
}

.guestIcons {
  display: flex;
  align-items: center;
  gap: rem(2);
}

.guestIconAdult {
  width: rem(20);
  height: rem(20);
  color: var(--a-text-light);
  flex-shrink: 0;
}

.guestIconChild {
  width: rem(13);
  height: rem(13);
  color: var(--a-text-light);
  flex-shrink: 0;
}

.guestIconPlus {
  width: rem(12);
  height: rem(12);
  color: var(--a-text-light);
  flex-shrink: 0;
  margin: 0 rem(3);
}

.guestCompositionText {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 400;
  color: var(--a-text-light);
  margin: 0;
}

.mainGuestInfo {
  display: flex;
  align-items: center;
  gap: rem(12);
}

.mainGuestIcon {
  width: rem(20);
  height: rem(20);
  color: var(--a-text-dark);
  flex-shrink: 0;
}

.mainGuestText {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 600;
  color: var(--a-text-dark);
  margin: 0;
}
</style>
