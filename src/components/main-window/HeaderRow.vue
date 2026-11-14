<template>
	<div class="header-row">
		<q-input
			style="width: 100%"
			dense
			outlined
			clearable
			v-model="store.searchQuery"
			placeholder="Поиск пользователей"
		>
			<template v-slot:append>
				<q-icon name="search"/>
			</template>
		</q-input>
		<q-btn
			class="new-user-btn"
			@click="isNewUserDialogOpened = true"
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
						<q-item-section @click="isNewServerDialogOpened = true" class="menu-item-container">
							<q-icon size="18px" name="dns"/>
							Добавить сервер
						</q-item-section>
					</q-item>
					<q-item clickable v-close-popup>
						<q-item-section @click="isNewProtocolDialogOpened = true" class="menu-item-container">
							<q-icon size="18px" name="share"/>
							Добавить протокол
						</q-item-section>
					</q-item>
					<q-item clickable v-close-popup>
						<q-item-section @click="openBulkDialog" class="menu-item-container">
							<q-icon size="18px" name="groups"/>
							Массовые действия
						</q-item-section>
					</q-item>
					<q-item clickable v-close-popup @click="isServerManagerDialogOpened = true">
						<q-item-section class="menu-item-container">
							<q-icon size="18px" name="dns"/>
							Менеджер серверов
						</q-item-section>
					</q-item>
				</q-list>
			</q-menu>
		</q-btn>
	</div>

	<q-dialog v-model="isNewUserDialogOpened" @hide="scrollToCreatedUser">
		<q-card class="new-user-modal-card">
			<q-icon
				name="close"
				class="close-new-user-modal"
				@click="isNewUserDialogOpened = false"
			/>
			<div class="new-user-header">Новый пользователь</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Имя</span>
					<q-input dense outlined v-model="newUserName"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Дата регистрации</span>
					<q-input dense outlined v-model="registerDate"/>
				</div>
			</div>
			<q-btn
				class="new-user-modal-create-btn"
				:loading="isCreatingUser"
				:disable="!newUserName.trim()"
				@click="createNewUser"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="isNewServerDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
				name="close"
				class="close-new-user-modal"
				@click="isNewServerDialogOpened = false"
			/>
			<div class="new-user-header">Новый сервер</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Название</span>
					<q-input dense outlined v-model="newServerName"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Host</span>
					<q-input dense outlined v-model="newServerHost"/>
				</div>
				<div class="toggle-container">
					<div class="toggle-button" :class="{ active: newServerUseSubdomain === true }" @click="newServerUseSubdomain = true">
						Поддомен
					</div>
					<div class="toggle-button" :class="{ active: newServerUseSubdomain === false }" @click="newServerUseSubdomain = false">
						Порт
					</div>
				</div>

				<div v-if="newServerUseSubdomain" class="input-new-user-container">
					<span class="label-for-new-user-creation">Поддомен</span>
					<q-input dense outlined v-model="newServerSubdomain"/>
				</div>
				<div v-else class="input-new-user-container">
					<span class="label-for-new-user-creation">Порт</span>
					<q-input dense outlined v-model="newServerPort"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Логин</span>
					<q-input dense outlined v-model="newServerLogin"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Пароль</span>
					<q-input dense outlined v-model="newServerPassword" type="password"/>
				</div>
				<q-checkbox v-model="newServerUseIp" label="Указать IP сервера" dense/>
				<div v-if="newServerUseIp" class="input-new-user-container">
					<span class="label-for-new-user-creation">IP сервера</span>
					<q-input dense outlined v-model="newServerIp"/>
				</div>

                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Путь к сертификату (fullchain.pem)</span>
                    <q-input dense outlined v-model="newServerCertificateFile" placeholder="/etc/letsencrypt/live/example.com/fullchain.pem"/>
                </div>
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Путь к закрытому ключу (privkey.pem)</span>
                    <q-input dense outlined v-model="newServerPrivateKeyFile" placeholder="/etc/letsencrypt/live/example.com/privkey.pem"/>
                </div>
                <div>Пути на выбранном сервере. Если оба поля пустые, используются сертификаты панели.</div>

			</div>
            <div v-if="serverFormError" class="text-negative" role="alert">{{ serverFormError }}</div>
			<q-btn
				class="new-user-modal-create-btn"
				:loading="isCreatingServer"
				:disable="!newServerName.trim() || !newServerHost.trim() || !newServerLogin.trim() || !newServerPassword || (newServerUseSubdomain ? !newServerSubdomain.trim() : !newServerPort)"
				@click="createNewServer"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="isNewProtocolDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
				name="close"
				class="close-new-user-modal"
				@click="isNewProtocolDialogOpened = false"
			/>
			<div class="new-user-header">Новый протокол</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Сервер</span>
					<q-select
						outlined
						v-model="protocolServer"
						label="Выберите сервер"
						:options="store.servers.map(it => ({label: it.name, value: String(it.id)}))"
                        emit-value map-options
					/>
				</div>

                <template v-if="protocolType === 'SSH'">
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Порт SSH</span>
                    <q-input dense outlined v-model="protocolPort" type="number"/>
                </div>
                <div class="input-new-user-container">
					<span class="label-for-new-user-creation">Логин</span>
					<q-input dense outlined v-model="protocolLogin"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Пароль</span>
					<q-input dense outlined v-model="protocolPassword" type="password"/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Порт протокола</span>
					<q-input dense outlined v-model="proxyPort"/>
				</div>
				<q-checkbox v-model="useServerIp" label="Указать IP сервера" dense/>
				<div v-if="useServerIp" class="input-new-user-container">
					<span class="label-for-new-user-creation">IP сервера</span>
					<q-input dense outlined v-model="serverIp"/>
				</div>
                </template>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Тип</span>
					<q-select
						outlined
						v-model="protocolType"
						label="Выберите тип"
						:options="availableProtocolTypes.map(it => it.name)"
					/>
				</div>
			</div>
            <div v-if="protocolFormError" class="text-negative" role="alert">{{ protocolFormError }}</div>
			<q-btn
				class="new-user-modal-create-btn"
				:loading="isCreatingProtocol"
				:disable="!protocolServer || !availableProtocolTypes.some(it => it.name === protocolType)"
				@click="createNewProtocol"
			>
				Создать
			</q-btn>
		</q-card>
	</q-dialog>
	<q-dialog v-model="this.isBulkDialogOpened">
		<q-card class="new-user-modal-card">
			<q-icon
				name="close"
				class="close-new-user-modal"
				@click="isBulkDialogOpened = false"
			/>
			<div class="new-user-header">
				Массовые действия
			</div>
			<div class="new-user-inputs">
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Сервер</span>
					<q-select
						outlined
						v-model="this.bulkServer"
						label="Выберите сервер"
						:options="this.store.servers.map(it => it.name)"
					/>
				</div>
				<div class="input-new-user-container">
					<span class="label-for-new-user-creation">Протокол</span>
					<q-select
						outlined
						v-model="this.bulkType"
						label="Выберите протокол"
						:options="this.bulkTypeOptions"
						:disable="this.bulkTypeOptions.length === 0"
					/>
				</div>
				<div v-if="this.bulkError" class="bulk-error">
					{{ this.bulkError }}
				</div>
				<div v-if="this.bulkResult" class="bulk-result">
					<div>Всего пользователей: {{ this.bulkResult.total }}</div>
					<div>Изменено: {{ this.bulkResult.affected }}</div>
					<div>Пропущено: {{ this.bulkResult.skipped }}</div>
					<div>Ошибок: {{ this.bulkResult.failed }}</div>
					<div v-if="this.bulkResult.configsRemoved != null">
						Удалено конфигов: {{ this.bulkResult.configsRemoved }}
					</div>
					<div
						v-for="(error, index) in this.bulkResult.errors"
						:key="index"
						class="bulk-error"
					>
						{{ error.userName || error.userId }}: {{ error.message }}
					</div>
				</div>
			</div>
			<q-btn
				class="new-user-modal-create-btn"
				:loading="this.bulkLoading"
				@click="addProtocolToAllUsers"
			>
				Добавить всем
			</q-btn>
			<q-btn
				class="bulk-delete-btn"
				:loading="this.bulkLoading"
				@click="confirmBulkDelete"
			>
				Удалить у всех
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="this.isBulkDeleteConfirmOpened">
		<q-card class="new-user-modal-card">
			<div class="new-user-header">
				Удалить у всех?
			</div>
			<div class="bulk-confirm-text">
				Протокол {{ this.bulkType || "—" }} будет удалён у всех пользователей сервера
				{{ this.bulkServer || "—" }}. Действие необратимо.
			</div>
            <div v-if="bulkType !== 'SSH'" class="bulk-confirm-text">
                Учётные записи клиентов, их трафик и все привязки будут полностью удалены из серверной панели.
            </div>
			<q-btn
				class="bulk-delete-btn"
				:loading="this.bulkLoading"
				@click="deleteProtocolFromAllUsers"
			>
				Удалить
			</q-btn>
			<q-btn
				class="bulk-cancel-btn"
				flat
				@click="isBulkDeleteConfirmOpened = false"
			>
				Отмена
			</q-btn>
		</q-card>
	</q-dialog>

	<q-dialog v-model="isServerManagerDialogOpened">
		<q-card class="server-manager-card">
			<q-icon
				name="close"
				class="close-new-user-modal"
				@click="isServerManagerDialogOpened = false"
			/>
			<div class="new-user-header">Менеджер серверов</div>

			<div v-if="store.servers.length === 0" class="manager-empty">
				Серверов пока нет
			</div>

			<div v-else class="server-manager-list">
				<div v-for="server in store.servers" :key="server.id" class="server-manager-item">
					<div class="server-manager-header">
						<div class="server-manager-name">
							<strong>{{ server.name }}</strong>
							<span>{{ server.host }}</span>
						</div>
                        <q-btn flat round dense icon="edit" aria-label="Изменить параметры сервера"
                            :disable="deletingServerId !== null || deletingProtocolId !== null || isSavingServer"
                            @click="openServerEditor(server)">
                            <q-tooltip>Параметры сервера</q-tooltip>
                        </q-btn>
						<q-btn
							flat
							round
							dense
							icon="delete_outline"
							color="negative"
							:loading="deletingServerId === server.id"
							:disable="deletingServerId !== null || deletingProtocolId !== null"
							@click="removeServer(server)"
						/>
					</div>

					<div v-if="(server.proxies ?? []).length === 0" class="protocol-empty">
						Нет протоколов
					</div>
					<div v-else class="protocol-manager-list">
						<div v-for="protocol in server.proxies" :key="protocol.id" class="protocol-manager-item">
							<div class="protocol-manager-info">
								<img
									v-if="protocol.type?.img"
									:src="`/png/${protocol.type.img}`"
									:alt="protocol.type.name"
									width="22"
									height="22"
								/>
								<span>{{ protocolTypeName(protocol) }}</span>
							</div>
							<q-btn
								flat
								round
								dense
								icon="delete_outline"
								color="negative"
								:loading="deletingProtocolId === protocol.id"
								:disable="deletingServerId !== null || deletingProtocolId !== null"
								@click="removeProtocol(server, protocol)"
							/>
						</div>
					</div>
				</div>
			</div>
		</q-card>
	</q-dialog>
    <q-dialog v-model="isServerEditorOpened" :persistent="isSavingServer">
        <q-card class="new-user-modal-card">
            <div class="new-user-header">Параметры сервера</div>
            <div>{{ editingServerName }}</div>
            <div class="new-user-inputs">
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Логин панели</span>
                    <q-input dense outlined v-model="editServerLogin" autocomplete="username" :disable="isSavingServer"/>
                </div>
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Новый пароль панели</span>
                    <q-input dense outlined v-model="editServerPassword" type="password" autocomplete="new-password"
                        placeholder="Оставьте пустым, чтобы сохранить текущий" :disable="isSavingServer"/>
                </div>
                <q-toggle v-model="editServerUseSubdomain" label="Подключение через поддомен" :disable="isSavingServer"/>
                <div v-if="editServerUseSubdomain" class="input-new-user-container">
                    <span class="label-for-new-user-creation">Поддомен панели</span>
                    <q-input dense outlined v-model="editServerSubdomain" :disable="isSavingServer"/>
                </div>
                <div v-else class="input-new-user-container">
                    <span class="label-for-new-user-creation">Порт панели</span>
                    <q-input dense outlined v-model="editServerPort" type="number" min="1" max="65535" :disable="isSavingServer"/>
                </div>
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">IP сервера</span>
                    <q-input dense outlined v-model="editServerIp" placeholder="Пусто — использовать Host сервера" :disable="isSavingServer"/>
                </div>
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Путь к сертификату (fullchain.pem)</span>
                    <q-input dense outlined v-model="editServerCertificateFile" placeholder="/etc/letsencrypt/live/example.com/fullchain.pem" :disable="isSavingServer"/>
                </div>
                <div class="input-new-user-container">
                    <span class="label-for-new-user-creation">Путь к закрытому ключу (privkey.pem)</span>
                    <q-input dense outlined v-model="editServerPrivateKeyFile" placeholder="/etc/letsencrypt/live/example.com/privkey.pem" :disable="isSavingServer"/>
                </div>
                <div>Пути на выбранном сервере. Если оба поля пустые, используются сертификаты панели.</div>

            </div>
            <div v-if="serverEditorError" class="text-negative" role="alert">{{ serverEditorError }}</div>
            <q-btn class="new-user-modal-create-btn" label="Сохранить" :loading="isSavingServer"
                :disable="!editServerLogin.trim() || (editServerUseSubdomain ? !editServerSubdomain.trim() : !(Number(editServerPort) >= 1 && Number(editServerPort) <= 65535))"
                @click="saveServerSettings"/>
            <q-btn flat label="Отмена" :disable="isSavingServer" @click="isServerEditorOpened = false"/>
        </q-card>
    </q-dialog>

