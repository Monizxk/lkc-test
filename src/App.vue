<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <NavBar />
    <div class="w-full h-full overflow-auto">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>

</style>
