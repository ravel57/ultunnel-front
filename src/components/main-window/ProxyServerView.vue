<template>
	<q-expansion-item style="margin-top: 16px; border-radius: 8px">
		<template v-slot:header>
			<q-item-section style="padding-left: 0;" avatar>
				<img src="../../../public/svg/server.svg" alt="server"/>
			</q-item-section>
			<q-item-section>
				<span style="font-size: 18px;font-weight: 550;">{{ this.server.name }}</span>
			</q-item-section>
		</template>
		<q-card>
			<div class="flex" style="margin-top: 12px;gap: 16px">
				<div v-for="protocol in this.server.proxies" :key="protocol.type">
					<ProxyCard
							:protocol="protocol"
							:server="this.server"
							:user="this.user"
					/>
				</div>
			</div>
		</q-card>
	</q-expansion-item>
</template>

<script lang="ts">
import ProxyCard from "./ProxyCard.vue";
import {ProxyServer} from "../../models/ProxyServer";
import {PropType} from "vue";
import {User} from "../../models/User";

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
::v-deep(.q-item) {
	padding-left: 0;
	padding-right: 0;
	border-radius: 8px;
}

::v-deep(.q-item__section--side) {
	padding-right: 0;
}

::v-deep(.q-item__section--avatar) {
	min-width: 0;
}

::v-deep(.q-item__section) {
	padding-right: 8px;
}
</style>