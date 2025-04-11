import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    baseCurrency: 'RUB',
    rates: {},
    historicalRates: {},
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

    async fetchHistoricalRates(startDate, endDate, from, to) {
      const config = useRuntimeConfig()
      const apiKey = config.public.fastforexApiKey
      const toCurrencies = Array.isArray(to) ? to.join(',') : to
      const url = `https://api.fastforex.io/time-series?start=${startDate}&end=${endDate}&from=${from}&to=${toCurrencies}&api_key=${apiKey}`
      
      console.log('fetchHistoricalRates: Запрос URL:', url)
      
      try {
        const response = await fetch(url)
        const data = await response.json()
        
        console.log('fetchHistoricalRates: Ответ API:', data)
        
        if (data.error) {
          throw new Error(data.message)
        }
        
        const historicalRates = {}
        const results = data.results
        
        if (!results) {
          throw new Error('Нет данных в ответе API')
        }

        const dates = Object.keys(Object.values(results)[0] || {})
        for (const date of dates) {
          historicalRates[date] = {}
          for (const currency in results) {
            historicalRates[date][currency] = results[currency][date]
          }
        }
        
        this.historicalRates = historicalRates
        console.log('Historical rates:', historicalRates)
        return historicalRates
      } catch (error) {
        this.error = error.message
        console.error('Ошибка при запросе исторических данных:', error.message)
        
        // Резервные данные
        console.log('Используем резервные данные из-за ошибки API')
        const fallbackRates = {
          '2025-04-04': { 'USD': 0.01174, 'EUR': 0.0105 },
          '2025-04-05': { 'USD': 0.01187, 'EUR': 0.0106 },
          '2025-04-06': { 'USD': 0.01186, 'EUR': 0.01055 }
        }
        this.historicalRates = fallbackRates
        return fallbackRates
      }
    },

    getRate(from, to, date = null) {
      if (from === to) return 1

      const rates = date ? (this.historicalRates[date] || this.rates) : this.rates

      if (date && rates[date]) {
        return rates[date][to.toUpperCase()] || 0
      }

      const directKey = `${from.toLowerCase()}-${to.toLowerCase()}`
      const reverseKey = `${to.toLowerCase()}-${from.toLowerCase()}`

      if (rates[directKey]) {
        return rates[directKey]
      } else if (rates[reverseKey]) {
        return 1 / rates[reverseKey]
      }
      return 0
    }
  }
})