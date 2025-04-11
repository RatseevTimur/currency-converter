<template>
    <div class="converter">
      <div class="converter-row">
        <select v-model="fromCurrency" class="currency-select">
          <option v-for="currency in currencies" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
        <input
          v-model.number="fromAmount"
          type="number"
          @input="convertFrom"
          class="amount-input"
          :class="{ error: fromError }"
        >
        <span v-if="fromError" class="error-message">Введите число</span>
      </div>
      
      <div class="converter-row">
        <select v-model="toCurrency" class="currency-select">
          <option v-for="currency in currencies" :key="currency" :value="currency">
            {{ currency }}
          </option>
        </select>
        <input
          v-model.number="toAmount"
          type="number"
          @input="convertTo"
          class="amount-input"
          :class="{ error: toError }"
        >
        <span v-if="toError" class="error-message">Введите число</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { inject, ref, watch, onMounted } from 'vue'
  import { useCurrencyStore } from '~/stores/currency'
  
  const store = useCurrencyStore()
  const currencies = ['USD', 'EUR', 'RUB']
  
  const fromCurrency = inject('fromCurrency')
  const toCurrency = inject('toCurrency')
  const fromAmount = ref(1000)
  const toAmount = ref(0)
  const fromError = ref(false)
  const toError = ref(false)
  
  const convertFrom = () => {
    fromError.value = isNaN(fromAmount.value) || fromAmount.value < 0
    if (!fromError.value) {
      const rate = store.getRate(fromCurrency.value.toLowerCase(), toCurrency.value.toLowerCase())
      toAmount.value = fromAmount.value * rate
      toAmount.value = Number(toAmount.value.toFixed(2))
    }
  }
  
  const convertTo = () => {
    toError.value = isNaN(toAmount.value) || toAmount.value < 0
    if (!toError.value) {
      const rate = store.getRate(toCurrency.value.toLowerCase(), fromCurrency.value.toLowerCase())
      fromAmount.value = toAmount.value * rate
      fromAmount.value = Number(fromAmount.value.toFixed(2))
    }
  }
  
  watch([fromCurrency, toCurrency], convertFrom)
  onMounted(() => {
    if (!Object.keys(store.rates).length) {
      store.fetchRates().then(() => convertFrom())
    } else {
      convertFrom()
    }
  })
  </script>
  
  <style lang="scss" scoped>
  .converter {
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    
    &-row {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      
      .currency-select {
        width: 120px;
        padding: 0.5rem;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 1rem;
        margin-right: 1rem;
        background: white;
      }
      
      .amount-input {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 1.5rem;
        outline: none;
        
        &:focus {
          border-color: #1a73e8;
          box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
        
        &.error {
          border-color: #d93025;
        }
      }
      
      .error-message {
        color: #d93025;
        font-size: 0.8rem;
        margin-left: 1rem;
      }
    }
  }
  
  @media (max-width: 600px) {
    .converter {
      margin: 0.5rem;
      padding: 0.5rem;
      border-radius: 4px;
      
      &-row {
        flex-direction: column;
        align-items: stretch;
        gap: 0.5rem;
        
        .currency-select {
          width: 100%;
          margin-right: 0;
          font-size: 0.9rem;
        }
        
        .amount-input {
          font-size: 1.2rem;
          padding: 0.4rem;
        }
        
        .error-message {
          margin-left: 0;
          margin-top: 0.3rem;
          font-size: 0.7rem;
        }
      }
    }
  }
  
  @media (max-width: 400px) {
    .converter {
      margin: 0.3rem;
      padding: 0.3rem;
      
      &-row {
        .currency-select,
        .amount-input {
          font-size: 0.8rem;
          padding: 0.3rem;
        }
      }
    }
  }
  </style>