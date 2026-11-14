<template>
	<section class="card">
		<div class="controls">
			<div class="field grow">
				<label class="label" for="domains-filter">Фильтр по домену</label>
				<input
					id="domains-filter"
					v-model="filterStr"
					class="input"
					type="text"
					placeholder="Например: youtube.com"
					@keydown.enter.prevent="reload"
				/>
			</div>

			<div class="field">
				<span class="label">Режим</span>
				<SegmentedControl v-model="modeFilter" :options="filterOptions" compact/>
			</div>

			<button class="btn primary" type="button" :disabled="loading" @click="reload">
				{{ loading ? 'Ищем…' : 'Найти' }}
			</button>
		</div>

		<div v-if="selected.size > 0" class="bulk">
			<span class="bulk-text">Выбрано: {{ selected.size }}</span>
			<SegmentedControl
				:model-value="null"
				:options="bulkOptions"
				:disabled="applying"
				compact
				@update:modelValue="applyToSelection"
			/>
			<button class="link" type="button" @click="selected.clear()">Снять выделение</button>
		</div>

		<AppAlert :message="error"/>

		<div class="list">
			<div v-for="domain in domains" :key="domain.domain" class="row">
				<label class="pick">
					<input
						type="checkbox"
						:checked="selected.has(domain.domain)"
						@change="toggleSelected(domain.domain)"
					/>
				</label>

				<div class="row-main">
					<div class="dns">{{ domain.domain }}</div>
					<div class="meta">
						<span class="meta-item">{{ domain.hits }} обращ.</span>
						<span class="meta-item">{{ formatDate(domain.lastSeen) }}</span>
						<span v-if="domain.deviceId" class="meta-item">{{ domain.deviceId }}</span>
						<span v-if="domain.ruleSource === 'SHARED'" class="meta-item shared">
							из общего списка
						</span>
					</div>
					<div v-if="domain.addresses.length" class="chips">
						<span
							v-for="(address, idx) in domain.addresses"
							:key="`${domain.domain}-${address}-${idx}`"
							class="chip"
							:title="address"
						>
							{{ address }}
						</span>
					</div>
				</div>

				<div class="row-actions">
					<SegmentedControl
						:model-value="domain.hasRule ? domain.mode : null"
						:options="rowOptions"
						:disabled="applying"
						compact
						@update:modelValue="mode => applyMode([domain], mode)"
					/>
				</div>
			</div>

			<div v-if="!loading && domains.length === 0" class="empty">
				{{ filterStr || modeFilter !== 'all' ? 'По фильтру ничего не нашлось' : 'Пока ничего не прислано клиентским приложением' }}
			</div>

			<div v-if="hasMore" class="more">
				<button class="btn ghost" type="button" :disabled="loading" @click="loadMore">
					Показать ещё
				</button>
			</div>
		</div>
	</section>
</template>

<script lang="ts">
import AppAlert from "./AppAlert.vue"
import SegmentedControl from "./SegmentedControl.vue"
import {controlErrorMessage, fetchVisits, upsertRules} from "../../api/controlApi"
import type {DomainMatchType, RoutingMode, VisitedDomain} from "../../models/control"
import {useControlStore} from "../../store/control"

const PAGE_SIZE = 100

/** Pause after the last keystroke before the list is re-read. */
const SEARCH_DEBOUNCE_MS = 400

/**
 * The rule a domain row is edited through. A domain that already has a rule of its own keeps
 * that rule's pattern and match type (that is the only way to update or drop it). Otherwise
 * a new rule matches exactly this host — an own rule always beats the shared pool.
 * Returns null when there is nothing to do: resetting a domain that has no rule of its own.
 */
function ruleTarget(domain: VisitedDomain, mode: RoutingMode | null): { pattern: string, matchType: DomainMatchType } | null {
	if (domain.hasRule && domain.rulePattern && domain.ruleMatchType) {
		return {pattern: domain.rulePattern, matchType: domain.ruleMatchType}
	}
	return mode === null ? null : {pattern: domain.domain, matchType: "DOMAIN"}
}

