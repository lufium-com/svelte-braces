<script lang="ts">
	import { enhance } from '$app/forms'
	import TemplateRenderer from '$lib/TemplateRenderer.svelte'
	import { templateToString, type Schema, type Values } from '$lib/parser.js'
	import type { ActionData } from './$types.js'
	import Sample, { type MyValues, schema } from './Sample.svelte'

	let { form }: { form: ActionData } = $props()

	let values: MyValues = $state({
		name: 'Alice',
		date: new Date(),
		link: { url: 'https://svelte.dev' }
	})

	let template = $state(`Hello {name}, today is {date}. Here is a missing token: {missingTag}.
This is a new line and a token with an argument string: {date until}
And here is a link: {link click here})
`)

	const Template = TemplateRenderer<typeof values>

	let foo=$state('foo')
</script>

<h1>TemplateRenderer Demo {foo}</h1>
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

<h2>Template Preview</h2>
<textarea rows="10" cols="80" bind:value={template}></textarea>

<h2>Schema</h2>
<pre>
	{JSON.stringify(schema, (key, value) => (typeof value === 'function' ? 'function' : value), 2)}
</pre>
<h2>Values</h2>
<pre>
	{JSON.stringify(values, null, 2)}
</pre>

<h2>Result</h2>
<Sample {template} {values} />

<h2>Custom Error Snippet</h2>
{#snippet errorSnippet(message: string)}
	<span style="color:orange"> custom parse error: {message} </span>
{/snippet}
<Sample {template} {values} {errorSnippet} />

<h2>Custom Text Snippet</h2>
{#snippet textSnippet(text: string | undefined)}
	<span style="color:blue">{text}</span>
{/snippet}
<Sample {template} {values} {textSnippet} />

<h2>Raw text</h2>
<pre>{templateToString(template, schema, values)}</pre>

<h2>Numbered lines</h2>
<ol>
	<Sample {template} {values} />
</ol>

<h2>Interpolation to string</h2>
<pre>{templateToString<typeof values>(template, schema, values)}</pre>

<h2>Server side rendering</h2>

<form use:enhance={() => {
    return async ({ update }) => {
      update({ reset: false });
    }}} method="POST">
	<p>
		<label for="template">Template:</label><br />
		<textarea name="template" rows="10" cols="80" bind:value={template}></textarea>
	</p>
	<p>
		<label for="values">Values:</label><br />
		<textarea
			name="values"
			rows="10"
			cols="80"
			bind:value={() => JSON.stringify(values, null, 2), (value) => (values = JSON.parse(value))}
		></textarea>
	</p>
	<button type="submit">Render on server</button>
</form>
<h3>Result from server:</h3>
{#if form && form.success}
	<h4>HTML</h4>
	<pre>{form.html}</pre>
	<h4>Rendered in iframe</h4>
	<iframe
		title="Rendered Template"
		src={`data:text/html;charset=utf-8,${encodeURIComponent(form.html ?? '')}`}
	></iframe>
	<h4>Raw HTML</h4>
	<pre>{form.text}</pre>
{/if}
