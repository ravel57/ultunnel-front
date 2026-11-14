<template>
	<div v-if="message" class="alert" :class="{ ok: kind === 'ok' }" role="status">
		<div class="alert-title">{{ kind === 'ok' ? 'Готово' : 'Ошибка' }}</div>
		<div class="alert-text">{{ message }}</div>
	</div>
</template>

<script lang="ts">
export default {
	name: "AppAlert",
	props: {
		message: {type: String, default: ""},
		kind: {type: String, default: "error"},
	},
}
</script>

<style scoped>
.alert {
	margin: 14px 18px 0;
	border-radius: 14px;
	border: 1px solid rgba(255, 0, 80, 0.18);
	background: rgba(255, 0, 80, 0.06);
	padding: 12px;
}

.alert.ok {
	border-color: rgba(29, 160, 88, 0.22);
	background: rgba(29, 160, 88, 0.08);
}

.alert-title {
	font-weight: 900;
	margin-bottom: 4px;
}

.alert-text {
	font-size: 13px;
	opacity: 0.85;
	line-height: 1.35;
}
</style>
