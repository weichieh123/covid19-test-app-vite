<template>
  <body>
    <div id="nav">
      <h3>快篩試劑查詢</h3>
    </div>
    <router-view />
    <Footer />
  </body>
</template>

<script setup lang='ts'>
import Footer from '@/views/Footer.vue'
</script>



<style lang="scss">
@import "@/styles/global.scss";
</style>