export default {
	name: "VisitedDomainsTab",
	components: {AppAlert, SegmentedControl},

	setup() {
		return {store: useControlStore()}
	},

	data() {
		return {
			domains: [] as VisitedDomain[],
			total: 0,
			filterStr: "",
			loading: false,
			applying: false,
			error: "",
			selected: new Set<string>(),
			modeFilter: "all",
			searchTimer: undefined as ReturnType<typeof setTimeout> | undefined,

			// "по умолч." = domains without a rule of their own; the rest are domains with
			// a rule of the given mode.
			filterOptions: [
				{value: "all", label: "все"},
				{value: "auto", label: "по умолч."},
				{value: "PROXY", label: "VPN", tone: "proxy"},
				{value: "DIRECT", label: "мимо", tone: "direct"},
				{value: "BLOCK", label: "блок", tone: "block"},
			],

			// null means "drop the rule", which puts the domain back under the default.
			rowOptions: [
				{value: null, label: "по умолч."},
				{value: "PROXY", label: "VPN", tone: "proxy"},
				{value: "DIRECT", label: "мимо", tone: "direct"},
				{value: "BLOCK", label: "блок", tone: "block"},
			],
			bulkOptions: [
				{value: "PROXY", label: "через VPN", tone: "proxy"},
				{value: "DIRECT", label: "мимо VPN", tone: "direct"},
				{value: "BLOCK", label: "блок", tone: "block"},
				{value: null, label: "сбросить"},
			],
		}
	},

	computed: {
		hasMore(): boolean {
			return this.domains.length < this.total
		},
	},

	watch: {
		// Typing searches by itself once the user pauses, like the mobile screen.
		filterStr() {
			clearTimeout(this.searchTimer)
			this.searchTimer = setTimeout(() => this.reload(), SEARCH_DEBOUNCE_MS)
		},

		modeFilter() {
			this.reload()
		},
	},

	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},

	methods: {
		formatDate(value: string): string {
			const date = new Date(value)
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("ru-RU")
		},

		toggleSelected(domain: string) {
			if (this.selected.has(domain)) {
				this.selected.delete(domain)
			} else {
				this.selected.add(domain)
			}
		},

		async reload() {
			clearTimeout(this.searchTimer)
			this.selected.clear()
			await this.load(0)
		},

		async loadMore() {
			await this.load(this.domains.length)
		},

		async load(offset: number) {
			this.loading = true
			this.error = ""
			try {
				const page = await fetchVisits({
					find: this.filterStr.trim(),
					...this.filterParams(),
					limit: PAGE_SIZE,
					offset,
				})
				this.total = page.total
				this.domains = offset === 0 ? page.items : [...this.domains, ...page.items]
			} catch (error) {
				this.error = controlErrorMessage(error, "Не удалось получить список доменов.")
			} finally {
				this.loading = false
			}
		},

		/** Maps the segmented filter onto the `mode` / `ruled` query parameters of GET /visits. */
		filterParams(): { mode?: RoutingMode, ruled?: boolean } {
			switch (this.modeFilter) {
				case "auto":
					return {ruled: false}
				case "PROXY":
				case "DIRECT":
				case "BLOCK":
					return {mode: this.modeFilter, ruled: true}
				default:
					return {}
			}
		},

		async applyToSelection(mode: RoutingMode | null) {
			const chosen = this.domains.filter(domain => this.selected.has(domain.domain))
			await this.applyMode(chosen, mode)
			this.selected.clear()
		},

		async applyMode(domains: VisitedDomain[], mode: RoutingMode | null) {
			if (domains.length === 0 || this.applying) {
				return
			}

			// One request per distinct rule (pattern + match type), as a rule is identified by that pair.
			const groups = new Map<string, { pattern: string, matchType: DomainMatchType }[]>()
			for (const domain of domains) {
				const target = ruleTarget(domain, mode)
				if (!target) continue
				const key = target.matchType
				groups.set(key, [...(groups.get(key) ?? []), target])
			}
			if (groups.size === 0) {
				return
			}

			this.applying = true
			this.error = ""
			try {
				for (const [matchType, targets] of groups) {
					await upsertRules({
						patterns: [...new Set(targets.map(target => target.pattern))],
						mode,
						matchType: matchType as DomainMatchType,
					})
				}
				await this.store.refresh()
				// The effective mode of a domain can change through a rule on its parent,
				// so the whole page is re-read rather than patched in place.
				await this.load(0)
			} catch (error) {
				this.error = controlErrorMessage(error, "Не удалось изменить правило.")
			} finally {
				this.applying = false
			}
		},
	},

	async mounted() {
		await this.load(0)
	},
}
</script>

