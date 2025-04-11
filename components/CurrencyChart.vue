<template>
    <div class="chart-container">
        <h2>{{ title }}</h2>
        <div class="chart-controls">
            <button v-for="period in periods" :key="period.value" :class="{ active: selectedPeriod === period.value }"
                @click="updatePeriod(period.value)">
                {{ period.label }}
            </button>
        </div>
        <div v-if="chartError" class="error-message">
            {{ chartError }}
        </div>
        <canvas v-else ref="chartCanvas" :id="chartId"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

const props = defineProps({
    title: {
        type: String,
        required: true
    },
    chartId: {
        type: String,
        required: true
    },
    fromCurrency: {
        type: String,
        required: true
    },
    toCurrencies: {
        type: Array,
        required: true
    },
    store: {
        type: Object,
        required: true
    },
    inverseRate: {
        type: Boolean,
        default: false
    }
})

console.log('chartId:', props.chartId)

const chartCanvas = ref(null)
const periods = [
    { label: '1Д', value: '1d', days: 1 },
    { label: '1Н', value: '1w', days: 7 },
    { label: '1М', value: '1m', days: 30 },
    { label: '1Г', value: '1y', days: 365 }
]
const selectedPeriod = ref('1w')
const chartError = ref(null)

// Chart instance reference
const chartInstance = ref(null)

const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    const period = periods.find(p => p.value === selectedPeriod.value)
    startDate.setDate(endDate.getDate() - period.days)

    return {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
    }
}

const fetchHistoricalData = async () => {
    chartError.value = null
    const period = periods.find(p => p.value === selectedPeriod.value)

    if (period.days > 14) {
        chartError.value = 'Исторические данные ограничены 14 днями в пробной версии API. Выберите период "1Д" или "1Н".'
        return []
    }

    const { start, end } = getDateRange()
    const datasets = []

    try {
        for (const currency of props.toCurrencies) {
            const rates = await props.store.fetchHistoricalRates(start, end, props.fromCurrency, currency)
            if (!rates) {
                chartError.value = props.store.error || 'Не удалось загрузить данные для графика.'
                return []
            }

            const data = []
            for (const [date, rate] of Object.entries(rates)) {
                if (!rate[currency] || isNaN(rate[currency])) {
                    console.warn(`Некорректное значение курса для ${currency} на ${date}: ${rate[currency]}`)
                    continue
                }
                const value = props.inverseRate ? 1 / rate[currency] : rate[currency]
                if (isNaN(value)) {
                    console.warn(`Некорректное вычисленное значение для ${currency} на ${date}: ${value}`)
                    continue
                }
                data.push({ x: new Date(date), y: value })
            }
            data.sort((a, b) => a.x - b.x)

            datasets.push({
                label: currency,
                data: data,
                borderColor: currency === 'USD' ? '#34a853' : '#4285f4',
                borderWidth: 2,
                fill: true,
                backgroundColor: currency === 'USD' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(66, 133, 244, 0.1)',
                tension: 0.1
            })
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных для графика:', error)
        chartError.value = 'Произошла ошибка при загрузке данных. Попробуйте позже.'
        return []
    }

    return datasets
}

const destroyChart = () => {
    // First check if the chart is in the Chart.js registry
    const existingChart = Chart.getChart(chartCanvas.value)
    if (existingChart) {
        console.log(`Destroying chart registered with canvas element, chartId: ${props.chartId}`)
        existingChart.destroy()
    }
    
    // Also check our local reference
    if (chartInstance.value) {
        console.log(`Destroying chart from local reference, chartId: ${props.chartId}`)
        chartInstance.value.destroy()
        chartInstance.value = null
    }
}

const renderChart = async () => {
    await nextTick()

    if (!chartCanvas.value) {
        console.error(`Unable to find canvas with id ${props.chartId}`)
        chartError.value = 'Ошибка отображения графика.'
        return
    }

    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
        console.error(`Unable to get canvas context for chartId ${props.chartId}`)
        chartError.value = 'Ошибка отображения графика.'
        return
    }

    // Always destroy any existing chart first
    destroyChart()

    const datasets = await fetchHistoricalData()

    if (chartError.value) {
        console.warn('Chart not displayed due to error:', chartError.value)
        return
    }

    if (!Array.isArray(datasets) || datasets.length === 0) {
        chartError.value = 'Нет данных для отображения графика.'
        console.warn('No data for chart:', datasets)
        return
    }

    try {
        chartInstance.value = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: selectedPeriod.value === '1d' ? 'hour' : 'day',
                            tooltipFormat: 'MMM d',
                            displayFormats: {
                                hour: 'HH:mm',
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: `Курс (${props.inverseRate ? props.fromCurrency : props.toCurrencies[0]})`
                        },
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        display: props.toCurrencies.length > 1,
                        position: 'top'
                    }
                },
                maintainAspectRatio: false
            }
        })
        console.log(`Chart with chartId ${props.chartId} successfully created`)
    } catch (error) {
        console.error('Error creating chart:', error)
        chartError.value = 'Ошибка отображения графика.'
    }
}

const updatePeriod = (period) => {
    selectedPeriod.value = period
    chartError.value = null
}

watch([selectedPeriod, () => props.fromCurrency, () => props.toCurrencies], async () => {
    await renderChart()
})

onMounted(async () => {
    await renderChart()
})

onUnmounted(() => {
    destroyChart()
    console.log(`Chart cleanup completed for chartId ${props.chartId}`)
})
</script>

<style lang="scss" scoped>
.chart-container {
    background: white;
    border: 1px solid #dadce0;
    border-radius: 8px;
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;

    h2 {
        font-size: 1.2rem;
        color: #202124;
        margin-bottom: 1rem;
    }

    .chart-controls {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;

        button {
            padding: 0.5rem 1rem;
            border: 1px solid #dadce0;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 0.9rem;

            &.active {
                background: #e8f0fe;
                border-color: #1a73e8;
                color: #1a73e8;
            }
        }
    }

    .error-message {
        color: #d93025;
        font-size: 0.9rem;
        text-align: center;
        padding: 1rem;
    }

    canvas {
        height: 300px !important;
    }
}

@media (max-width: 600px) {
    .chart-container {
        margin: 0.5rem;
        padding: 0.5rem;
        border-radius: 4px;

        h2 {
            font-size: 1rem;
        }

        .chart-controls {
            flex-wrap: wrap;
            gap: 0.3rem;

            button {
                padding: 0.3rem 0.6rem;
                font-size: 0.8rem;
                flex: 1;
                min-width: 60px;
            }
        }

        .error-message {
            font-size: 0.8rem;
            padding: 0.5rem;
        }

        canvas {
            height: 200px !important;
        }
    }
}

@media (max-width: 400px) {
    .chart-container {
        margin: 0.3rem;
        padding: 0.3rem;

        h2 {
            font-size: 0.9rem;
        }

        .chart-controls {
            button {
                padding: 0.2rem 0.4rem;
                font-size: 0.7rem;
                min-width: 50px;
            }
        }

        canvas {
            height: 150px !important;
        }
    }
}
</style>