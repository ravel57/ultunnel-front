<template>
	<div class="control-app">
		<template v-if="store.authorized">
			<ControlTopbar @sign-out="store.signOut()"/>
			<main class="content">
				<VisitedDomainsTab/>
			</main>
		</template>

		<div v-else-if="booting" class="booting">Проверяем ключ…</div>

		<ControlLogin v-else/>
	</div>
</template>

<script lang="ts">
import ControlLogin from "../components/control/ControlLogin.vue"
import ControlTopbar from "../components/control/ControlTopbar.vue"
import VisitedDomainsTab from "../components/control/VisitedDomainsTab.vue"
import {useControlStore} from "../store/control"

export default {
	name: "ControlLayout",
	components: {ControlLogin, ControlTopbar, VisitedDomainsTab},

	setup() {
		return {store: useControlStore()}
	},

	data() {
		return {
			booting: true,
		}
	},

	methods: {
		/**
		 * A key may arrive in the URL — that is how the client application opens this
		 * page already authorized. It is consumed once and stripped straight away, so
		 * it does not stay in the address bar or in the browser history.
		 */
		consumeKeyFromUrl(): string | null {
			const url = new URL(window.location.href)
			const key = url.searchParams.get("key") ?? url.searchParams.get("secretKey")
			if (!key) {
				return null
			}
			url.searchParams.delete("key")
			url.searchParams.delete("secretKey")
			window.history.replaceState({}, "", url)
			return key.trim() || null
		},
	},

	async mounted() {
		const urlKey = this.consumeKeyFromUrl()
		if (urlKey || this.store.hasKey) {
			await this.store.signIn(urlKey ?? undefined)
		}
		this.booting = false
	},
}
</script>

<style scoped>
.control-app {
	min-height: 100vh;
	background: radial-gradient(1200px 600px at 20% -10%, rgba(90, 66, 255, 0.15), transparent 60%),
		radial-gradient(900px 500px at 90% 10%, rgba(107, 87, 255, 0.12), transparent 55%),
		#f6f4ff;
	color: #1b1630;
	font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif;
}

.content {
	max-width: 1100px;
	margin: 0 auto;
	padding: 18px 20px 28px;
}

.booting {
	min-height: 60vh;
	display: grid;
	place-items: center;
	font-weight: 800;
	opacity: .6;
}
</style>
