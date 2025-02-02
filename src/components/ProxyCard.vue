<template>
  <div class="proxy-card">

    <span>
      <img
          :src="`../assets/${this.proxyType.name.toLowerCase()}.png`"
          :alt="'foo'"
          height="24px"
          width="24px"
      >
      <span>{{ this.proxyType.name }}</span>
      <img
          src="../assets/check-mark.svg"
          alt="checkmark"
          width="24px"
          height="24px"
      />
    </span>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ProxyCard',

  data: () => ({
    proxyType: ProxyType,
  }),

  props: {},
}
</script>

<style scoped>
.proxy-card {
  width: 200px;
  height: 128px;
  top: 20px;
  left: 20px;
  padding: 8px 0 0 0;
  gap: 8px;
  border-radius: 8px 0 0 0;
  border: 1px;
  opacity: 0;

}
</style>