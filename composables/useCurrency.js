import { useCurrencyStore } from '~/stores/currency'

export function useCurrency() {
  const store = useCurrencyStore()

  const convert = (amount, from, to) => {
    if (!amount || isNaN(amount)) return 0
    const rate = store.getRate(from.toLowerCase(), to.toLowerCase())
    const result = amount * rate
    return Number(result.toFixed(2))
  }

  return { convert }
}