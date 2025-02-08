<template>
  <div class="flex">
    <div
        class="proxy-card cursor-pointer"
        :class="this.isAdded ? 'added' : 'not-added'"
        @click="addProtocolToUser"
    >
      <span
          class="card-info"
      >
        <img
            :src="`/png/${protocol.type.img}`"
            :alt="protocol.type.name"
            height="24px"
            width="24px"
        >
        <span>{{ protocol.type.name }}</span>
        <img
            :src="this.isAdded ? '/svg/check-mark.svg' : '/svg/plus.svg'"
            :alt="this.isAdded ? 'check-mark' : 'plus'"
            class="check-icon"
            width="14px"
            height="14px"
        />
      </span>
    </div>
  </div>
</template>


<script lang="ts">

import {ProxyProtocol} from "../models/ProxyProtocol";
import {ProxyServer} from "../models/ProxyServer";
import {User} from "../models/User";
import axios from "axios";
import {UserProxy} from "../models/UserProxy";

export default {
  name: "ProxyCard",

  props: {
    protocol: {} as ProxyProtocol,
    user: User,
    server: ProxyServer,
  },

  methods: {
    addProtocolToUser() {
      let data = {
        "userId": this.user.id,
        "type": this.protocol.type.name.toUpperCase(),
        "proxyServerId": this.server.id
      };
      axios.post("/api/v1/add-proxy-to-user", data)
          .then((response) => {
            this.user.proxiesConfigs.push(response.data);
          })
          .catch((error) => {
            console.log(error);
          })
    }
  },

  computed: {
    isAdded() {
      return this.user.proxiesConfigs.some((userProxy: UserProxy) => {
        return userProxy.type.toUpperCase() === this.protocol.type.name &&
            userProxy.server.includes(this.server.host)
      })
    },
  },

};
</script>


<style scoped>
.proxy-card {
  width: 200px;
  height: 128px;
  padding: 8px;
  border-radius: 8px;
  opacity: 1;
  display: flex;
  gap: 16px;
  align-items: stretch;
  justify-content: space-between;
  position: relative;
  flex-wrap: wrap;
  flex: 1;
  min-width: 200px;
  flex-direction: column;
  text-align: center;
}

.card-info {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
}

.added {
  border: 1px solid rgba(0, 153, 81, 1);
}

.not-added {
  opacity: 40%;
  border: 1px solid gray;
}
</style>