<template>
    <div class="app">
        <Header />
        <main>
            <slot />
        </main>
    </div>
</template>

<script setup>
import Header from '~/components/Header.vue'
</script>

<style lang="scss" scoped>
.app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    main {
        flex: 1;
        padding: 1rem;
    }
}
</style>