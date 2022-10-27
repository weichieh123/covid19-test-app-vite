<template>
  <div class="store-item" @click="$emit('popup')" >
    <div class="store-tag" :class="{active: store.isActive}">
      {{ index+1 }}
    </div>
    {{ store['醫事機構名稱'] }} ({{ store['快篩試劑截至目前結餘存貨數量']}}組)
  </div>
</template>

<script>
export default {
  name: 'Covid19Item',
  props: ['store', 'index'],
};
</script>

<style lang="scss" scoped>
.store-item {
  display: flex;
  .store-tag {
    background-color: #42b983;
    color: white;
    margin-right: 1rem;
    padding: 0 0.5rem;
    &.active {
      background-color: #e67272;
    }
  }
}
</style>
