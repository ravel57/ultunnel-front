/** Models of the control.ultunnel.ru API (split routing). */

export type RoutingMode = "PROXY" | "DIRECT" | "BLOCK"

export type DomainMatchType = "DOMAIN" | "SUFFIX" | "KEYWORD"

/** Where the mode a domain ends up with came from. */
export type RuleSource = "OWN" | "SHARED" | "DEFAULT"

export interface ControlSettings {
	defaultMode: RoutingMode
	collectEnabled: boolean
	rulesVersion: number
	rulesUpdatedAt: string
	lastReportAt: string | null
}

export interface VisitedDomain {
	domain: string
	addresses: string[]
	hits: number
	firstSeen: string
	lastSeen: string
	deviceId: string | null
	/** What happens to this domain right now: own rule, shared pool or default. */
	mode: RoutingMode
	ruleSource: RuleSource
	/** True when the user has a rule of their own for this domain. */
	hasRule: boolean
	ruleId: number | null
	rulePattern: string | null
	ruleMatchType: DomainMatchType | null
}

export interface VisitedDomainPage {
	total: number
	offset: number
	limit: number
	items: VisitedDomain[]
}

export interface SplitRoutingRule {
	id: number
	pattern: string
	matchType: DomainMatchType
	mode: RoutingMode
	enabled: boolean
	comment: string | null
	createdAt: string
	updatedAt: string
}

export interface RulesResponse {
	rulesVersion: number
	defaultMode: RoutingMode
	rules: SplitRoutingRule[]
}

export interface TopDomain {
	domain: string
	hits: number
	mode: RoutingMode
}

export interface ControlStats {
	domains: number
	rules: number
	proxyRules: number
	directRules: number
	blockRules: number
	disabledRules: number
	domainsLast24h: number
	topDomains: TopDomain[]
	lastReportAt: string | null
	rulesVersion: number
}

export interface ControlMe {
	userName: string | null
	isEnabled: boolean
	settings: ControlSettings
	stats: ControlStats
}

export interface SingBoxRouting {
	rulesVersion: number
	final: string
	rules: Record<string, unknown>[]
}

export const MODE_LABELS: Record<RoutingMode, string> = {
	PROXY: "через VPN",
	DIRECT: "мимо VPN",
	BLOCK: "блокировать",
}

export const MATCH_TYPE_LABELS: Record<DomainMatchType, string> = {
	DOMAIN: "точный хост",
	SUFFIX: "домен и поддомены",
	KEYWORD: "вхождение",
}
