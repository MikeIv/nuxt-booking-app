<script setup lang="ts">
  interface Props {
    isOpen: boolean;
    title?: string;
    maxWidth?: string;
    showCloseButton?: boolean;
    closeOnClickOutside?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "",
    maxWidth: "500px",
    showCloseButton: true,
    closeOnClickOutside: true,
  });

  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!props.closeOnClickOutside) return;

    const popup = document.querySelector("[data-popup]");
    if (popup && !popup.contains(event.target as Node)) {
      closePopup();
    }
  };

  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue && props.closeOnClickOutside) {
        document.addEventListener("click", handleClickOutside);
      } else {
        document.removeEventListener("click", handleClickOutside);
      }
    },
  );

  // Блокировка скролла при открытом попапе
  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
  );

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && props.isOpen) {
      closePopup();
    }
  };

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <section v-if="isOpen" :class="$style.popupOverlay" data-popup-overlay>
        <div :class="$style.popup" :style="{ maxWidth }" data-popup>
          <button
            v-if="showCloseButton"
            :class="$style.closeButton"
            aria-label="Закрыть попап"
            @click="closePopup"
          >
            <UIcon name="i-close" :class="$style.icon" />
          </button>

          <div :class="$style.popupContent">
            <slot name="content" />
          </div>

          <div v-if="$slots.footer" :class="$style.popupFooter">
            <slot name="footer" />
          </div>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/z-index" as z;

  .popupOverlay {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    padding: rem(20);
    background-color: rgba(0, 0, 0, 0.5);
    z-index: z.z("modal", "content");
  }

  .popup {
    position: relative;
    width: 100%;
    max-height: 90vh;
    background: white;
    border-radius: rem(12);
    box-shadow: 0 rem(10) rem(25) rgba(0, 0, 0, 0.2);
    overflow-y: auto;
  }

  .closeButton {
    position: absolute;
    top: rem(8);
    right: rem(8);
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(32);
    height: rem(32);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--a-primaryBg);
    }
  }

  .popupContent {
    display: flex;
    flex-direction: column;
  }

  .popupFooter {
    display: flex;
    justify-content: flex-end;
    gap: rem(12);
    padding: rem(16) rem(24);
    border-top: 1px solid var(--a-gray-200);
  }

  .icon {
    width: rem(24);
    height: rem(24);
    color: var(--a-text-light);
    cursor: pointer;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-active .popup,
  .fade-leave-active .popup {
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }

  .fade-enter-from .popup,
  .fade-leave-to .popup {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  @media (max-width: 768px) {
    .popupOverlay {
      padding: rem(10);
    }

    .popup {
      margin: 0;
      max-width: calc(100vw - 20px) !important;
    }

    .popupHeader {
      padding: rem(16) rem(16) 0 rem(16);
    }

    .popupContent {
      padding: 0 rem(16);
    }

    .popupFooter {
      padding: rem(16);
      flex-direction: column;
    }
  }
</style>
