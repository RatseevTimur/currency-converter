<template>
  <div class="home">
    <h1>Курсы валют</h1>
    <div v-if="store.loading">Загрузка...</div>
    <div v-else-if="store.error">{{ store.error }}</div>
    <div v-else>
      <div class="rates">
        <CurrencyCard
          v-for="currency in availableCurrencies"
          :key="currency"
          :currency="currency"
        />
      </div>
      <CurrencyChart
        :title="`График курсов относительно ${store.baseCurrency}`"
        chart-id="mainChart"
        :from-currency="store.baseCurrency"
        :to-currencies="availableCurrencies"
        :store="store"
        :inverse-rate="true"
      />
    </div>
  </div>
</template>
 <!-- :to-currencies="['USD', 'EUR']" -->

<script setup>
import { computed, onMounted } from 'vue'
import { useCurrencyStore } from '~/stores/currency'
import { useRoute } from 'vue-router'
import CurrencyChart from '~/components/CurrencyChart.vue'

const store = useCurrencyStore()
const route = useRoute()
const currencies = ['USD', 'EUR', 'RUB']

const availableCurrencies = computed(() => {
  const urlCurrencies = route.query.currencies?.split(',').map(c => c.toUpperCase()) || []
  const filteredCurrencies = urlCurrencies.filter(c => currencies.includes(c) && c !== store.baseCurrency)
  const result = filteredCurrencies.length > 0 ? filteredCurrencies : ['USD', 'EUR'].filter(c => c !== store.baseCurrency)
  console.log('availableCurrencies:', result)
  return result
})

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
    margin-bottom: 2rem;
  }
}

@media (max-width: 600px) {
  .home {
    padding: 1rem;
    
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .rates {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
  }
}
</style>