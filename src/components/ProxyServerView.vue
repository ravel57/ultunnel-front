<template>
  <div class="flex">
    <img src="../../public/svg/server.svg" alt="server"/>
    <span style="margin-left: 8px">{{ this.server.name }}</span>
  </div>
  <div class="flex" style="margin-top: 12px">
    <div v-for="protocol in this.server.proxies" :key="protocol.type">
      <ProxyCard
          :protocol="protocol"
          :server="this.server"
          :user="this.user"
      />
    </div>
  </div>
</template>

<script lang="ts">
import ProxyCard from "./ProxyCard.vue";
import {ProxyServer} from "../models/ProxyServer";
import {PropType} from "vue";
import {ProxyProtocol} from "../models/ProxyProtocol";
import {User} from "../models/User";

export default {

  name: "ProxyServerView",

  components: {ProxyCard},

  props: {
    server: {
      type: Object as PropType<ProxyServer>,
      required: true
    },
    user: {
      type: Object as PropType<User>,
      required: true
    }
  }

};
</script>


<style scoped>

</style>