<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <NavBar />
    <router-view class="w-full h-full overflow-auto"/>
  </div>
</template>

<style scoped>

</style>
