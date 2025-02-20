<template>
	<div class="user">
		<span class="title">{{ user.name }}</span>
		<div class="toggle-container" @click="toggle(user)">
			<div class="toggle-option" :class="{ active: !user.isEnabled }">Выкл</div>
			<div class="toggle-option" :class="{ active: user.isEnabled }">Вкл</div>
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
		<div @click="this.updatePaymentDate" class="user-info-section-next-payment-date">
			<img
					src="../../../public/svg/payment.svg"
					alt=""
					width="20px"
					height="20px"
			>
			<span class="user-info-text">{{ formatDate(user.nextPaymentDate) }}</span>
			<q-icon class="skip-to-next-year" name="skip_next" size="24px"/>
		</div>
		<div @click="this.copySecretKey(user)" class="user-info-section-secret-key">
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
				:user="this.user"
		/>
	</div>
</template>

<script lang="ts">
import ProxyServerView from "./ProxyServerView.vue";
import {ProxyServer} from "../../models/ProxyServer";
import {User} from "../../models/User";
import {PropType} from "vue";

export default {

	name: "UserView",

	components: {ProxyServerView},
	data: () => ({
		isOn: false,
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

		toggle(user: User) {
			user.isEnabled = !user.isEnabled
		},

		updatePaymentDate() {
			console.log("заглушка")
		},

		copySecretKey(user: User) {
			navigator.clipboard.writeText(user.secretKey)
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

.user-info-section:hover {
	.user-info-text {
		color: #303030;
	}

	.set-start-date {
		display: unset;
	}
}

.user-info-section-secret-key {
	display: flex;
	flex-direction: row;
	gap: 8px;
	cursor: pointer;
}

.user-info-section-secret-key:hover {
	.user-info-text {
		color: #303030;
	}

	.copy-secret-key-btn {
		display: unset;
	}
}

.user-info-section-next-payment-date {
	display: flex;
	flex-direction: row;
	gap: 8px;
	width: 200px;
	cursor: pointer;
}

.user-info-section-next-payment-date:hover {
	.user-info-text {
		color: #303030;
	}

	.skip-to-next-year {
		display: unset;
	}
}

.copy-secret-key-btn {
	display: none;
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

.user-info {
	height: 32px;
	gap: 16px;
	opacity: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
}

.toggle-container {
	display: flex;
	background: #f4f4f4;
	padding: 6px;
	border-radius: 12px;
	user-select: none;
	gap: 5px;
	height: fit-content;
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
</style>