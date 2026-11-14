import axios, {AxiosInstance} from "axios"
import type {
	ControlMe,
	ControlSettings,
	ControlStats,
	DomainMatchType,
	RoutingMode,
	RulesResponse,
	SingBoxRouting,
	VisitedDomainPage,
} from "../models/control"

const STORAGE_KEY = "ultunnel.control.secretKey"

/**
 * control.ultunnel.ru has no session: every call carries the secret key the admin
 * panel generated for the user. It is kept in localStorage and sent as a header —
 * never as a query parameter, which would leak it into proxy and browser history.
 */
export const CONTROL_BASE_URL = "/control/api/v1"

/**
 * localStorage throws outright in a private window and when site data is blocked,
 * and this module is evaluated while the bundle loads — an exception here takes
 * the whole app down, not just the control page. Hence the catch.
 */
function readStoredKey(): string {
	try {
		return window.localStorage.getItem(STORAGE_KEY) ?? ""
	} catch {
		return ""
	}
}

let secretKey: string = readStoredKey()

export function getSecretKey(): string {
	return secretKey
}

export function setSecretKey(key: string): void {
	secretKey = key.trim()
	try {
		if (secretKey) {
			window.localStorage.setItem(STORAGE_KEY, secretKey)
		} else {
			window.localStorage.removeItem(STORAGE_KEY)
		}
	} catch {
		// nothing to do: the key stays in memory for this tab
	}
}

export const controlHttp: AxiosInstance = axios.create({baseURL: CONTROL_BASE_URL})

controlHttp.interceptors.request.use(config => {
	if (secretKey) {
		config.headers.set("X-Secret-Key", secretKey)
	}
	return config
})

/** Turns an axios failure into something worth showing a user. */
export function controlErrorMessage(error: any, fallback: string): string {
	const status = error?.response?.status
	if (status === 401) {
		return "Ключ не подошёл. Проверьте secret key из личного кабинета."
	}
	if (status === 403) {
		return "Подписка отключена — обратитесь к администратору."
	}
	const detail = String(error?.response?.data?.message ?? "").trim()
	return detail ? `${fallback} ${detail}` : fallback
}

export async function fetchMe(): Promise<ControlMe> {
	const {data} = await controlHttp.get<ControlMe>("/me")
	return data
}

export async function fetchStats(): Promise<ControlStats> {
	const {data} = await controlHttp.get<ControlStats>("/stats")
	return data
}

export async function fetchVisits(params: {
	find?: string
	mode?: RoutingMode | "all"
	ruled?: boolean
	limit?: number
	offset?: number
}): Promise<VisitedDomainPage> {
	const {data} = await controlHttp.get<VisitedDomainPage>("/visits", {
		params: {
			find: params.find || undefined,
			mode: params.mode && params.mode !== "all" ? params.mode : undefined,
			ruled: params.ruled,
			limit: params.limit ?? 200,
			offset: params.offset ?? 0,
		},
	})
	return data
}

export async function forgetDomains(domains: string[]): Promise<number> {
	const {data} = await controlHttp.delete<{ deleted: number }>("/visits", {data: {domains}})
	return data.deleted
}

export async function forgetAllDomains(): Promise<number> {
	const {data} = await controlHttp.delete<{ deleted: number }>("/visits", {data: {all: true}})
	return data.deleted
}

export async function fetchRules(): Promise<RulesResponse> {
	const {data} = await controlHttp.get<RulesResponse>("/rules")
	return data
}

/** `mode: null` drops the rule, putting the patterns back under the default mode. */
export async function upsertRules(payload: {
	patterns: string[]
	mode: RoutingMode | null
	matchType?: DomainMatchType
	enabled?: boolean
	comment?: string | null
}): Promise<void> {
	await controlHttp.post("/rules", {
		patterns: payload.patterns,
		mode: payload.mode,
		matchType: payload.matchType ?? "SUFFIX",
		enabled: payload.enabled ?? true,
		comment: payload.comment ?? null,
	})
}

export async function deleteRules(ids: number[]): Promise<void> {
	await controlHttp.delete("/rules", {data: {ids}})
}

export async function updateSettings(payload: {
	defaultMode?: RoutingMode
	collectEnabled?: boolean
}): Promise<ControlSettings> {
	const {data} = await controlHttp.post<ControlSettings>("/settings", payload)
	return data
}

export async function fetchSingBoxRouting(): Promise<SingBoxRouting> {
	const {data} = await controlHttp.get<SingBoxRouting>("/routing/singbox")
	return data
}

export async function fetchPlainRouting(): Promise<string> {
	const {data} = await controlHttp.get<string>("/routing/plain", {responseType: "text"})
	return data
}