</template>

<script lang="ts">
import axios from "axios";
import {nextTick} from "vue";
import {useStore} from "../../store";
import {ProxyType} from "../../models/ProxyType";
import type {ProxyTypeValue} from "../../models/ProxyTypeValue";
import {ProxyServer} from "../../models/ProxyServer";
import {ProxyProtocol} from "../../models/ProxyProtocol";
import {deleteProtocol, deleteServer} from "../../api/adminApi";
import {User} from "../../models/User";

export default {
	name: "Header",

	data: () => ({
		isNewUserDialogOpened: false,
		newUserName: "",
		registerDate: "",
		isCreatingUser: false,
		createdUserId: null as number | null,

        isServerEditorOpened: false,
        isSavingServer: false,
        editingServerId: null as number | null,
        editingServerName: "",
        editServerLogin: "",
        editServerPassword: "",
        editServerUseSubdomain: true,
        editServerSubdomain: "",
        editServerPort: "",
        editServerIp: "",
        editServerCertificateFile: "",
        editServerPrivateKeyFile: "",
        serverEditorError: "",
		isNewServerDialogOpened: false,
		newServerName: "",
		newServerHost: "",
        newServerLogin: "",
        newServerPassword: "",
        newServerUseSubdomain: true,
        newServerSubdomain: "",
        newServerPort: "",
        newServerUseIp: false,
        newServerIp: "",
        newServerCertificateFile: "",
        newServerPrivateKeyFile: "",
        serverFormError: "",
        protocolFormError: "",
		isCreatingServer: false,

		isNewProtocolDialogOpened: false,
		protocolServer: "",
		isSubdomain: true,
		protocolPort: "",
		protocolSubdomain: "",
		protocolLogin: "",
		protocolPassword: "",
		protocolType: "",
		proxyPort: "",
		useServerIp: false,
		serverIp: "",
		isBulkDialogOpened: false,
		isBulkDeleteConfirmOpened: false,
		bulkServer: "",
		bulkType: "",
		bulkLoading: false,
		bulkResult: null,
		bulkError: "",
		isCreatingProtocol: false,
		protocolTypes: [
			ProxyType.VLESS,
			ProxyType.TROJAN,
			ProxyType.HYSTERIA2,
			ProxyType.TUIC,
			ProxyType.MASQUE,
			ProxyType.ANYTLS,
			ProxyType.SHADOWTLS,
			ProxyType.TRUSTTUNNEL,
			ProxyType.SSH,
			ProxyType.WIREGUARD,
			ProxyType.AMNEZIA_WG,
			ProxyType.NAIVE,
		],

		isServerManagerDialogOpened: false,
		deletingServerId: null as number | null,
		deletingProtocolId: null as number | null,
	}),

	methods: {
        openServerEditor(server: ProxyServer) {
            if (this.isSavingServer) return
            this.editingServerId = server.id
            this.editingServerName = server.name
            this.editServerLogin = server.login ?? ""
            this.editServerPassword = ""
            this.editServerUseSubdomain = server.useSubDomain === true
            this.editServerSubdomain = server.subdomain ?? ""
            this.editServerPort = server.port != null ? String(server.port) : ""
            this.editServerIp = server.serverIp ?? ""
            this.editServerCertificateFile = server.certificateFile ?? ""
            this.editServerPrivateKeyFile = server.privateKeyFile ?? ""
            this.serverEditorError = ""
            this.isServerEditorOpened = true
        },

        async saveServerSettings() {
            if (this.isSavingServer || this.editingServerId == null) return
            const server = this.store.servers.find(it => it.id === this.editingServerId)
            if (!server) { this.serverEditorError = "Сервер больше не существует"; return }
            this.isSavingServer = true
            this.serverEditorError = ""
            try {
                await axios.post("/api/v1/edit-server", {
                    id: server.id, name: server.name, host: server.host,
                    login: this.editServerLogin.trim(), password: this.editServerPassword,
                    useSubDomain: this.editServerUseSubdomain,
                    subdomain: this.editServerUseSubdomain ? this.editServerSubdomain.trim() : null,
                    port: this.editServerUseSubdomain ? null : Number(this.editServerPort),
                    serverIp: this.editServerIp.trim() || null,
                    certificateFile: this.editServerCertificateFile.trim() || null,
                    privateKeyFile: this.editServerPrivateKeyFile.trim() || null,
                })
                await this.store.fetchServers()
                this.editServerPassword = ""
                this.isServerEditorOpened = false
            } catch (error) {
                this.serverEditorError = axios.isAxiosError(error)
                    ? String(error.response?.data?.message || error.message) : String(error)
            } finally { this.isSavingServer = false }
        },

		async createNewUser() {
			if (!this.newUserName.trim() || this.isCreatingUser) return

			this.isCreatingUser = true
			try {
				const response = await axios.post<User>("/api/v1/add-new-user", {
					name: this.newUserName.trim(),
				})
				const createdUser = response.data
				createdUser.createdDate = new Date(createdUser.createdDate)
				createdUser.nextPaymentDate = new Date(createdUser.nextPaymentDate)
				createdUser.proxiesConfigs = Array.isArray(createdUser.proxiesConfigs)
					? createdUser.proxiesConfigs
					: []
				this.store.users.push(createdUser)

				// A current search must not hide the user we have just created.
				this.store.searchQuery = ""
				this.createdUserId = createdUser.id
				this.newUserName = ""
				this.registerDate = ""
				this.isNewUserDialogOpened = false
			} catch (error) {
				console.error("Не удалось создать пользователя", error)
			} finally {
				this.isCreatingUser = false
			}
		},

		async scrollToCreatedUser() {
			const userId = this.createdUserId
			if (userId == null) return

			this.createdUserId = null
			await nextTick()

			const element = document.getElementById(`user-${userId}`)
			if (!element) return

			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
			})
		},

		async createNewServer() {
			if (!this.newServerName.trim() || !this.newServerHost.trim() || this.isCreatingServer) return

            this.serverFormError = ""
			this.isCreatingServer = true
			try {
				await axios.post('/api/v1/add-new-server', {
					name: this.newServerName.trim(),
					host: this.newServerHost.trim(),
                    login: this.newServerLogin.trim(), password: this.newServerPassword,
                    useSubDomain: this.newServerUseSubdomain,
                    subdomain: this.newServerUseSubdomain ? this.newServerSubdomain.trim() : null,
                    port: this.newServerUseSubdomain ? null : Number(this.newServerPort),
                    serverIp: this.newServerUseIp ? this.newServerIp.trim() : null,
                    certificateFile: this.newServerCertificateFile.trim() || null,
                    privateKeyFile: this.newServerPrivateKeyFile.trim() || null,
				})
				await this.store.fetchServers()
				this.newServerName = ""
				this.newServerHost = ""
                this.newServerLogin = ""; this.newServerPassword = ""
                this.newServerSubdomain = ""; this.newServerPort = ""; this.newServerIp = ""
                this.newServerCertificateFile = ""; this.newServerPrivateKeyFile = ""
				this.isNewServerDialogOpened = false
			} catch (error) {
                this.serverFormError = axios.isAxiosError(error)
                    ? String(error.response?.data?.message || error.message) : String(error)
			} finally {
				this.isCreatingServer = false
			}
		},

		async createNewProtocol() {
			if (!this.protocolServer || !this.protocolType || this.isCreatingProtocol) return

			const server = this.store.servers.find(it => String(it.id) === this.protocolServer)
			if (!server) return

            if (!this.availableProtocolTypes.some(it => it.name === this.protocolType)) return
            this.protocolFormError = ""
			this.isCreatingProtocol = true
			try {
                const payload = this.protocolType === "SSH" ? {
                    type: this.protocolType, login: this.protocolLogin, password: this.protocolPassword,
                    port: Number(this.protocolPort), proxyPort: Number(this.proxyPort || this.protocolPort),
                    serverIp: this.useServerIp ? this.serverIp : null,
                } : {type: this.protocolType}
                await axios.post(`/api/v1/add-proxy-to/${server.id}`, payload)

				await this.store.fetchServers()
				this.resetProtocolForm()
				this.isNewProtocolDialogOpened = false
			} catch (error) {
                this.protocolFormError = axios.isAxiosError(error)
                    ? String(error.response?.data?.message || error.message) : String(error)
                if (axios.isAxiosError(error) && error.response?.status === 409) await this.store.fetchServers()
			} finally {
				this.isCreatingProtocol = false
			}
		},

		resetProtocolForm() {
			this.protocolServer = ""
			this.isSubdomain = true
			this.protocolPort = ""
			this.protocolSubdomain = ""
			this.protocolLogin = ""
			this.protocolPassword = ""
			this.protocolType = ""
			this.proxyPort = ""
			this.useServerIp = false
			this.serverIp = ""
		},

		protocolTypeName(protocol: ProxyProtocol): string {
			const type = protocol?.type as any
			return typeof type === "string" ? type : (type?.name ?? "Протокол")
		},

		async removeServer(server: ProxyServer) {
			if (this.deletingServerId !== null || this.deletingProtocolId !== null) return
			if (!window.confirm(`Удалить сервер «${server.name}» и все его протоколы?`)) return

			this.deletingServerId = server.id
			try {
				await deleteServer(server.id)
				await this.store.fetchData()
			} catch (error) {
				console.error("Не удалось удалить сервер", error)
			} finally {
				this.deletingServerId = null
			}
		},

		async removeProtocol(server: ProxyServer, protocol: ProxyProtocol) {
			if (this.deletingServerId !== null || this.deletingProtocolId !== null) return
			const name = this.protocolTypeName(protocol)
			if (!window.confirm(`Удалить протокол «${name}» с сервера «${server.name}»?`)) return

			this.deletingProtocolId = protocol.id
			try {
				await deleteProtocol(server.id, protocol.id)
				await this.store.fetchData()
			} catch (error) {
				console.error("Не удалось удалить протокол", error)
			} finally {
				this.deletingProtocolId = null
			}
		},

		openBulkDialog() {
			this.bulkResult = null
			this.bulkError = ""
			this.isBulkDialogOpened = true
		},

		addProtocolToAllUsers() {
			this.sendBulkAction(true)
		},

		confirmBulkDelete() {
			if (!this.bulkServerObject || !this.bulkType) {
				this.bulkResult = null
				this.bulkError = "Выберите сервер и протокол"
				return
			}

			this.bulkError = ""
			this.isBulkDeleteConfirmOpened = true
		},

		deleteProtocolFromAllUsers() {
			this.isBulkDeleteConfirmOpened = false
			this.sendBulkAction(false)
		},

		async sendBulkAction(isAdd: boolean): Promise<void> {
			const server = this.bulkServerObject
			if (!server || !this.bulkType) {
				this.bulkResult = null
				this.bulkError = "Выберите сервер и протокол"
				return
			}

			const data = {
				type: this.bulkType,
				proxyServerId: server.id,
			}

			this.bulkLoading = true
			this.bulkError = ""
			this.bulkResult = null

			try {
				const response = isAdd
					? await axios.post("/api/v1/add-proxy-to-all-users", data)
					: await axios.delete("/api/v1/delete-proxy-from-all-users", {
						data,
						headers: {"Content-Type": "application/json"},
					})

				this.bulkResult = response.data
				this.store.fetchData()
			} catch (error) {
				console.error("Не удалось выполнить массовое действие", error)
				this.bulkError = error?.response?.data?.message
					|| error?.message
					|| "Не удалось выполнить массовое действие"
			} finally {
				this.bulkLoading = false
			}
		},
	},

	computed: {
        availableProtocolTypes(): ProxyTypeValue[] {
            const server = this.store.servers.find(it => String(it.id) === this.protocolServer)
            if (!server) return []
            const existing = new Set((server.proxies ?? []).map(it => it.type?.name))
            if (existing.has("TROJAN2")) existing.add("TROJAN")
            return this.protocolTypes.filter(it => !existing.has(it.name))
        },
		bulkServerObject() {
			return this.store.servers.find(it => it.name === this.bulkServer) ?? null
		},

		bulkTypeOptions(): string[] {
			const proxies = Array.isArray(this.bulkServerObject?.proxies)
				? this.bulkServerObject.proxies
				: []

			return [...new Set(
				proxies
					.map(proxy => proxy?.type?.name)
					.filter((name): name is string => typeof name === "string" && name !== ""),
			)]
		},
	},

	watch: {
        isServerEditorOpened(open: boolean) { if (!open) this.editServerPassword = "" },
        isNewServerDialogOpened() { this.serverFormError = "" },
        isNewProtocolDialogOpened() { this.protocolFormError = "" },
        protocolServer() { this.protocolType = ""; this.protocolFormError = "" },
		bulkServer() {
			// Protocols differ per server: drop a selection the new server does not have.
			if (!this.bulkTypeOptions.includes(this.bulkType)) {
				this.bulkType = ""
			}
			this.bulkResult = null
			this.bulkError = ""
		},
	},

	setup() {
		return {store: useStore()}
	},
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
	z-index: 1;
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

