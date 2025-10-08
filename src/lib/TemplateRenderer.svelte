<script lang="ts" generics="T extends Values">
	import { parseTemplate, type ParseResultLine, type Schema, type Values, type ReplacerValues } from './parser.js'
	import type { Snippet } from 'svelte'


	let {
		template,
		schema,
		values,
		errorSnippet = defaultErrorReplacer,
		textSnippet = defaultTextReplacer,
	}: {
		template: string
		schema: Schema<T>
		values: T
		errorSnippet?: Snippet<[string]>
		textSnippet?: Snippet<[string]>
	} = $props()

	let parsedTemplate = $derived(parseTemplate(template))

</script>

{#snippet defaultErrorReplacer(message: string)}
	<span style="color:red" class="token notfound"> parse error: {message ?? 'no message'} </span>
{/snippet}
{#snippet defaultTextReplacer(text: string | undefined)}
	{text ?? ''}
{/snippet}

{#snippet singleLine(line: ParseResultLine, lineIndex: number)}
		{#each line as item, itemIndex}
			{#if item.isToken}
				{#if schema[item.content]}
					{@const token = schema[item.content]}
					{@const value = values ? values[item.content] : undefined}
					{#if token?.snippet}
						{@render token.snippet(item.content, item.argument, values)}
					{:else}
						<!-- if there is no replacer, just add the content of the text value -->
						{#if values && typeof value === 'string'}
							{@render textSnippet(value)}
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
{/snippet}

{#each parsedTemplate as line, lineIndex}
<p>
	{@render singleLine(line, lineIndex)}
	</p>
{/each}
