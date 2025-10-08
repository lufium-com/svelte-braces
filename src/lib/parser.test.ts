import { describe, expect, test } from 'vitest'
import { parseTemplate, templateToString, type Schema, type Values } from './parser.js'

describe('template', () => {
	test('parse', () => {
		// Example usage:
		const template = `Hello {name John Doe}, welcome to {place the world}!
This is line 2 with {tag1 arg1} and {tag2 arg2 with spaces}.`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[
				{ isToken: false, content: 'Hello ' },
				{ isToken: true, content: 'name', argument: 'John Doe' },
				{ isToken: false, content: ', welcome to ' },
				{ isToken: true, content: 'place', argument: 'the world' },
				{ isToken: false, content: '!' }
			],
			[
				{ isToken: false, content: 'This is line 2 with ' },
				{ isToken: true, content: 'tag1', argument: 'arg1' },
				{ isToken: false, content: ' and ' },
				{ isToken: true, content: 'tag2', argument: 'arg2 with spaces' },
				{ isToken: false, content: '.' }
			]
		])
	})
	test('parse no tokens', () => {
		const template = `Hello world!
This is line 2.`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[{ isToken: false, content: 'Hello world!' }],
			[{ isToken: false, content: 'This is line 2.' }]
		])
	})
	test('parse only tokens', () => {
		const template = `{token1 arg1}
{token2 arg2 with spaces}`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[{ isToken: true, content: 'token1', argument: 'arg1' }],
			[{ isToken: true, content: 'token2', argument: 'arg2 with spaces' }]
		])
	})
	test('parse adjacent tokens', () => {
		const template = `Hello {token1 arg1}{token2 arg2} world!`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[
				{ isToken: false, content: 'Hello ' },
				{ isToken: true, content: 'token1', argument: 'arg1' },
				{ isToken: true, content: 'token2', argument: 'arg2' },
				{ isToken: false, content: ' world!' }
			]
		])
	})
	test('parse unclosed token', () => {
		const template = `Hello {token1 arg1 world!`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[{ isToken: false, content: 'Hello {token1 arg1 world!' }]
		])
	})

		test('parse empty token', () => {
		const template = `Hello {} world!`
		const result = parseTemplate(template)
		expect(result).toEqual([
			[
				{ isToken: false, content: 'Hello ' },
				{ isToken: true, content: '' },
				{ isToken: false, content: ' world!' }
			]
		])
	})
	test('interpolate to string', () => {
				const template = `Hello {name John Doe}, welcome to {place the world}!
This is line 2 with {tag1 arg1} and {tag2 arg2 with spaces}.`

const schema: Schema<typeof values> = {
			name: {  },
			place: {  },
			tag1: {  },
			tag2: {  }
		}
const values: Values = {
			name: 'Alice' ,
			place: 'Wonderland',
			tag1: 'TagOne',
			tag2: 'TagTwo' }
		
		const interpolated = templateToString<Values>(template, schema, values)
		expect(interpolated).toBe('Hello Alice, welcome to Wonderland!\nThis is line 2 with TagOne and TagTwo.')
	})
})
