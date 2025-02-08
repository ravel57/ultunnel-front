<template>
  <div class="user">
    <span class="title">{{ user.name }}</span>
    <q-toggle v-model="user.isEnabled"/>
  </div>
  <div class="user-info">
    <img
        src="../../public/svg/calendar.svg"
        alt=""
        width="20px"
        height="20px"
    >
    <span>{{ formatDate(user.createdDate) }}</span>
    <img
        src="../../public/svg/payment.svg"
        alt=""
        width="20px"
        height="20px"
    >
    <span>{{ formatDate(user.nextPaymentDate) }}</span>
    <img
        src="../../public/svg/key.svg"
        alt=""
        width="20px"
        height="20px"
    >
    <span>{{ user.secretKey }}</span>
  </div>
  <div v-for="server in servers" :key="server.id">
    <ProxyServerView
        style="margin-top: 16px"
        :server="server"
        :user="this.user"
    />
  </div>
</template>

<script lang="ts">
import ProxyServerView from "./ProxyServerView.vue";
import {ProxyServer} from "../models/ProxyServer";
import {User} from "../models/User";
import {PropType} from "vue";

export default {

  name: "UserView",

  components: {ProxyServerView},

  props: {
    user: {
      type: Object as PropType<User>,
      required: true
    },
    servers: {
      type: Array as PropType<ProxyServer[]>,
      required: true
    }
  },

  methods: {
    formatDate(date: Date | string): string {
      if (!date) return ""
      const d = new Date(date);
      if (isNaN(d.getTime())) return ""
      const day = String(d.getDate()).padStart(2, "0")
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const year = d.getFullYear()
      return `${day}.${month}.${year}`
    }
  },

}
</script>


<style scoped>
.user {
  display: flex;
}

.title {
  font-weight: 700;
  line-height: 63px;
  letter-spacing: 0;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  font-size: 58px;
}

.user-info {
  height: 32px;
  gap: 16px;
  opacity: 1;
  display: flex;
}
</style>