import { templateToString } from '$lib/parser.js'
import type { Actions } from '@sveltejs/kit'

//import schema from './Schema.svelte'

import Sample, { schema, type MyValues } from './Sample.svelte'
import { render } from 'svelte/server'

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData()
		const template = formData.get('template') as string
		const values = JSON.parse(formData.get('values') as string) as MyValues
    // Convert date string to Date object
    values.date = new Date(values.date)
		const text = templateToString(template as string, schema, values)
		const renderResult = render(Sample, { props: { template, values } })
		const html = `<html><head>${renderResult.head}</head><body>${renderResult.body}</body></html>`
		return { text, html, success: true }
	}
}
