<template>
    <div class="convert-page">
        <ConverterForm />
        <CurrencyChart :title="`График курса ${fromCurrency}/${toCurrency}`" chart-id="convertChart"
            :from-currency="fromCurrency" :to-currencies="[toCurrency]" :store="store" :inverse-rate="false" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch, provide } from 'vue'
import { useCurrencyStore } from '~/stores/currency'
import { useRoute, useRouter } from 'vue-router'
import CurrencyChart from '~/components/CurrencyChart.vue'

const store = useCurrencyStore()
const route = useRoute()
const router = useRouter()
const currencies = ['USD', 'EUR', 'RUB']

const fromCurrency = ref(
    currencies.includes(route.query.from?.toUpperCase())
        ? route.query.from.toUpperCase()
        : 'RUB'
)
const toCurrency = ref(
    currencies.includes(route.query.to?.toUpperCase())
        ? route.query.to.toUpperCase()
        : 'USD'
)

console.log('convert.vue: fromCurrency:', fromCurrency.value, 'toCurrency:', toCurrency.value)

watch([fromCurrency, toCurrency], () => {
    router.push({
        path: '/convert',
        query: { from: fromCurrency.value, to: toCurrency.value }
    })
})

onMounted(() => {
    if (!Object.keys(store.rates).length) {
        store.fetchRates()
    }
})

provide('fromCurrency', fromCurrency)
provide('toCurrency', toCurrency)
</script>

<style lang="scss" scoped>
.convert-page {
    padding: 1rem;
    background: #f1f3f4;
    min-height: 100vh;
}

@media (max-width: 600px) {
    .convert-page {
        padding: 0.5rem;
    }
}
</style>