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
			<div class="card-content">
				<div @click.stop="this.isQrModalVisible = true" class="qr-container">
					<img width="24px" height="24px" src="/svg/qr.svg" alt="qr"/>
					<span class="card-content-text">QR код</span>
				</div>
				<div @click.stop="copyLink('какая то строка')" class="link-container">
					<img width="24px" height="24px" src="/svg/link.svg" alt="link"/>
					<span class="card-content-text">-</span>
				</div>
			</div>
		</div>
	</div>

	<q-dialog v-model="this.isQrModalVisible">
		<q-card class="qr-modal-card">
			<q-icon
					name="close"
					class="close-qr-modal"
					@click="isQrModalVisible = false"
			/>
			<div class="qr-modal-header">
				QR код
			</div>
			<div class="qr-modal-subtitle">
				example Петр Latvia Hysteria
			</div>
			<div class="qr-modal-qr">
				<img width="272px" height="233px" src="/svg/qr.svg" alt="qr"/>
			</div>
		</q-card>
	</q-dialog>
</template>


<script lang="ts">

import {ProxyProtocol} from "../../models/ProxyProtocol";
import {ProxyServer} from "../../models/ProxyServer";
import {User} from "../../models/User";
import axios from "axios";
import {UserProxy} from "../../models/UserProxy";

export default {
	name: "ProxyCard",

	props: {
		protocol: {} as ProxyProtocol,
		user: User,
		server: ProxyServer,
	},

	data: () => ({
		isQrModalVisible: false,
	}),

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
		},
		copyLink(value: string) {
			navigator.clipboard.writeText(value)
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
.qr-modal-card {
	padding: 24px;
	border-radius: 8px;
	min-width: 320px;
}

.close-qr-modal {
	font-size: 24px;
	position: absolute;
	right: 12px;
	top: 12px;
	color: #757575;
	cursor: pointer;
}

.close-qr-modal:hover {
	color: black;
}

.qr-modal-header {
	font-size: 24px;
	margin-bottom: 8px;
	margin-right: 16px;
	font-weight: bold;
}

.qr-modal-subtitle {
	font-size: 18px;
	margin-bottom: 24px;
	color: #bababa;
}

.qr-container {
	width: 184px;
	height: 32px;
	display: flex;
	gap: 8px;
	align-items: center;
}

.link-container {
	width: 184px;
	height: 32px;
	display: flex;
	gap: 8px;
	align-items: center;
}

.link-container:hover {
	color: black;
}

.qr-container:hover {
	color: black;
}

.card-content-text {
	text-overflow: ellipsis;
	overflow: hidden;
}

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

.proxy-card:hover {
	box-shadow: 3px 3px 10px #acacac;
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