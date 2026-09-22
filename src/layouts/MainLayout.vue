<template>
	<div class="main-layout-container">
		<HeaderRow/>
		<div class="users">
			<div
				v-for="user in filteredUsers"
				:id="`user-${user.id}`"
				:key="user.id"
			>
				<UserView :user="user" :servers="store.servers"/>
			</div>

			<div v-if="filteredUsers.length === 0" class="empty-search">
				<q-icon name="search_off" size="28px"/>
				<span>Ничего не найдено</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import UserView from "../components/main-window/UserView.vue";
import {useStore} from "../store/index";
import HeaderRow from "../components/main-window/HeaderRow.vue";
import {User} from "../models/User";

export default {
	name: "MainLayout",
	components: {UserView, HeaderRow},

	setup() {
		const store = useStore()
		store.fetchData()
		return {store}
	},

	computed: {
		filteredUsers(): User[] {
			const query = String(this.store.searchQuery ?? "").trim().toLowerCase()

			if (!query) {
				return this.store.users
			}

			return this.store.users.filter((user: User) => {
				const userValues = [
					user.name,
					user.secretKey,
					user.isEnabled ? "вкл enabled" : "выкл disabled",
				]

				const proxyValues = (user.proxiesConfigs ?? []).flatMap((proxy: any) => [
					proxy.url,
					proxy.server,
					proxy.type,
					proxy.tag,
					proxy.proxy?.type,
				])

				return [...userValues, ...proxyValues]
					.filter(value => value != null)
					.some(value => String(value).toLowerCase().includes(query))
			})
		},
	},
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

.empty-search {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 48px 0;
	color: #8a8a8a;
	font-size: 16px;
}
</style>
