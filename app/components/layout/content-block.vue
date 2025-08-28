<script setup lang="ts">
  defineProps({
    layoutClass: {
      type: String,
      default: "",
    },
    hasTwoColumns: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    titleClass: {
      type: String,
      default: "",
    },
    contentClass: {
      type: String,
      default: "",
    },
    columnLeft: {
      type: String,
      default: "",
    },
    columnRight: {
      type: String,
      default: "",
    },
  });
</script>

<template>
  <section :class="[$style.layout, layoutClass]">
    <h2 v-if="title" :class="[titleClass]">{{ title }}</h2>

    <div
      :class="[
        $style.content,
        {
          [$style.contentTwoColumns]: hasTwoColumns,
        },
        contentClass,
      ]"
    >
      <div :class="[$style.columnLeft, columnLeft]">
        <slot name="left-column" />
      </div>

      <div v-if="hasTwoColumns" :class="[$style.columnRight, columnRight]">
        <slot name="right-column" />
      </div>
    </div>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .layout {
    width: 100%;
    margin: 0 auto;
    padding: 0 rem(15);
    margin-bottom: clamp(50px, 10vw, 100px);
    background-color: var(--ui-color-primary-50);
  }

  .content {
    display: flex;
    flex-direction: column;
  }

  .columnLeft,
  .columnRight {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  @media (min-width: #{size.$tabletMax}) {
    .contentTwoColumns {
      flex-direction: row;
      width: 100%;
    }
  }
</style>
