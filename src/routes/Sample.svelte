<script lang="ts" module>
	export type MyValues = {
		name: string
		date: Date
		link: { url: string }
	}
  // snippets are not referenced here because we export the schema; normally, you would
  // define snippets directly here
	export const schema: Schema<MyValues> = {
		name: {
			// no snippet, will use text property
		},
		date: {
			transform(value: MyValues) {
				return value.date instanceof Date ? value.date.toDateString() : 'invalid date'
			}
		},
		link: {
			transform(value: MyValues) {
				return value.link.url
			}
		}
	}
</script>

<script lang="ts">
	import type { Schema } from '$lib/parser.js'
	import TemplateRenderer from '$lib/TemplateRenderer.svelte'
	import type { Snippet } from 'svelte'

	let {
		template,
		values,
		errorSnippet,
		textSnippet
	}: {
		template: string
		values: MyValues
		errorSnippet?: Snippet<[string]>
		textSnippet?: Snippet<[string]>
	} = $props()

	const MyTemplate = TemplateRenderer<typeof values>
</script>

{#snippet localizedDate(token: string, argument: string | undefined, values: MyValues)}
	<span style="color:green" class="date"></span>{values.date instanceof Date
		? (argument ?? '' + ' ' + values.date.toLocaleDateString())
		: ''}
{/snippet}
{#snippet ExternalLink(token: string, argument: string | undefined, values: MyValues)}
	<a href={values.link.url} target="_blank" rel="noopener noreferrer"
		>{argument ?? values.link.url}</a
	>
{/snippet}

<header>This is my sample template decoration.</header>

<MyTemplate
	schema={{
		...schema,
		date: { ...schema.date, snippet: localizedDate },
		link: { ...schema.link, snippet: ExternalLink }
	}}
	{values}
	{template}
	{errorSnippet}
	{textSnippet}
/>

<footer>My footer content.</footer>
