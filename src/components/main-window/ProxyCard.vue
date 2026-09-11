<template>
	<div class="flex">
		<div
			class="proxy-card cursor-pointer"
			:class="isAdded ? 'added' : 'not-added'"
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
				<img
					:src="isAdded ? '/svg/check-mark.svg' : '/svg/plus.svg'"
					:alt="isAdded ? 'check-mark' : 'plus'"
					class="check-icon"
					width="14px"
					height="14px"
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
		};
	},

	methods: {
		getConfigProtocolType(userProxy: UserProxy): string {
			const proxyType = userProxy?.proxy?.type as unknown;

			// Backend обычно сериализует ProxyType как строку, например "TROJAN2".
			if (typeof proxyType === "string") {
				return proxyType.toUpperCase();
			}

			// Если type пришёл как frontend-объект ProxyTypeValue.
			if (
				typeof proxyType === "object" &&
				proxyType !== null &&
				"name" in proxyType
			) {
				const name = (proxyType as {name?: string}).name;
				return name?.toUpperCase() ?? "";
			}

			return "";
		},

		matchesServer(userProxy: UserProxy): boolean {
			const configServer = userProxy?.server ?? "";
			const host = this.server?.host ?? "";
			const serverIp = this.protocol?.serverIp ?? "";

			return (
				(host !== "" && configServer.includes(host)) ||
				(serverIp !== "" && configServer === serverIp)
			);
		},

		matchesProtocol(userProxy: UserProxy): boolean {
			const protocolId = this.protocol?.id;
			const configProtocolId = userProxy?.proxy?.id;

			// Основной и самый точный вариант: сравниваем конкретные Proxy по id.
			if (protocolId != null && configProtocolId != null) {
				return String(protocolId) === String(configProtocolId);
			}

			const protocolName = this.protocol?.type?.name?.toUpperCase() ?? "";
			const configProxyType = this.getConfigProtocolType(userProxy);

			// Если backend прислал proxy.type, можно отличить TROJAN от TROJAN2.
			if (protocolName !== "" && configProxyType !== "") {
				return (
					protocolName === configProxyType &&
					this.matchesServer(userProxy)
				);
			}

			// Совместимость со старыми записями, где поля proxy ещё нет.
			// TROJAN2 является внутренним типом панели, но конфиг sing-box имеет type=trojan.
			const expectedConfigType = protocolName === "TROJAN2"
				? "TROJAN"
				: protocolName;
			const configType = userProxy?.type?.toUpperCase() ?? "";

			return (
				expectedConfigType !== "" &&
				configType === expectedConfigType &&
				this.matchesServer(userProxy)
			);
		},

		async addProtocolToUser(): Promise<void> {
			if (this.isAdded) {
				return;
			}

			const data = {
				userId: this.user.id,
				type: this.protocol.type.name.toUpperCase(),
				proxyServerId: this.server.id,
			};

			try {
				const response = await axios.post<UserProxy>(
					"/api/v1/add-proxy-to-user",
					data,
				);

				const newConfig = response.data;

				// Даже если backend не вернул вложенный proxy, сохраняем его локально,
				// чтобы карточка сразу стала активной без перезагрузки страницы.
				if (!newConfig.proxy) {
					newConfig.proxy = this.protocol;
				}

				if (!this.user.proxiesConfigs) {
					this.user.proxiesConfigs = [];
				}

				this.user.proxiesConfigs.push(newConfig);
			} catch (error) {
				console.error("Не удалось добавить прокси пользователю", error);
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
			return (this.user?.proxiesConfigs ?? []).find(
				(userProxy: UserProxy) => this.matchesProtocol(userProxy),
			);
		},

		isAdded(): boolean {
			return this.matchedUserProxy !== undefined;
		},

		getProtocolUrl(): string {
			return this.matchedUserProxy?.url ?? "";
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