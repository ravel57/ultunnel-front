<template>
	<header class="topbar">
		<div class="brand">
			<div class="logo">U</div>
			<div class="titles">
				<div class="title">ultunnel</div>
				<div class="subtitle">Раздельная маршрутизация</div>
			</div>
		</div>

		<button class="link" type="button" @click="$emit('sign-out')">Выйти</button>
	</header>
</template>

<script lang="ts">
export default {
	name: "ControlTopbar",
	emits: ["sign-out"],
}
</script>

<style scoped>
.topbar {
	position: sticky;
	top: 0;
	z-index: 10;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 18px 20px;
	border-bottom: 1px solid rgba(20, 18, 40, 0.10);
	background: rgba(255, 255, 255, 0.70);
	backdrop-filter: blur(10px);
}

.brand {
	display: flex;
	align-items: center;
	gap: 12px;
}

.logo {
	width: 38px;
	height: 38px;
	border-radius: 12px;
	display: grid;
	place-items: center;
	font-weight: 800;
	color: white;
	background: linear-gradient(135deg, #5a42ff, #6b57ff);
	box-shadow: 0 8px 24px rgba(90, 66, 255, 0.25);
}

.titles .title {
	font-weight: 700;
	letter-spacing: 0.2px;
}

.titles .subtitle {
	font-size: 12px;
	opacity: 0.65;
	margin-top: 2px;
}

.link {
	border: 0;
	background: transparent;
	color: #5a42ff;
	font-weight: 800;
	font-size: 13px;
	cursor: pointer;
	padding: 8px 10px;
	border-radius: 8px;
}

.link:hover { background: rgba(90, 66, 255, 0.08); }
</style>
