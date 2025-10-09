import type { Snippet } from 'svelte'

type ParseResultItem =
	| { type: 'token'; token: string; argument?: string; position: number }
	| { type: 'text'; value: string }
	| { type: 'error'; message: string; position: number }

export type ParseResultLine = ParseResultItem[]

export type Values = Record<string, unknown>

export type Schema<T extends Values> = Record<
	string,
	{
		snippet?: Snippet<[string, string | undefined, T]>
		transform?: (values: T) => string
	}
>
/**
 * Parses a template string containing special tokens enclosed in curly braces ({}).
 * Each token can have a name and an optional argument separated by whitespace.
 *
 * The template is processed line by line, and each line is split into segments of regular text
 * and tokens. tokens are identified by matching pairs of curly braces.
 *
 * @param template - The input template string to parse
 * @returns An array of ParseResultLine[], where each line contains an array of parsed segments.
 *          Each segment is an object with:
 *          - isToken: boolean indicating if the segment is a token
 *          - content: string containing either the text content or token name
 *          - argument?: optional string containing the token argument if present
 *
 * @example
 * parseTemplate("Hello {token arg}") returns:
 * [[
 *   { isToken: false, content: "Hello " },
 *   { isToken: true, content: "token", argument: "arg" }
 * ]]
 */

export function parseTemplate(template: string): ParseResultLine[] {
	const result: ParseResultLine[] = []
	const lines = template.split('\n')

	for (const line of lines) {
		const lineResult: ParseResultLine = []
		let position = 0

		while (position < line.length) {
			// Find the next opening brace
			let openBrace = line.indexOf('{', position)

			// Check if we found a brace and if it's escaped
			while (openBrace !== -1 && openBrace > 0 && line[openBrace - 1] === '\\') {
				// This brace is escaped, look for the next one
				openBrace = line.indexOf('{', openBrace + 1)
			}

			if (openBrace === -1) {
				// No more tokens, process remaining text
				if (position < line.length) {
					const content = line.substring(position)
					lineResult.push({ type: 'text', value: unescapeBraces(content) })
				}
				break
			}

			// Process text before the token
			if (openBrace > position) {
				const content = line.substring(position, openBrace)
				lineResult.push({ type: 'text', value: unescapeBraces(content) })
			}

			// Find the closing brace
			let closeBrace = line.indexOf('}', openBrace)

			// Check if closing brace is escaped
			while (closeBrace !== -1 && closeBrace > 0 && line[closeBrace - 1] === '\\') {
				// This brace is escaped, look for the next one
				closeBrace = line.indexOf('}', closeBrace + 1)
			}

			if (closeBrace === -1) {
				// No closing brace, treat the rest as text
				const content = line.substring(position)
				lineResult.push({ type: 'text', value: unescapeBraces(content) })
				lineResult.push({ type: 'error', message: 'Unclosed token', position: openBrace })
				break
			}

			// Extract token content
			const tokenContent = line.substring(openBrace + 1, closeBrace)

			// Split token name and argument by first whitespace
			const firstWhitespace = tokenContent.search(/\s/)
			if (firstWhitespace === -1) {
				// No whitespace, entire content is the token name with empty argument
				lineResult.push({ type: 'token', token: tokenContent, position: openBrace })
			} else {
				const tokenName = tokenContent.substring(0, firstWhitespace)
				const argument = tokenContent.substring(firstWhitespace + 1)
				lineResult.push({ type: 'token', token: tokenName, argument, position: openBrace })
			}

			// Move position past the closing brace
			position = closeBrace + 1
		}

		result.push(lineResult)
	}

	return result
}

function unescapeBraces(text: string): string {
	return text.replace(/\\([{}])/g, '$1')
}

/**
 * Interpolates a template string by replacing tokens with corresponding values from a schema and values object.
 * Tokens are defined within curly braces {} and can have an optional argument.
 *
 * The function processes the template line by line, replacing each token with its corresponding value
 * from the values object or using a transform function defined in the schema. If a token is not found
 * in the schema, it is returned as-is in the output string.
 *
 * @param template - The input template string containing tokens to be replaced
 * @param schema - The schema object that defines valid tokens and their optional transform functions
 * @param values - The values object containing data to replace tokens in the template
 * @param delimiter - Optional string to join lines in the final output (default is newline '\n')
 * @returns The interpolated string with all tokens replaced by their corresponding values
 *
 * @typeParam T - Type extending Values interface for schema validation
 *
 * @example
 * ```typescript
 * const schema = { name: 'string', age: 'number' };
 * const result = templateToString('Hello {name}', schema, { name: 'John' });
 * ```
 */
export function templateToString<T extends Values>(
	template: string,
	schema: Schema<T>,
	values: T,
	delimiter = '\n'
) {
	return parseTemplate(template)
		.map((lines) =>
			lines
				.map((item) => {
					if (item.type == 'token') {
						const token = schema[item.token]
						if (token === undefined) {
							// token not found in schema, return as is
							return `{${item.token}${item.argument ? ' ' + item.argument : ''}}`
						}

						if (token.transform) {
							return token.transform(values)
						} else if (typeof values[item.token] === 'string') {
							return values[item.token] as string
						} else {
							// actually, this is an error
							return values[item.token]?.toString()
						}
					} else {
						if (item.type == 'error') {
							// we could also offer a error replacer here, but none for now
							return `ERROR: ${item.message}`
						}
						// we could also offer a text replacer here, but none for now
						return item.value
					}
				})
				.join('')
		)
		.join(delimiter)
}

type ValidationError = { message: string; line: number; position: number }

/**
 * Validates a template string against a given schema
 * @param template - The template string to validate
 * @param schema - The schema object that defines valid tokens
 * @returns Array of validation errors found in the template. Empty array if no errors
 * @typeParam T - Type extending Values interface for schema validation
 * @throws {never}
 *
 * @example
 * ```typescript
 * const schema = { name: 'string', age: 'number' };
 * const errors = validateTemplate('Hello {name}', schema);
 * ```
 */
export function validateTemplate<T extends Values>(
	template: string,
	schema: Schema<T>
): ValidationError[] {
	const errors: (ValidationError | null)[] = parseTemplate(template)
		.map((lines, index) =>
			lines
				.map((item) => {
					if (item.type == 'error') {
						return {
							message: item.message,
							line: index,
							position: item.position
						} as ValidationError
					} else if (item.type == 'token') {
						if (schema[item.token] === undefined) {
							return {
								message: `Unknown token: ${item.token}`,
								line: index,
								position: item.position
							} as ValidationError
						}
					}
					return null
				})
				.filter((e): e is ValidationError => e !== null)
		)
		.flat()

	return errors as ValidationError[]
}