.bulk-delete-btn {
	color: white;
	background-color: #c62828;
	width: 100%;
	border-radius: 8px;
	margin-top: 12px;
}

.bulk-cancel-btn {
	width: 100%;
	border-radius: 8px;
	margin-top: 8px;
}

.bulk-confirm-text {
	font-size: 16px;
	color: #555;
}

.bulk-error {
	font-size: 14px;
	color: #c62828;
}

.bulk-result {
	font-size: 14px;
	color: #555;
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.toggle-button.active {
	color: #fff;
	background: #333;
	border-radius: 8px;
}

.server-manager-card {
	position: relative;
	padding: 24px;
	border-radius: 8px;
	width: min(620px, 90vw);
	max-height: 80vh;
	overflow-y: auto;
}

.server-manager-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.server-manager-item {
	border: 1px solid #e5e5e5;
	border-radius: 10px;
	padding: 14px;
}

.server-manager-header,
.protocol-manager-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.server-manager-name {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.server-manager-name span,
.protocol-empty,
.manager-empty {
	color: #8a8a8a;
	font-size: 13px;
}

.protocol-manager-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-top: 12px;
	padding-top: 10px;
	border-top: 1px solid #efefef;
}

.protocol-manager-item {
	min-height: 36px;
}

.protocol-manager-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.protocol-empty {
	margin-top: 10px;
}

.manager-empty {
	padding: 28px 0;
	text-align: center;
}
</style>
