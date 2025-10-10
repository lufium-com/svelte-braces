// Reexport the component and other useful items
// the deafult export is so that you can write import ... from 'svelte-runtime-template'
export { default } from '$lib/TemplateRenderer.svelte'
export { default as TemplateRenderer } from '$lib/TemplateRenderer.svelte'
export {defaultErrorReplacer, defaultTextReplacer } from '$lib/TemplateRenderer.svelte'
export * from '$lib/parser.js'