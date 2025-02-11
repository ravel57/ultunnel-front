<template>
	<div class="header-row">
		<q-input
				style="width: 100%"
				dense
				outlined
				v-model="this.searchRequests"
		>
			<template v-slot:append>
				<q-icon name="search"/>
			</template>
		</q-input>
		<q-btn
				class="new-user-btn"
				@click="isNewUserDialogOpened=true"
		>
			Добавить пользователя
		</q-btn>
		<q-btn
				dense
				flat
				icon="menu"
		>
			<q-menu style="border-radius: 8px" :offset="[130, 10]">
				<q-list style="min-width: 100px">
					<q-item clickable v-close-popup>
						<q-item-section @click="this.isNewServerDialogOpened = true" class="menu-item-container">
							<q-icon size="18px" name="dns"/>
							Добавить сервер
						</q-item-section>
					</q-item>
					<q-item clickable v-close-popup>
						<q-item-section @click="this.isNewProtocolDialogOpened = true" class="menu-item-container">
							<q-icon size="18px" name="share"/>
							Добавить протокол
						</q-item-section>
					</q-item>
					<q-item clickable v-close-popup>
						<q-item-section class="menu-item-container">
							<q-icon size="18px" name="dns"/>
							Менеджер серверов
						</q-item-section>
					</q-item>
				</q-list>
			</q-menu>
		</q-btn>
	</div>

	<q-dialog v-model="this.isNewUserDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
					name="close"
					class="close-new-user-modal"
					@click="isNewUserDialogOpened = false"
			/>
			<div class="new-user-header">
				Новый пользователь
			</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Имя</span>
					<q-input
							dense
							outlined
							v-model="this.newUserName"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Дата регистрации</span>
					<q-input
							dense
							outlined
							v-model="this.registerDate"
					/>
				</div>
			</div>
			<q-btn
					class="new-user-modal-create-btn"
					@click="createNewUser"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="this.isNewServerDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
					name="close"
					class="close-new-user-modal"
					@click="isNewServerDialogOpened = false"
			/>
			<div class="new-user-header">
				Новый сервер
			</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Название</span>
					<q-input
							dense
							outlined
							v-model="this.newServerName"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Host</span>
					<q-input
							dense
							outlined
							v-model="this.newServerHost"
					/>
				</div>
			</div>
			<q-btn
					class="new-user-modal-create-btn"
					@click="createNewServer"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="this.isNewProtocolDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
					name="close"
					class="close-new-user-modal"
					@click="isNewProtocolDialogOpened = false"
			/>
			<div class="new-user-header">
				Новый протокол
			</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Сревер</span>
					<q-select
							outlined
							v-model="this.protocolServer"
							label="Выберите тип"
							:options="this.store.servers.map(it => it.name)"
					/>
				</div>

				<div class="toggle-container">
					<div
							class="toggle-button"
							:class="{ active: isSubdomain === true }"
							@click="isSubdomain = true"
					>
						Поддомен
					</div>
					<div
							class="toggle-button"
							:class="{ active: isSubdomain === false }"
							@click="isSubdomain = false"
					>
						Порт
					</div>
				</div>

				<div v-if="this.isSubdomain" class="input-new-user-container">
					<span class="label-for-new-user-creation">Поддомен</span>
					<q-input
							dense
							outlined
							v-model="this.protocolSubdomain"
					/>
				</div>
				<div v-else class="input-new-user-container">
					<span class="label-for-new-user-creation">Порт</span>
					<q-input
							dense
							outlined
							v-model="this.protocolPort"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Логин</span>
					<q-input
							dense
							outlined
							v-model="this.protocolLogin"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Пароль</span>
					<q-input
							dense
							outlined
							v-model="this.protocolPassword"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Тип</span>
					<q-select
							outlined
							v-model="this.protocolType"
							label="Выберите тип"
							:options="this.protocolTypes.map(it => it.name)"
					/>
				</div>
			</div>
			<q-btn
					class="new-user-modal-create-btn"
					@click="createNewProtocol"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import axios from "axios";
import {useStore} from "../../store";
import {ProxyType} from "../../models/ProxyType";

export default {
	name: "Header",
	data: () => ({
		isNewUserDialogOpened: false,
		newUserName: "",
		registerDate: "",

		searchRequests: "",

		isNewServerDialogOpened: false,
		newServerName: "",
		newServerHost: "",

		isNewProtocolDialogOpened: false,
		protocolServer: "",
		isSubdomain: true,
		protocolPort: "",
		protocolSubdomain: "",
		protocolLogin: "",
		protocolPassword: "",
		protocolType: "",
		protocolTypes: [
			ProxyType.VLESS,
			ProxyType.HYSTERIA2,
			ProxyType.SSH,
			ProxyType.WIREGUARD,
			ProxyType.AMNEZIA_WG
		],

	}),
	methods: {
		createNewUser() {
			let user = {name: this.newUserName}
			axios.post("/api/v1/add-new-user", user)
			this.store.fetchData()
			this.isNewUserDialogOpened = false
		},
		createNewServer() {
			this.isNewServerDialogOpened = false
		},
		createNewProtocol() {
			this.isNewProtocolDialogOpened = false
		}
	},
	setup() {
		return {
			store: useStore()
		}
	}
}

</script>

<style scoped>
.menu-item-container {
	display: flex;
	flex-direction: row;
	align-content: center;
	gap: 5px;
	justify-content: start;
}

.new-user-btn {
	color: white;
	background-color: #2c2c2c;
	text-wrap: nowrap;
	border-radius: 8px;
}

.header-row {
	display: flex;
	flex-direction: row;
	gap: 16px;
}

.new-user-header {
	font-size: 24px;
	margin-bottom: 24px;
	margin-right: 16px;
	font-weight: bold;
}

.input-new-user-container {

}

.new-user-modal-card {
	padding: 24px;
	border-radius: 8px;
	min-width: 320px;
}

.close-new-user-modal {
	font-size: 24px;
	position: absolute;
	right: 12px;
	top: 12px;
	color: #757575;
	cursor: pointer;
}

.close-new-user-modal:hover {
	color: black;
}

.new-user-modal-create-btn {
	color: white;
	background-color: #2c2c2c;
	width: 100%;
	border-radius: 8px;
	margin-top: 24px;
}

.label-for-new-user-creation {
	font-size: 16px;
}

.new-user-inputs {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.toggle-container {
	display: flex;
	background: #f2f2f2;
	border-radius: 10px;
	padding: 4px;
	width: 160px;
	position: relative;
	gap: 8px;
}

.toggle-button {
	flex: 1;
	padding: 8px 12px;
	text-align: center;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.3s ease;
	color: #777;
	position: relative;
	z-index: 1;
}

.toggle-button.active {
	color: #fff;
	background: #333;
	border-radius: 8px;
}
</style>