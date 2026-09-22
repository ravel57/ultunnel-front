<template>
	<div class="flex">
		<div
			class="proxy-card cursor-pointer"
			:class="[
				isAdded ? 'added' : 'not-added',
				{ busy: isAdding || isRemoving },
			]"
			@click="addProtocolToUser"
		>
			<span class="card-info">
				<img
					:src="`/png/${protocol.type.img}`"
					:alt="protocol.type.name"
					height="24px"
					width="24px"
				>
				<span>{{ protocol.type.name }}</span>
				<q-spinner
					v-if="isAdding"
					class="check-icon"
					size="24px"
				/>
				<img
					v-else
					:src="isAdded ? '/svg/check-mark.svg' : '/svg/plus.svg'"
					:alt="isAdded ? 'check-mark' : 'plus'"
					class="check-icon"
					width="24px"
					height="24px"
				/>

				<q-btn
					v-if="isAdded"
					class="remove-user-protocol-btn"
					flat
					round
					dense
					icon="delete_outline"
					color="negative"
					:loading="isRemoving"
					:disable="isAdding || isRemoving"
					@click.stop="removeProtocolFromUser"
				/>
			</span>

			<div class="card-content">
				<div
					class="qr-container"
					@click.stop="isQrModalVisible = true"
				>
					<img width="24px" height="24px" src="/svg/qr.svg" alt="qr"/>
					<span class="card-content-text">QR код</span>
				</div>

				<div
					class="link-container"
					@click.stop="copyLink(getProtocolUrl)"
				>
					<img width="24px" height="24px" src="/svg/link.svg" alt="link"/>
					<span class="card-content-text">{{ getProtocolUrl }}</span>
				</div>
			</div>
		</div>
	</div>

	<q-dialog v-model="isQrModalVisible">
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
import {defineComponent, PropType} from "vue";
import axios from "axios";

import {ProxyProtocol} from "../../models/ProxyProtocol";
import {ProxyServer} from "../../models/ProxyServer";
import {User} from "../../models/User";
import {UserProxy} from "../../models/UserProxy";
import {deleteProtocolFromUser} from "../../api/adminApi";

