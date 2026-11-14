<template>
	<div class="login-wrap">
		<section class="card">
			<div class="logo">U</div>
			<div class="title">Раздельная маршрутизация</div>
			<div class="desc">
				Введите secret key из личного кабинета ultunnel — тот же ключ, которым пользуется
				клиентское приложение. Пароля здесь нет: ключ и есть доступ.
			</div>

			<form class="form" @submit.prevent="submit">
				<label class="label" for="control-secret-key">Secret key</label>
				<input
					id="control-secret-key"
					v-model="key"
					class="input"
					type="password"
					autocomplete="off"
					spellcheck="false"
					placeholder="Вставьте ключ"
				/>
				<button class="btn primary" type="submit" :disabled="!key.trim() || store.checking">
					{{ store.checking ? 'Проверяем…' : 'Войти' }}
				</button>
			</form>

			<AppAlert :message="store.authError"/>
		</section>
	</div>
</template>

<script lang="ts">
import {useControlStore} from "../../store/control"
import AppAlert from "./AppAlert.vue"

export default {
	name: "ControlLogin",
	components: {AppAlert},

	setup() {
		return {store: useControlStore()}
	},

	data() {
		return {key: ""}
	},

	methods: {
		async submit() {
			await this.store.signIn(this.key)
		},
	},

	mounted() {
		this.key = this.store.secretKey
	},
}
</script>

<style scoped>
.login-wrap {
	min-height: 70vh;
	display: grid;
	place-items: center;
	padding: 24px;
}

.card {
	width: 100%;
	max-width: 440px;
	padding: 28px 24px 24px;
	background: rgba(255, 255, 255, 0.82);
	border: 1px solid rgba(20, 18, 40, 0.10);
	border-radius: 18px;
	box-shadow: 0 18px 40px rgba(20, 18, 40, 0.10);
}

.logo {
	width: 44px;
	height: 44px;
	border-radius: 14px;
	display: grid;
	place-items: center;
	font-weight: 800;
	color: #fff;
	background: linear-gradient(135deg, #5a42ff, #6b57ff);
	box-shadow: 0 8px 24px rgba(90, 66, 255, 0.25);
}

.title { margin-top: 16px; font-size: 20px; font-weight: 900; }
.desc { margin-top: 8px; font-size: 13px; line-height: 1.45; opacity: .7; }

.form { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
.label { font-size: 12px; font-weight: 800; opacity: .75; }

.input {
	height: 44px;
	border-radius: 12px;
	border: 1px solid rgba(20, 18, 40, 0.12);
	background: #fff;
	padding: 0 14px;
	outline: none;
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
	font-size: 13px;
}

.input:focus {
	border-color: rgba(90, 66, 255, 0.45);
	box-shadow: 0 0 0 4px rgba(90, 66, 255, 0.10);
}

.btn {
	margin-top: 6px;
	height: 44px;
	border-radius: 12px;
	border: 1px solid rgba(90, 66, 255, .35);
	font-weight: 900;
	cursor: pointer;
}

.btn.primary {
	background: linear-gradient(135deg, rgba(90, 66, 255, .92), rgba(107, 87, 255, .92));
	color: #fff;
	box-shadow: 0 12px 28px rgba(90, 66, 255, .25);
}

.btn:disabled { opacity: .5; cursor: not-allowed; }
</style>
