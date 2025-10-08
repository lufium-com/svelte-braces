<script lang="ts">
	import TemplateRenderer from '$lib/TemplateRenderer.svelte'
	import { templateToString, type Schema, type Values,type ReplacerValues  } from '$lib/parser.js'

		const schema: Schema<typeof values> = {
			name: {
				// no snippet, will use text property
			},
			date: {
				snippet: localizedDate,
				transform(value: ReplacerValues) {
					return value instanceof Date ? value.toDateString() : ''
				},
				
			},
			link: {
				snippet: ExternalLink,
				transform(value: ReplacerValues) {
					return (value as {url?: string}).url ?? ''
				}
			}
		}
		const values = {
			name: 'Alice',
			date: new Date(),
			link: { url: 'https://svelte.dev' }
		}

	const template = `Hello {name}, today is {date}. Here is a missing tag: {missingTag}.
This is a new line and a tag with an argument string: {date until}
And here is a link: {link click here}
`

		const Template = TemplateRenderer<typeof values>
</script>

<h1>TemplateRenderer Demo</h1>
{#snippet localizedDate(tag: string, argument: string | undefined, values: ReplacerValues)}
	<span style="color:green" class="date"></span>{values instanceof Date
		? (argument ?? '' + ' ' + values.toLocaleDateString())
		: ''}
{/snippet}
{#snippet ExternalLink(tag: string, argument: string | undefined, values: ReplacerValues)}
	<a href={(values as {url?: string}).url} target="_blank" rel="noopener noreferrer">{argument ?? (values as {url?: string}).url}</a>
{/snippet}

<h2>Template Preview</h2>
<pre>{template}</pre>

<h2>Schema</h2>
<pre>{JSON.stringify(schema, null, 2)}</pre>
<h2>Values</h2>
<pre>{JSON.stringify(values, null, 2)}</pre>

<h2>Result</h2>
<TemplateRenderer {template} {schema} {values} />

<h2>Custom Error Snippet</h2>
{#snippet errorSnippet(message: string)}
	<span style="color:orange"> custom parse error: {message} </span>
{/snippet}
<Template {template} {schema} {values} {errorSnippet} />

<h2>Custom Text Snippet</h2>
{#snippet textSnippet(text: string | undefined)}
	<span style="color:blue">{text}</span>
{/snippet}
<Template {template} {schema} {values} {textSnippet} />

<h2>Raw text</h2>
<pre>{templateToString(template, schema, values)}</pre>

<h2>Numbered lines</h2>
<ol>
	<Template {template} {schema} {values} />
</ol>

<h2>Interpolation to string</h2>
<pre>{templateToString<typeof values>(template, schema, values)}</pre>