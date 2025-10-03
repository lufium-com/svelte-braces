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

<h1>Bracer Demo</h1>
{#snippet localizedDate(tag: string, argument: string | undefined, values: Record<string, any>)}
	<span style="color:green" class="date"></span>{values?.date && values?.date instanceof Date
		? (argument ?? '' + ' ' + values.date.toLocaleDateString())
		: ''}
{/snippet}
{#snippet ExternalLink(tag: string, argument: string | undefined, values: Record<string, any>)}
	<a href={values?.url} target="_blank" rel="noopener noreferrer">{argument ?? values?.url}</a>
{/snippet}

<h2>Template Preview</h2>
<pre>{template}</pre>

<h2>Replacers</h2>
<pre>{JSON.stringify(replacers, null, 2)}</pre>

<h2>Result</h2>
<Bracer {template} {replacers} />

<h2>Custom Error Snippet</h2>
{#snippet errorSnippet(message: string)}
	<span style="color:orange"> custom parse error: {message} </span>
{/snippet}
<Bracer {template} {replacers} {errorSnippet} />

<h2>Custom Text Snippet</h2>
{#snippet textSnippet(text: string | undefined)}
	<span style="color:blue">{text}</span>
{/snippet}
<Bracer {template} {replacers} {textSnippet} />