<style scoped>
.card {
	background: rgba(255, 255, 255, 0.78);
	border: 1px solid rgba(20, 18, 40, 0.10);
	border-radius: 18px;
	box-shadow: 0 18px 40px rgba(20, 18, 40, 0.10);
	overflow: hidden;
}

.controls {
	display: flex;
	align-items: flex-end;
	gap: 12px;
	padding: 18px;
	border-bottom: 1px solid rgba(20, 18, 40, 0.06);
	flex-wrap: wrap;
}

.field { display: flex; flex-direction: column; gap: 6px; min-width: fit-content; }
.field.grow { flex: 1; min-width: 240px; }
.label { font-size: 12px; font-weight: 800; opacity: 0.75; }

.input {
	height: 42px;
	border-radius: 12px;
	border: 1px solid rgba(20, 18, 40, 0.10);
	background: rgba(255, 255, 255, 0.85);
	padding: 0 12px;
	outline: none;
	transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}

.input:focus {
	border-color: rgba(90, 66, 255, 0.45);
	box-shadow: 0 0 0 4px rgba(90, 66, 255, 0.10);
	background: #fff;
}

.btn {
	height: 42px;
	border-radius: 12px;
	padding: 0 14px;
	font-weight: 900;
	border: 1px solid rgba(20, 18, 40, 0.10);
	background: rgba(255, 255, 255, 0.85);
	cursor: pointer;
	transition: transform .08s ease, box-shadow .15s ease, background .15s ease;
	white-space: nowrap;
}

.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.btn.primary {
	border-color: rgba(90, 66, 255, 0.35);
	background: linear-gradient(135deg, rgba(90, 66, 255, 0.92), rgba(107, 87, 255, 0.92));
	color: #fff;
	box-shadow: 0 12px 28px rgba(90, 66, 255, 0.25);
}

.btn.ghost { background: rgba(90, 66, 255, .08); color: #342b78; border-color: rgba(90, 66, 255, .25); }

.bulk {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 18px;
	background: rgba(90, 66, 255, 0.06);
	border-bottom: 1px solid rgba(20, 18, 40, 0.06);
	flex-wrap: wrap;
}

.bulk-text { font-size: 13px; font-weight: 900; }

.link {
	border: 0;
	background: transparent;
	color: #5a42ff;
	font-weight: 800;
	font-size: 13px;
	cursor: pointer;
}

.list { padding: 10px 10px 12px; }

.row {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 12px;
	margin: 10px 8px;
	border-radius: 16px;
	border: 1px solid rgba(20, 18, 40, 0.08);
	background: rgba(255, 255, 255, 0.86);
	box-shadow: 0 10px 22px rgba(20, 18, 40, 0.06);
}

.pick { display: flex; align-items: center; flex: 0 0 auto; }
.pick input { width: 18px; height: 18px; cursor: pointer; }

.row-main { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
.dns { font-weight: 900; letter-spacing: 0.1px; word-break: break-word; }

.meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; opacity: .65; font-weight: 700; }
.meta-item.shared { color: #3b2ee0; opacity: .9; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }

.chip {
	font-size: 12px;
	font-weight: 800;
	padding: 6px 10px;
	border-radius: 999px;
	border: 1px solid rgba(20, 18, 40, 0.08);
	background: rgba(20, 18, 40, 0.04);
	font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.empty {
	padding: 18px 18px 22px;
	text-align: center;
	opacity: 0.7;
	font-weight: 800;
}

.more { display: flex; justify-content: center; padding: 8px 0 12px; }

@media (max-width: 980px) {
	.controls { flex-direction: column; align-items: stretch; }
	.field { min-width: 0; }
	.row { flex-direction: column; align-items: stretch; }
	.row-actions { justify-content: space-between; }
}
</style>
