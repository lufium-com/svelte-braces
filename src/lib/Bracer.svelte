<script module lang="ts">
	export {defaultErrorReplacer, defaultTextReplacer};

</script>

<script lang="ts">
	import { parseTemplate } from './parser.js'
	import type { Snippet } from 'svelte'

	type ReplacerValueProp = string | undefined | Date | number | null
	export type ReplacerParameters = ['tag', 'argument', 'value']

	export type Replacer = {
		tag: string
		snippet?: Snippet<[string, string | undefined, Record<string, any>]>
		values: Record<string, any>
	}


	let {
		template,
		replacers,
		errorSnippet = defaultErrorReplacer,
		textSnippet = defaultTextReplacer
	}: {
		template: string
		replacers: Replacer[]
		errorSnippet?: Snippet<[string]>
		textSnippet?: Snippet<[string]>
	} = $props()

	let replacerMap: Map<string, Replacer> = $derived.by(() => {
		const map: Map<string, Replacer> = new Map()
		if (replacers) {
			replacers.forEach((r) => {
				map.set(r.tag, r)
			})
		}
		return map
	})
	let parsedTemplate = $derived(parseTemplate(template))
	//console.log(' parsedTemplate ', parsedTemplate)
</script>

{#snippet defaultErrorReplacer(message: string)}
	<span style="color:red" class="tag notfound"> parse error: {message ?? 'no message'} </span>
{/snippet}
{#snippet defaultTextReplacer(text: string | undefined)}
	{text ?? ''}
{/snippet}
{#each parsedTemplate as line}
	<p>
		{#each line as item}
			{#if item.isTag}
				{#if replacerMap.has(item.content)}
					{@const replacer = replacerMap.get(item.content)}
					{#if replacer?.snippet}
						{@render replacer.snippet(item.content, item.argument, replacer.values)}
					{:else}
						<!-- if there is no replacer, just add the content of the text value -->
						{#if replacer?.values?.text}
							{@render textSnippet(replacer?.values?.text)}
						{:else}
							{@render errorSnippet('no text prop given and no replacer.')}
						{/if}
					{/if}
				{:else if errorSnippet}
					{@render errorSnippet(item.content + ' not found')}
				{:else}
					Error replacer component not found. Should never happen.
				{/if}
			{:else}
				{@render textSnippet(item.content)}
			{/if}
		{/each}
	</p>
{/each}
