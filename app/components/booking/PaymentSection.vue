<script setup lang="ts">
interface PaymentMethod {
  label: string;
  value: string;
}

interface Props {
  paymentMethods: PaymentMethod[];
  paymentMethod: string;
  agreement: boolean;
  agreementError: string;
}

interface Emits {
  (e: "update:paymentMethod", value: string): void;
  (e: "update:agreement", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const paymentMethodValue = computed({
  get: () => props.paymentMethod,
  set: (value) => emit("update:paymentMethod", value),
});

const agreementValue = computed({
  get: () => props.agreement,
  set: (value) => emit("update:agreement", value),
});
</script>

<template>
  <div :class="$style.formItem">
    <h3 :class="$style.sectionHeader">Выберите способ оплаты</h3>
    <div :class="$style.paymentBlock">
      <div :class="$style.inputItem">
        <BookingSelect
          v-model="paymentMethodValue"
          :options="paymentMethods"
          placeholder="Банковской картой"
          :class="$style.inputSelect"
        />
      </div>
      <div :class="$style.agreementBlock">
        <div :class="$style.checkItem">
          <Checkbox
            v-model="agreementValue"
            input-id="agreement"
            :binary="true"
            :class="$style.checkbox"
          />
          <label for="agreement" :class="$style.checkboxLabel">
            Фактом бронирования вы соглашаетесь с правилами
            онлайн-бронирования, обработкой персональных данных и
            политикой конфиденциальности
          </label>
        </div>
        <Message
          v-if="agreementError"
          severity="error"
          size="small"
          variant="simple"
          unstyled
          :class="$style.errorMessage"
        >
          {{ agreementError }}
        </Message>
      </div>
      <div :class="$style.securityText">
        <h5 :class="$style.securityTitle">Гарантии безопасности</h5>
        <p :class="$style.securityDescription">
          Ввод данных и обработка платежа банковской картой проходит
          на защищённой странице процессинговой системы, которая
          прошла международную сертификацию. Ваши конфиденциальные
          данные полностью защищены. Никто, в том числе система
          бронирования, не может их получить. При работе с
          конфиденциальными данными применяется стандарт защиты
          информации, созданный платёжными системами Visa и MasterCard
          — PCI DSS. Технология передачи данных гарантирует
          безопасность за счёт использования протоколов шифрования и
          технологии 3-D Secure. Возврат денег производится на карту,
          с которой был произведён платёж.
        </p>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.formItem {
  display: flex;
  flex-direction: column;
  gap: rem(24);
  padding: rem(24) 0;
  border-bottom: rem(1) solid var(--a-border-dark);
  &:last-of-type {
    border-bottom: none;
  }
}

.sectionHeader {
  font-family: "Inter", sans-serif;
  font-size: rem(24);
  font-weight: 400;
  color: var(--a-text-dark);
  margin-bottom: rem(16);
}

.paymentBlock {
  display: flex;
  flex-direction: column;
  gap: rem(24);
}

.inputItem {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.inputSelect {
  display: flex;
  justify-content: space-between;
}

.errorMessage {
  margin-top: rem(8);
  font-family: "Inter", sans-serif;
  font-size: rem(14);
  color: var(--a-text-accent);
}

.agreementBlock {
  display: flex;
  flex-direction: column;
  gap: rem(8);
}

.checkItem {
  display: flex;
  align-items: flex-start;
  gap: rem(12);
  :global {
    .p-checkbox {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: rem(20);
      height: rem(20);
      min-width: rem(20);
      border: rem(2) solid var(--a-border-light);
      border-radius: rem(4);
      background: var(--a-whiteBg);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .p-checkbox-checked {
      background-color: var(--a-whiteBg);
      border-color: var(--a-border-primary);
      &:before {
        content: "✓";
        color: var(--a-text-primary);
        font-size: rem(14);
        font-weight: bold;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.checkbox {
  margin-top: rem(4);
  &:hover {
    border-color: var(--a-border-primary);
  }
  input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  .p-checkbox-icon {
    display: none;
  }
}

.checkboxLabel {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  color: var(--a-text-dark);
  line-height: 1.4;
  cursor: pointer;
  margin-top: rem(2);
  flex: 1;
}

.securityText {
  padding: rem(16);
  background: var(--a-bg-light);
  border-radius: var(--a-borderR--input);
}

.securityTitle {
  font-family: "Inter", sans-serif;
  font-size: rem(16);
  font-weight: 600;
  color: var(--a-text-dark);
  margin: 0 0 rem(8) 0;
}

.securityDescription {
  font-family: "Inter", sans-serif;
  font-size: rem(14);
  line-height: 1.5;
  color: var(--a-text-light);
  margin: 0;
}
</style>