export default defineComponent({
	name: "ProxyCard",

	props: {
		protocol: {
			type: Object as PropType<ProxyProtocol>,
			required: true,
		},
		user: {
			type: Object as PropType<User>,
			required: true,
		},
		server: {
			type: Object as PropType<ProxyServer>,
			required: true,
		},
	},

	data() {
		return {
			isQrModalVisible: false,
			isAdding: false,
			isRemoving: false,
		};
	},

	methods: {
		normalizeType(value: unknown): string {
			if (typeof value === "string") {
				return value.trim().toUpperCase();
			}

			if (typeof value === "object" && value !== null && "name" in value) {
				const name = (value as {name?: unknown}).name;
				return typeof name === "string" ? name.trim().toUpperCase() : "";
			}

			return "";
		},

		getConfigProtocolType(userProxy: UserProxy): string {
			// New API shape: proxy.type. Old API shape: type on the config itself.
			return (
				this.normalizeType(userProxy?.proxy?.type) ||
				this.normalizeType(userProxy?.type)
			);
		},

		matchesServer(userProxy: UserProxy): boolean {
			// Backend may legally return null here. Never call .includes on it directly.
			const configServer = typeof userProxy?.server === "string"
				? userProxy.server
				: "";
			const host = typeof this.server?.host === "string"
				? this.server.host
				: "";
			const serverIp = typeof this.protocol?.serverIp === "string"
				? this.protocol.serverIp
				: "";

			return (
				(host !== "" && configServer.includes(host)) ||
				(serverIp !== "" && configServer === serverIp)
			);
		},

		matchesProtocol(userProxy: UserProxy): boolean {
			const protocolId = this.protocol?.id;
			const configProtocolId = userProxy?.proxy?.id;

			// Most reliable match when the backend provides the nested proxy id.
			if (protocolId != null && configProtocolId != null) {
				return String(protocolId) === String(configProtocolId);
			}

			const protocolName = this.normalizeType(this.protocol?.type);
			const configProxyType = this.normalizeType(userProxy?.proxy?.type);

			if (protocolName !== "" && configProxyType !== "") {
				return protocolName === configProxyType && this.matchesServer(userProxy);
			}

			// Compatibility with old records. TROJAN2 is represented as trojan in sing-box.
			const expectedConfigType = protocolName === "TROJAN2"
				? "TROJAN"
				: protocolName;
			const configType = this.normalizeType(userProxy?.type);

			return (
				expectedConfigType !== "" &&
				configType === expectedConfigType &&
				this.matchesServer(userProxy)
			);
		},

		async addProtocolToUser(): Promise<void> {
			if (this.isAdded || this.isAdding || this.isRemoving) {
				return;
			}

			const protocolType = this.normalizeType(this.protocol?.type);
			if (!protocolType) {
				console.error("Не удалось добавить прокси: у протокола отсутствует type", this.protocol);
				return;
			}

			const data = {
				userId: this.user.id,
				type: protocolType,
				proxyServerId: this.server.id,
			};

			this.isAdding = true;
			try {
				const response = await axios.post<UserProxy>(
					"/api/v1/add-proxy-to-user",
					data,
				);

				const newConfig = (
					response.data && typeof response.data === "object"
						? response.data
						: {}
				) as UserProxy;

				// Make UI state deterministic even if backend returns only the config fields.
				if (!newConfig.proxy) {
					newConfig.proxy = {
						id: this.protocol.id,
						type: this.protocol.type,
					};
				}

				if (!Array.isArray(this.user.proxiesConfigs)) {
					this.user.proxiesConfigs = [];
				}

				this.user.proxiesConfigs.push(newConfig);
			} catch (error) {
				console.error("Не удалось добавить прокси пользователю", error);
			} finally {
				this.isAdding = false;
			}
		},

		async removeProtocolFromUser(): Promise<void> {
			if (!this.isAdded || this.isAdding || this.isRemoving) {
				return;
			}

			const matched = this.matchedUserProxy;
			if (!matched) return;

			if (!window.confirm(`Удалить ${this.protocol.type.name} у пользователя «${this.user.name}»?`)) {
				return;
			}

			this.isRemoving = true;
			try {
				await deleteProtocolFromUser(
					this.user.id,
					this.server.id,
					this.normalizeType(this.protocol?.type),
					matched.id,
				);

				const index = (this.user.proxiesConfigs ?? []).findIndex(
					(userProxy: UserProxy) => userProxy === matched,
				);
				if (index >= 0) {
					this.user.proxiesConfigs.splice(index, 1);
				}
			} catch (error) {
				console.error("Не удалось удалить прокси у пользователя", error);
			} finally {
				this.isRemoving = false;
			}
		},

		async copyLink(value: string): Promise<void> {
			if (!value) {
				return;
			}

			try {
				await navigator.clipboard.writeText(value);
			} catch (error) {
				console.error("Не удалось скопировать ссылку", error);
			}
		},
	},

	computed: {
		matchedUserProxy(): UserProxy | undefined {
			const configs = Array.isArray(this.user?.proxiesConfigs)
				? this.user.proxiesConfigs
				: [];

			return configs.find(
				(userProxy: UserProxy) => this.matchesProtocol(userProxy),
			);
		},

		isAdded(): boolean {
			return this.matchedUserProxy !== undefined;
		},

		getProtocolUrl(): string {
			const url = this.matchedUserProxy?.url;
			return typeof url === "string" ? url : "";
		},
	},
});
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
	text-wrap: nowrap;
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

.proxy-card.busy {
	pointer-events: none;
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

.remove-user-protocol-btn {
	position: absolute;
	top: 36px;
	right: 4px;
	z-index: 2;
}

.added {
	border: 1px solid rgba(0, 153, 81, 1);
}

.not-added {
	opacity: 40%;
	border: 1px solid gray;
}
</style>
