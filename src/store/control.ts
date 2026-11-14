import {defineStore} from "pinia"
import {controlErrorMessage, fetchMe, getSecretKey, setSecretKey} from "../api/controlApi"
import type {ControlMe, ControlSettings, ControlStats, RoutingMode} from "../models/control"

/**
 * Session state of the control UI. "Authorized" here means nothing more than
 * "the stored secret key was accepted by GET /me" — there is no cookie to keep.
 */
export const useControlStore = defineStore("control", {
	state: () => ({
		secretKey: getSecretKey(),
		authorized: false,
		checking: false,
		authError: "",
		userName: null as string | null,
		settings: null as ControlSettings | null,
		stats: null as ControlStats | null,
	}),

	getters: {
		defaultMode(state): RoutingMode {
			return state.settings?.defaultMode ?? "PROXY"
		},
		hasKey(state): boolean {
			return state.secretKey.trim().length > 0
		},
	},

	actions: {
		applyMe(me: ControlMe) {
			this.userName = me.userName
			this.settings = me.settings
			this.stats = me.stats
			this.authorized = true
			this.authError = ""
		},

		/** Verifies the key currently in [secretKey] and remembers it on success. */
		async signIn(key?: string): Promise<boolean> {
			const candidate = (key ?? this.secretKey).trim()
			if (!candidate) {
				this.authError = "Введите secret key."
				return false
			}

			this.checking = true
			setSecretKey(candidate)
			this.secretKey = candidate
			try {
				this.applyMe(await fetchMe())
				return true
			} catch (error) {
				this.authorized = false
				this.authError = controlErrorMessage(error, "Не удалось проверить ключ.")
				return false
			} finally {
				this.checking = false
			}
		},

		signOut() {
			setSecretKey("")
			this.secretKey = ""
			this.authorized = false
			this.userName = null
			this.settings = null
			this.stats = null
			this.authError = ""
		},

		async refresh(): Promise<void> {
			if (!this.authorized) {
				return
			}
			try {
				this.applyMe(await fetchMe())
			} catch (error) {
				this.authError = controlErrorMessage(error, "Не удалось обновить состояние.")
			}
		},
	},
})
