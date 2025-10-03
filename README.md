# Svelte Brace

A lightweight Svelte component for handling curly brace expressions in text content.

## Installation

```sh
npm install svelte-brace
```

## Usage

```svelte
<script>
	import { Bracer } from 'svelte-brace'

	let name = 'world'
</script>

<Bracer template="Hello {name}!" />
```

The `Bracer` component allows you to render text content with curly brace expressions, similar to Svelte's native template syntax. It's useful when you need to handle dynamic text content that includes curly brace expressions.

## API

### Props

- `template` (string) - Required. The text content containing curly brace expressions.
- `replacer` (array of replacer definitions) - Requires. context.
- `errorSnippet` (Snippet) - Optional. A snippet `errorSnippet(message: string)` used to display parsijng errors in the template.
- `textSnippet` (Snippet) - Optional. A snippet `textSnippet(text: string)` used to display text outside the placeholders and replacers without a custom snippet.

## Examples

```svelte
<script lang="ts">
	import Bracer from '$lib/Bracer.svelte'

	const replacers = [
		{
			tag: 'name',
			values: { text: 'Alice' }
		},
		{
			tag: 'date',
			values: { date: new Date() },
			snippet: localizedDate
		},
		{
			tag: 'link',
			values: { url: 'https://svelte.dev' },
			snippet: ExternalLink
		}
	]

	const template = `Hello {name}, today is {date}. Here is a missing tag: {missingTag}.
This is a new line and a tag with an argument string: {date until}
And here is a link: {link click here}
`
</script>

<!-- Basic usage -->

<Bracer {template} {replacers} />

<!-- custom error snippet -->

{#snippet errorSnippet(message: string)}
	<span style="color:orange"> custom parse error: {message} </span>
{/snippet}
<Bracer {template} {replacers} {errorSnippet} />

<!-- custom text snippet -->

<h2>Custom Text Snippet</h2>
{#snippet textSnippet(text: string | undefined)}
	<span style="color:blue">{text}</span>
{/snippet}
<Bracer {template} {replacers} {textSnippet} />
<Bracer template="Count: {count}" />

<!-- Custom replacers -->
{#snippet localizedDate(tag: string, argument: string | undefined, values: Record<string, any>)}
	<span style="color:green" class="date"></span>{values?.date && values?.date instanceof Date
		? (argument ?? '' + ' ' + values.date.toLocaleDateString())
		: ''}
{/snippet}
{#snippet ExternalLink(tag: string, argument: string | undefined, values: Record<string, any>)}
	<a href={values?.url} target="_blank" rel="noopener noreferrer">{argument ?? values?.url}</a>
{/snippet}
```
