<script setup lang="ts">
interface Props {
  name?: string;
  surname?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  comment?: string | null;
  paymentMethod?: string;
}

defineProps<Props>();
</script>

<template>
  <section :class="$style.section">
    <dl :class="$style.infoGrid">
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Имя</dt>
        <dd :class="$style.infoValue">{{ name || '—' }}</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Фамилия</dt>
        <dd :class="$style.infoValue">{{ surname || '—' }}</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Гражданство</dt>
        <dd :class="$style.infoValue">{{ nationality || '—' }}</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Телефон</dt>
        <dd :class="$style.infoValue">{{ phone || '—' }}</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">E-mail</dt>
        <dd :class="$style.infoValue">{{ email || '—' }}</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Номер карты лояльности</dt>
        <dd :class="$style.infoValue">—</dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Комментарий к бронированию</dt>
        <dd :class="$style.infoValue">
          <template v-if="comment">
            <p>{{ comment }}</p>
          </template>
          <p>
            Специальный тариф для гостей, действующий только на период проживания в гостинице. Стоимость указана за каждую ночь проживания. Если автостоянкой пользуется автомобиль с прицепом - дополнительно оплачивается парковка прицепа. Тариф дает возможность пользоваться автостоянкой на территории гостиницы со дня заселения в гостиницу до 14:00 дня выезда из гостиницы, далее действует почасовой тариф (400 рублей в час) с оплатой через автоматические кассы.
          </p>
        </dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Способ оплаты</dt>
        <dd :class="$style.infoValue">
          {{ paymentMethod || 'На сайте' }}
        </dd>
      </div>
      <div :class="$style.infoRow">
        <dt :class="$style.infoLabel">Условия отмены</dt>
        <dd :class="$style.infoValue">
          <p>
            Бесплатная отмена бронирования возможна до 16:00 (по московскому времени) даты заезда.
            Ваше гарантированное бронирование сохраняется до 12:00 (расчетного часа) следующего дня.
            В случае незаезда или несвоевременного отказа от бронирования взимается плата за фактический простой номера в размере стоимости первых суток проживания, включая НДС по применимой ставке. Все последующие сутки будут отменены.
          </p>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .section {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    padding: rem(24) 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(20);
      padding: rem(28) 0;
    }

    @media (min-width: #{size.$desktopMin}) {
      gap: rem(24);
      padding: rem(32) 0;
    }
  }

  .infoGrid {
    display: flex;
    flex-direction: column;
    gap: rem(12);
    margin: 0;
    padding: 0;

    @media (min-width: #{size.$tablet}) {
      gap: rem(16);
    }
  }

  .infoRow {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: rem(16);
    padding: rem(8) 0;
    border-bottom: rem(1) solid var(--a-border-light);

    @media (min-width: #{size.$tablet}) {
      grid-template-columns: 1fr 3fr;
      gap: rem(24);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .infoLabel {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-light);
    margin: 0;
  }

  .infoValue {
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 500;
    color: var(--a-text-dark);
    margin: 0;
  }
</style>

