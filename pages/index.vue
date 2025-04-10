<template>
  <div class="home">
    <h1>Курсы валют</h1>
    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else class="rates">
      <CurrencyCard v-for="currency in availableCurrencies" :key="currency" :currency="currency" />
    </div>
  </div>
</template>

<script setup>
import { useCurrencyStore } from '~/stores/currency'

const store = useCurrencyStore()
const availableCurrencies = computed(() => ['USD', 'EUR'].filter(c => c !== store.baseCurrency))

onMounted(() => {
  if (!Object.keys(store.rates).length) {
    store.fetchRates()
  }
})
</script>

<style lang="scss" scoped>
.home {
  padding: 2rem;

  h1 {
    margin-bottom: 2rem;
    color: $primary-color;
  }

  .rates {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
}
</style>