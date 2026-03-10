<script setup lang="ts">
  import { HOTEL_INFO } from "~/utils/hotel";

  const { contacts, loading, fetchContacts } = useContacts();

  onMounted(() => {
    fetchContacts();
  });

  const address = computed<string>(
    () => contacts.value?.address ?? HOTEL_INFO.address,
  );
  const phone = computed<string>(
    () => contacts.value?.phone ?? HOTEL_INFO.phone,
  );
  const email = computed<string>(
    () => contacts.value?.email ?? HOTEL_INFO.email,
  );
  const phoneHref = computed<string>(() => {
    const digits = phone.value.replace(/\D/g, "");
    return `tel:+${digits}`;
  });
</script>

<template>
  <address :class="$style.address">
    <p v-if="loading" :class="$style.loading">Загрузка...</p>
    <p v-else>{{ address }}</p>
    <div :class="$style.addressBox">
      <a :href="phoneHref" aria-label="Телефон">{{ phone }}</a>
      <a :href="`mailto:${email}`" aria-label="Email">{{ email }}</a>
    </div>
  </address>
</template>

<style module lang="scss">
  .address {
    display: grid;
    grid-template-rows: auto;
    gap: rem(5);
    font-size: 13px;
    font-weight: 600;
    font-family: "Futura PT", sans-serif;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0;
    color: inherit;

    p {
      margin: 0;
      font-style: normal;
    }

    a {
      color: inherit;
      text-decoration: none;
      font-style: normal;
    }
  }

  .addressBox {
    display: flex;
    flex-direction: column;
    gap: rem(5);
  }

  .loading {
    opacity: 0.5;
    font-style: italic;
  }
</style>
