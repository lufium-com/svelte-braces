# Svelte Brace

A lightweight Svelte component for handling tempolates at runtime with curly brace subsitutions in text content.

This is useful if you have user generated templates that you want to use, e.g., for e-mail sending or html rendering using Svelte components.

## Installation

```sh
npm install svelte-runtime-template
```

## Usage

```svelte
<script>
  import { TemplateRenderer } from 'svelte-runtime-template'
  const schema = {planet: {}}
  const template = 'hello {planet}!'
  const values = {planet: 'world'}
</script>

<TemplateRenderer {template} {schema} {values} />
```

The `TemplateRenderer` component allows you to render text content with curly brace expressions, similar to Svelte's native template syntax (however, no real javascript expressions within the curly braces, just tokens that get replaced by values). It's useful when you need to handle dynamic text content that includes curly brace expressions.

## API

### Props

- `template` (string) - Required. The text content containing curly brace expressions.
- `schema` (array of replacer definitions) - Requires. Defines the llowed tokens and their semantics.
- `errorSnippet` (Snippet) - Optional. A snippet `errorSnippet(message: string)` used to display parsing errors in the template.
- `textSnippet` (Snippet) - Optional. A snippet `textSnippet(text: string)` used to display text outside the placeholders and replacers without a custom snippet.

## Other functions

### templateToString

Interpolates a template  into a string. Useful to build a plain text representation of the template for the plain text part of an e-mail.

#### Parameters

- `template` (string): string template
- `schema`(Schema<T>): the schema defintion
- `values` (T): values with replacments for the template tokens
- `delimiter = '\n'`

#### Returns

- (string): The formatted string with variables replaced by their values

### validateTemplate

Interpolates a template  into a string. Useful to build a plain text representation of the template for the plain text part of an e-mail.

#### Parameters

- `template` (string): string template
- `schema`(Schema<T>): the schema defintion

#### Returns

- (ValidationError[]): Arry of validation errors in the template w.r.t. the schema

## Examples

```svelte
<script lang="ts">
  import { TemplateRenderer } from 'svelte-runtime-template'
  type MyValues = {
    name: string
    date: Date
    link: { url: string }
  }
  // snippets are not referenced here because we export the schema; normally, you would
  // define snippets directly here
  const schema: Schema<MyValues> = {
    name: {
      // no snippet, will use text property
    },
    date: {
      snippet: localizedDate,
      transform(value: MyValues) {
        return value.date instanceof Date ? value.date.toDateString() : 'invalid date'
      }
    },
    link: {
      snippet: ExternalLink,
      transform(value: MyValues) {
        return value.link.url
      }
    }
  }

const template = `Hello {name}, today is {date}. Here is a missing tag: {missingTag}.
This is a new line and a tag with an argument string: {date until}
And here is a link: {link click here}
`
</script>

<!-- Basic usage -->
<!-- Custom replacers -->
{#snippet localizedDate(tag: string, argument: string | undefined, values: Record<string, any>)}
  <span style="color:green" class="date"></span>{values?.date && values?.date instanceof Date
    ? (argument ?? '' + ' ' + values.date.toLocaleDateString())
    : ''}
{/snippet}
{#snippet ExternalLink(tag: string, argument: string | undefined, values: Record<string, any>)}
  <a href={values?.url} target="_blank" rel="noopener noreferrer">{argument ?? values?.url}</a>
{/snippet}
<TemplateRenderer {template} {schema} />

<!-- custom error snippet -->

{#snippet errorSnippet(message: string)}
  <span style="color:orange"> custom parse error: {message} </span>
{/snippet}
<TemplateRenderer {template} {replacers} {errorSnippet} />

<!-- custom text snippet -->

<h2>Custom Text Snippet</h2>
{#snippet textSnippet(text: string | undefined)}
  <span style="color:blue">{text}</span>
{/snippet}
<TemplateRenderer {template} {replacers} {textSnippet} />
<Bracer template="Count: {count}" />


```
