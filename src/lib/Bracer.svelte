<script module lang="ts">
	export { defaultErrorReplacer, defaultTextReplacer }
	function templateToString(template: string, replacers: Replacer[], delimiter = '\n') {
		const map = buildReplacerMap(replacers)
		return parseTemplate(template).map((lineItems, lineIndex)=>
		lineItems.map((item, itemIndex)=>{
			if (item.isTag) {
				const replacer = map.get(item.content)
				if (replacer) {
					if (replacer.transform) {
						return replacer.transform(replacer.values)
					} else if (replacer.values?.text) {
						return replacer.values.text
					} else {
						return ''
					}
				} else {
					// should not happen
					return item.content
				}
			} else {
				// we could also offer a text replacer here, but none for now
				return item.content
			}
		}).join('')).join(delimiter)	
	}

	function buildReplacerMap(replacers: Replacer[]): Map<string, Replacer> {
		// we don't use spread operator because apparently not all implementations support it
		const map: Map<string, Replacer> = new Map()
			replacers.forEach((r) => {
				map.set(r.tag, r)
			})
		return map
	}
</script>

<script lang="ts">
	import { parseTemplate, type ParseResultLine, type Replacer } from './parser.js'
	import type { Snippet } from 'svelte'


	let {
		template,
		replacers,
		errorSnippet = defaultErrorReplacer,
		textSnippet = defaultTextReplacer,
		lineSnippet = defaultLine
	}: {
		template: string
		replacers: Replacer[]
		errorSnippet?: Snippet<[string]>
		textSnippet?: Snippet<[string]>
		lineSnippet?: Snippet<[ParseResultLine, number]>
	} = $props()

	let replacerMap: Map<string, Replacer> = $derived(buildReplacerMap(replacers))
	let parsedTemplate = $derived(parseTemplate(template))

</script>

{#snippet defaultErrorReplacer(message: string)}
	<span style="color:red" class="tag notfound"> parse error: {message ?? 'no message'} </span>
{/snippet}
{#snippet defaultTextReplacer(text: string | undefined)}
	{text ?? ''}
{/snippet}

{#snippet defaultLine(line: ParseResultLine, lineIndex: number)}
	<p>
		{#each line as item, itemIndex}
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
{/snippet}

{#each parsedTemplate as line, lineIndex}
	{@render lineSnippet(line, lineIndex)}
{/each}
