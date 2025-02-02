<template>
    <img
        src="../assets/server.svg"
        alt="server"
    />
    <span>{{ this.server.name }}</span>
    <div v-for="protocol in this.server.protocols">
      <ProxyCard/>
    </div>
</template>

<script>

import {defineComponent} from "vue";
import ProxyCard from "./ProxyCard.vue";

export default defineComponent({

  name: "ProxyServer",

  props: {},

  data: () => ({
    cards: [],
    server: ProxyServer,
  }),

  components: {
    ProxyCard
  },

})
</script>

<style scoped>

</style>