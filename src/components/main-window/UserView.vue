<template>
	<div class="user">
		<span class="title">{{ user.name }}</span>
		<div class="toggle-container" :class="{ loading: isToggling }">
			<div
				class="toggle-option"
				:class="{ active: !user.isEnabled }"
				@click="setEnabled(false)"
			>
				Выкл
			</div>
			<div
				class="toggle-option"
				:class="{ active: user.isEnabled }"
				@click="setEnabled(true)"
			>
				Вкл
			</div>
			<q-spinner v-if="isToggling" class="toggle-spinner" size="18px"/>
		</div>
	</div>
	<div class="user-info">
		<div class="user-info-section">
			<img
				src="../../../public/svg/calendar.svg"
				alt=""
				width="20px"
				height="20px"
			>
			<span class="user-info-text">{{ formatDate(user.createdDate) }}</span>
			<img
				src="../../../public/svg/edit.svg"
				alt=""
				width="16px"
				height="16px"
				class="set-start-date"
			>
		</div>
		<div @click="updatePaymentDate" class="user-info-section-next-payment-date">
			<img
				src="../../../public/svg/payment.svg"
				alt=""
				width="20px"
				height="20px"
			>
			<span class="user-info-text">{{ formatDate(user.nextPaymentDate) }}</span>
			<q-icon class="skip-to-next-year" name="skip_next" size="24px"/>
		</div>
		<div @click="copySecretKey(user)" class="user-info-section-secret-key">
			<img
				src="../../../public/svg/key.svg"
				alt=""
				width="20px"
				height="20px"
			>
			<span class="user-info-text">{{ user.secretKey }}</span>
			<q-icon class="copy-secret-key-btn" name="content_copy" size="20px"/>
		</div>
	</div>
	<div v-for="server in servers" :key="server.id">
		<ProxyServerView
			style="margin-top: 16px"
			:server="server"
			:user="user"
		/>
	</div>
</template>

<script lang="ts">
import ProxyServerView from "./ProxyServerView.vue";
import {ProxyServer} from "../../models/ProxyServer";
import {User} from "../../models/User";
import {PropType} from "vue";
import {setUserEnabled} from "../../api/adminApi";

export default {
	name: "UserView",

	components: {ProxyServerView},

	data: () => ({
		isToggling: false,
	}),

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
			const d = new Date(date)
			if (isNaN(d.getTime())) return ""
			const day = String(d.getDate()).padStart(2, "0")
			const month = String(d.getMonth() + 1).padStart(2, "0")
			const year = d.getFullYear()
			return `${day}.${month}.${year}`
		},

		async setEnabled(value: boolean): Promise<void> {
			if (this.isToggling || this.user.isEnabled === value) return

			const previousValue = this.user.isEnabled
			this.user.isEnabled = value
			this.isToggling = true

			try {
				await setUserEnabled(this.user.id, value)
			} catch (error) {
				this.user.isEnabled = previousValue
				console.error("Не удалось изменить состояние пользователя", error)
			} finally {
				this.isToggling = false
			}
		},

		updatePaymentDate() {
			console.log("заглушка")
		},

		async copySecretKey(user: User) {
			try {
				await navigator.clipboard.writeText(user.secretKey)
			} catch (error) {
				console.error("Не удалось скопировать секретный ключ", error)
			}
		},
	},
}
</script>

<style scoped>
.set-start-date {
	display: none;
}

.skip-to-next-year {
	display: none;
}

.user-info-text {
	font-size: 16px;
	color: #757575;
}

.user-info-section {
	cursor: pointer;
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 200px;
}

.user-info-section:hover .user-info-text {
	color: #303030;
}

.user-info-section:hover .set-start-date {
	display: unset;
}

.user-info-section-secret-key {
	display: flex;
	flex-direction: row;
	gap: 8px;
	cursor: pointer;
}

.user-info-section-secret-key:hover .user-info-text {
	color: #303030;
}

.user-info-section-secret-key:hover .copy-secret-key-btn {
	display: unset;
}

.user-info-section-next-payment-date {
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 200px;
	cursor: pointer;
}

.user-info-section-next-payment-date:hover .user-info-text {
	color: #303030;
}

.user-info-section-next-payment-date:hover .skip-to-next-year {
	display: unset;
}

.copy-secret-key-btn {
	display: none;
}

.user-info {
	height: 32px;
	gap: 16px;
	opacity: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.user {
	display: flex;
	justify-content: space-between;
}

.title {
	font-weight: 700;
	line-height: 63px;
	letter-spacing: 0;
	text-align: left;
	text-underline-position: from-font;
	text-decoration-skip-ink: none;
	font-size: 58px;
	user-select: none;
}

.toggle-container {
	display: flex;
	background: #f4f4f4;
	padding: 6px;
	border-radius: 12px;
	user-select: none;
	gap: 5px;
	height: fit-content;
	position: relative;
}

.toggle-container.loading .toggle-option {
	pointer-events: none;
	opacity: 0.55;
}

.toggle-option {
	cursor: pointer;
	flex: 1;
	text-align: center;
	padding: 8px 12px;
	font-size: 16px;
	color: #999;
	border-radius: 10px;
	transition: all 0.3s ease-in-out;
	height: fit-content;
}

.toggle-option.active {
	background: #222;
	color: #fff;
}

.toggle-spinner {
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}
</style>
