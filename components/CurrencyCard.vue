<template>
    <div class="currency-card">
      <h3>1 {{ currency }} = {{ formattedRate }} {{ baseCurrency }}</h3>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useCurrencyStore } from '~/stores/currency'
  
  const props = defineProps({
    currency: {
      type: String,
      required: true
    }
  })
  
  const store = useCurrencyStore()
  const baseCurrency = computed(() => store.baseCurrency)
  const formattedRate = computed(() => {
    const rate = store.getRate(props.currency.toLowerCase(), baseCurrency.value.toLowerCase())
    return rate ? rate.toFixed(2) : 'N/A'
  })
  </script>
  
  <style lang="scss" scoped>
  .currency-card {
    padding: 1rem;
    border: 1px solid $gray;
    border-radius: 4px;
    margin: 0.5rem;
    
    h3 {
      margin: 0;
      color: $primary-color;
    }
  }
  
  @media (max-width: 600px) {
    .currency-card {
      padding: 0.5rem;
      margin: 0.3rem;
      
      h3 {
        font-size: 1rem;
      }
    }
  }
  </style>