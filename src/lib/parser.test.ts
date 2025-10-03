import { describe, expect, test } from 'vitest'
import { parseTemplate } from './parser.js'

describe('template', () => {
	test('general', () => {
		// Example usage:
		const template = `Hello {name John Doe}, welcome to {place the world}!
This is line 2 with {tag1 arg1} and {tag2 arg2 with spaces}.`
		const result = parseTemplate(template)
		expect(result).toEqual([
      [
			{ isTag: false, content: 'Hello ' },
			{ isTag: true, content: 'name', argument: 'John Doe' },
			{ isTag: false, content: ', welcome to ' },
			{ isTag: true, content: 'place', argument: 'the world' },
			{ isTag: false, content: '!' },
      ],
      [
			{ isTag: false, content: 'This is line 2 with ' },
			{ isTag: true, content: 'tag1', argument: 'arg1' },
			{ isTag: false, content: ' and ' },
			{ isTag: true, content: 'tag2', argument: 'arg2 with spaces' },
			{ isTag: false, content: '.' }
      ]
		])
	})
})
