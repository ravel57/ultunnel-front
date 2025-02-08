<template>
	<div class="main-layout-container">
		<HeaderRow/>
		<div class="users">
			<div
					v-for="user in this.store.users"
					:key="user.id"
			>
				<UserView :user="user" :servers="this.store.servers"/>
			</div>
		</div>
	</div>
</template>

<script>
import UserView from "../components/UserView.vue";
import {useStore} from "../store/index.ts";
import HeaderRow from "../components/HeaderRow.vue";

export default {
	name: "MainLayout",
	components: {UserView, HeaderRow},
	data: () => ({}),

	setup() {
		const store = useStore()
		store.fetchData()
		return {store}
	}
}
</script>

<style scoped>
.main-layout-container {
	width: 60%;
}
.users {
	justify-content: center;
	display: flex;
	align-content: normal;
	flex-direction: column;
	margin-top: 40px;
	gap: 40px;
}
</style>