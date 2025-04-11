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
import { computed, onMounted } from 'vue'
import { useCurrencyStore } from '~/stores/currency'

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
  align-items: center;
  padding: 1rem;
  background: $primary-color;
  
  nav {
    display: flex;
    gap: 1rem;
    
    a {
      color: white;
      text-decoration: none;
      font-size: 1rem;
      
      &.router-link-active {
        font-weight: bold;
      }
    }
  }
  
  select {
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 1rem;
  }
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    
    nav {
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      
      a {
        font-size: 0.9rem;
      }
    }
    
    select {
      width: 100%;
      font-size: 0.9rem;
      padding: 0.4rem;
    }
  }
}

@media (max-width: 400px) {
  .header {
    padding: 0.3rem;
    
    nav {
      gap: 0.3rem;
      
      a {
        font-size: 0.8rem;
      }
    }
    
    select {
      font-size: 0.8rem;
      padding: 0.3rem;
    }
  }
}
</style>