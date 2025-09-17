<script setup lang="ts">
  interface Props {
    isOpen: boolean;
    title?: string;
    maxWidth?: string;
    showCloseButton?: boolean;
    closeOnClickOutside?: boolean;
    preventBodyScroll?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    title: "",
    maxWidth: "500px",
    showCloseButton: true,
    closeOnClickOutside: true,
    preventBodyScroll: true,
  });

  const emit = defineEmits(["close"]);

  const closePopup = () => {
    emit("close");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (!props.closeOnClickOutside) return;

    const overlay = event.target as HTMLElement;
    if (overlay.hasAttribute("data-popup-overlay")) {
      closePopup();
    }
  };

  // Улучшенная блокировка скролла
  const lockBodyScroll = () => {
    if (!props.preventBodyScroll) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  };

  const unlockBodyScroll = () => {
    if (!props.preventBodyScroll) return;

    const scrollY = document.body.style.top;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";

    window.scrollTo(0, parseInt(scrollY || "0") * -1);
  };

  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        lockBodyScroll();
        if (props.closeOnClickOutside) {
          // Используем setTimeout чтобы добавить обработчик после отрисовки
          setTimeout(() => {
            document.addEventListener("click", handleClickOutside);
          }, 0);
        }
      } else {
        unlockBodyScroll();
        document.removeEventListener("click", handleClickOutside);
      }
    },
    { immediate: true },
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
    unlockBodyScroll();
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <section v-if="isOpen" :class="$style.popupOverlay" data-popup-overlay>
        <div
          :class="$style.popup"
          :style="{ maxWidth }"
          data-popup
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Модальное окно'"
        >
          <button
            v-if="showCloseButton"
            :class="$style.closeButton"
            aria-label="Закрыть попап"
            @click="closePopup"
          >
            <UIcon name="i-close" :class="$style.icon" />
          </button>

          <!--          <div v-if="$slots.header || title" :class="$style.popupHeader">-->
          <!--            <slot name="header">-->
          <!--              <h2 v-if="title" :class="$style.popupTitle">{{ title }}</h2>-->
          <!--            </slot>-->
          <!--          </div>-->

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
    width: 100%;
    height: 100%;
    padding: rem(20);
    background-color: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: z.z("modal", "content");
    overflow: hidden;
  }

  .popup {
    position: relative;
    width: 100%;
    max-width: rem(1700);
    max-height: 90vh;
    background: white;
    border-radius: rem(16);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .closeButton {
    position: absolute;
    top: rem(16);
    right: rem(16);
    display: flex;
    align-items: center;
    justify-content: center;
    width: rem(40);
    height: rem(40);
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--a-whiteBg);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: z.z("modal", "content");

    &:hover {
      background: var(--a-primaryBg);
      transform: scale(1.05);

      .icon {
        color: white;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .popupHeader {
    padding: rem(24) rem(24) 0 rem(24);

    .popupTitle {
      font-family: "Lora", serif;
      font-size: rem(24);
      font-weight: 700;
      color: var(--a-text-dark);
      margin: 0 0 rem(16) 0;
      padding-right: rem(40);
    }
  }

  .popupContent {
    flex: 1;
    padding: rem(40) 0;
    overflow-y: auto;

    scrollbar-width: thin;
    scrollbar-color: var(--a-primary) var(--a-gray-100);

    &::-webkit-scrollbar {
      width: rem(6);
    }

    &::-webkit-scrollbar-track {
      background: var(--a-gray-100);
      border-radius: rem(3);
    }

    &::-webkit-scrollbar-thumb {
      background: var(--a-primary);
      border-radius: rem(3);
      transition: background 0.2s ease;

      &:hover {
        background: var(--a-primary-dark);
      }
    }
  }

  .popupFooter {
    display: flex;
    justify-content: flex-end;
    gap: rem(12);
    padding: rem(20) rem(24);
    border-top: 1px solid var(--a-gray-200);
    background: var(--a-gray-50);
  }

  .icon {
    width: rem(40);
    height: rem(40);
    color: var(--a-text-dark);
    transition: color 0.2s ease;
  }

  /* Анимации */
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
      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
      opacity 0.3s ease;
  }

  .fade-enter-from .popup,
  .fade-leave-to .popup {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
</style>
