import { defineStore } from 'pinia'

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    baseCurrency: 'RUB',
    rates: {}, // Храним сырые данные из API
    loading: false,
    error: null
  }),

  actions: {
    async fetchRates() {
      try {
        this.loading = true
        const response = await fetch('https://status.neuralgeneration.com/api/currency')
        const data = await response.json()
        this.rates = data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    setBaseCurrency(currency) {
      this.baseCurrency = currency
    },

    // Получаем курс валюты относительно базовой
    getRate(from, to) {
      if (from === to) return 1

      const directKey = `${from.toLowerCase()}-${to.toLowerCase()}`
      const reverseKey = `${to.toLowerCase()}-${from.toLowerCase()}`

      if (this.rates[directKey]) {
        return this.rates[directKey]
      } else if (this.rates[reverseKey]) {
        return 1 / this.rates[reverseKey]
      }
      return 0
    }
  }
})