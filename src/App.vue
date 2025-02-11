<template>
	<div class="root">
		<MainLayout/>
	</div>
</template>

<script lang="ts">
import UserView from "./components/main-window/UserView.vue";
import MainLayout from "./layouts/MainLayout.vue"

export default {

	name: 'App',

	components: {
		UserView,
		MainLayout
	},

	data: () => ({})

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