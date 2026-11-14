<template>
	<ControlLayout v-if="isControlEndpoint"/>
	<div v-else class="root">
		<MainLayout/>
	</div>
</template>

<script lang="ts">
import ControlLayout from "./layouts/ControlLayout.vue"
import MainLayout from "./layouts/MainLayout.vue"
import UserView from "./components/main-window/UserView.vue"

/**
 * One bundle serves two sites. control.ultunnel.ru shows the split-routing UI that
 * a subscriber opens with their secret key; every other host shows the admin panel.
 * The /control path does the same thing, so the control UI can be opened on the
 * admin host while testing.
 */
function detectControlEndpoint(): boolean {
	const host = window.location.hostname.toLowerCase()
	return host === "control.ultunnel.ru" ||
		host.startsWith("control.") ||
		window.location.pathname.replace(/\/+$/, "") === "/control"
}

export default {

	name: 'App',

	components: {
		ControlLayout,
		UserView,
		MainLayout
	},

	data: () => ({
		isControlEndpoint: detectControlEndpoint(),
	})

}
</script>


<style scoped>
.root {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 40px;
}
</style>
