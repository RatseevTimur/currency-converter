<template>
  <header class="header">
    <nav>
      <NuxtLink to="/">Главная</NuxtLink>
      <NuxtLink to="/convert">Конвертация</NuxtLink>
    </nav>
    <select v-model="baseCurrency" @change="updateBaseCurrency">
      <option v-for="currency in currencies" :key="currency" :value="currency">
        {{ currency }}
      </option>
    </select>
  </header>
</template>

<script setup>
const store = useCurrencyStore()
const currencies = ['USD', 'EUR', 'RUB']
const baseCurrency = computed({
  get: () => store.baseCurrency,
  set: (value) => store.setBaseCurrency(value)
})

onMounted(() => {
  store.fetchRates()
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: $primary-color;

  nav {
    display: flex;
    gap: 1rem;

    a {
      color: white;
      text-decoration: none;

      &.router-link-active {
        font-weight: bold;
      }
    }
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
  }
}
</style>