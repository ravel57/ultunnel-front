<template>
	<div class="segmented" :class="{ compact }">
		<button
			v-for="option in options"
			:key="String(option.value)"
			class="seg"
			:class="[{ active: modelValue === option.value }, option.tone ? `tone-${option.tone}` : '']"
			type="button"
			:disabled="disabled"
			@click="$emit('update:modelValue', option.value)"
		>
			{{ option.label }}
		</button>
	</div>
</template>

<script lang="ts">
import type {PropType} from "vue"

export interface SegmentedOption {
	value: string | null
	label: string
	/** Colours the active segment: proxy / direct / block. */
	tone?: string
}

export default {
	name: "SegmentedControl",
	props: {
		modelValue: {type: [String, Object] as PropType<string | null>, default: null},
		options: {type: Array as PropType<SegmentedOption[]>, required: true},
		compact: {type: Boolean, default: false},
		disabled: {type: Boolean, default: false},
	},
	emits: ["update:modelValue"],
}
</script>

<style scoped>
.segmented {
	display: flex;
	gap: 6px;
	padding: 6px;
	border-radius: 14px;
	background: rgba(20, 18, 40, 0.04);
	border: 1px solid rgba(20, 18, 40, 0.08);
	min-width: fit-content;
}

.segmented.compact {
	padding: 4px;
	gap: 4px;
	border-radius: 12px;
}

.seg {
	border: 0;
	background: transparent;
	padding: 8px 10px;
	border-radius: 12px;
	cursor: pointer;
	font-weight: 900;
	font-size: 13px;
	color: rgba(27, 22, 48, 0.70);
	transition: background .15s ease, color .15s ease;
	text-wrap: nowrap;
	white-space: nowrap;
	width: 100%;
}

.compact .seg {
	padding: 6px 9px;
	font-size: 12px;
	border-radius: 10px;
}

.seg:hover:not(:disabled) {
	background: rgba(90, 66, 255, 0.08);
}

.seg:disabled {
	opacity: .5;
	cursor: not-allowed;
}

.seg.active {
	background: #fff;
	color: #1b1630;
	border: 1px solid rgba(20, 18, 40, 0.08);
	box-shadow: 0 10px 18px rgba(20, 18, 40, 0.08);
}

.seg.active.tone-proxy {
	background: rgba(90, 66, 255, 0.14);
	border-color: rgba(90, 66, 255, 0.35);
	color: #342b78;
}

.seg.active.tone-direct {
	background: rgba(29, 160, 88, 0.14);
	border-color: rgba(29, 160, 88, 0.35);
	color: #157541;
}

.seg.active.tone-block {
	background: rgba(214, 40, 70, 0.12);
	border-color: rgba(214, 40, 70, 0.32);
	color: #a01a34;
}
</style>
