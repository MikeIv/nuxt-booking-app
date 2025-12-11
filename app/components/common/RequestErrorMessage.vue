<script lang="ts">
  import { computed, defineComponent } from "vue";

  export interface RequestErrorContent {
    summary: string;
    detail: string;
  }

  export const REQUEST_ERROR_MESSAGES: Record<number, RequestErrorContent> = {
    400: {
      summary: "Попробуйте позже",
      detail:
        "Сервер временно не смог обработать запрос. Повторите попытку позднее.",
    },
    401: {
      summary: "Требуется авторизация",
      detail:
        "Авторизуйтесь, чтобы продолжить. Если ошибка повторяется, обновите страницу.",
    },
    403: {
      summary: "Доступ ограничен",
      detail:
        "У вас нет прав для выполнения запроса. Проверьте учетную запись или обратитесь в поддержку.",
    },
    404: {
      summary: "Данные не найдены",
      detail:
        "Запрашиваемая информация недоступна. Попробуйте изменить параметры поиска.",
    },
    408: {
      summary: "Время ожидания истекло",
      detail:
        "Сервер не ответил вовремя. Проверьте соединение и попробуйте снова.",
    },
    409: {
      summary: "Конфликт данных",
      detail: "Данные были изменены. Обновите страницу и попробуйте еще раз.",
    },
    422: {
      summary: "Ошибка в данных",
      detail: "Проверьте корректность введенных данных и повторите запрос.",
    },
    429: {
      summary: "Слишком много запросов",
      detail:
        "Снизьте частоту запросов и повторите попытку через несколько минут.",
    },
    500: {
      summary: "Технические неполадки",
      detail:
        "На сервере произошла ошибка. Наши специалисты уже работают над решением.",
    },
    502: {
      summary: "Проблема с шлюзом",
      detail: "Сервер вернул некорректный ответ. Подождите и попробуйте снова.",
    },
    503: {
      summary: "Сервис недоступен",
      detail:
        "Сервис временно отключен на обслуживание. Повторите попытку позже.",
    },
    504: {
      summary: "Таймаут шлюза",
      detail:
        "Ответ от сервера не был получен вовремя. Повторите запрос позднее.",
    },
  };

  export const getRequestErrorContent = (
    status?: number,
    serverMessage?: string | null,
  ): RequestErrorContent => {
    const trimmedMessage = serverMessage?.trim();
    const fallbackDetail =
      trimmedMessage && trimmedMessage.length > 0
        ? trimmedMessage
        : "Неизвестная ошибка. Попробуйте еще раз позже.";

    if (!status) {
      return {
        summary: "Повторите запрос позже",
        detail: "Временные неполадки. Повторите запрос немного позже",
      };
    }

    const mappedMessage = REQUEST_ERROR_MESSAGES[status];

    if (mappedMessage) {
      console.log("fallbackDetail", fallbackDetail);
      return mappedMessage.detail
        ? mappedMessage
        : {
            summary: mappedMessage.summary,
            detail: fallbackDetail,
          };
    }

    return {
      summary: "Повторите запрос позже",
      detail: fallbackDetail,
    };
  };

  export default defineComponent({
    name: "RequestErrorMessage",
    props: {
      status: {
        type: Number,
        required: false,
        default: null,
      },
      serverMessage: {
        type: String,
        required: false,
        default: "",
      },
    },
    setup(props) {
      const message = computed(() =>
        getRequestErrorContent(props.status, props.serverMessage),
      );

      return {
        message,
      };
    },
  });
</script>

<template>
  <div class="request-error-message" role="alert">
    <p class="request-error-message__summary">
      {{ message.summary }}
    </p>
    <p v-if="message.detail" class="request-error-message__detail">
      {{ message.detail }}
    </p>
  </div>
</template>

<style scoped lang="scss">
  .request-error-message {
    display: flex;
    flex-direction: column;
    gap: rem(4);
    font-family: "Inter", sans-serif;
    color: var(--color-text, #1b1b1b);
  }

  .request-error-message__summary {
    margin: 0;
    font-weight: 600;
    font-size: rem(15);
    line-height: 1.35;
  }

  .request-error-message__detail {
    margin: 0;
    font-weight: 400;
    font-size: rem(14);
    line-height: 1.4;
    color: rgba(27, 27, 27, 0.8);
  }
</style>
