type ParseResultItem = {
	isTag: boolean;
	content: string;
	argument?: string;
};

type ParseResultLine = ParseResultItem[];

/**
 * Parses a template string containing special tags enclosed in curly braces ({}).
 * Each tag can have a name and an optional argument separated by whitespace.
 * 
 * The template is processed line by line, and each line is split into segments of regular text
 * and tags. Tags are identified by matching pairs of curly braces.
 * 
 * @param template - The input template string to parse
 * @returns An array of ParseResultLine[], where each line contains an array of parsed segments.
 *          Each segment is an object with:
 *          - isTag: boolean indicating if the segment is a tag
 *          - content: string containing either the text content or tag name
 *          - argument?: optional string containing the tag argument if present
 * 
 * @example
 * parseTemplate("Hello {tag arg}") returns:
 * [[
 *   { isTag: false, content: "Hello " },
 *   { isTag: true, content: "tag", argument: "arg" }
 * ]]
 */
export function parseTemplate(template: string): ParseResultLine[] {
	const result: ParseResultLine[] = [];
	const lines = template.split('\n');

	for (const line of lines) {
		const lineResult: ParseResultLine = [];
		let position = 0;

		while (position < line.length) {
			// Find the next opening brace
			const openBrace = line.indexOf('{', position);

			if (openBrace === -1) {
				// No more tags, process remaining text
				if (position < line.length) {
					lineResult.push({ isTag: false, content: line.substring(position) });
				}
				break;
			}

			// Process text before the tag
			if (openBrace > position) {
				lineResult.push({ isTag: false, content: line.substring(position, openBrace) });
			}

			// Find the closing brace
			const closeBrace = line.indexOf('}', openBrace);

			if (closeBrace === -1) {
				// No closing brace, treat the rest as text
				lineResult.push({ isTag: false, content: line.substring(position) });
				break;
			}

			// Extract tag content
			const tagContent = line.substring(openBrace + 1, closeBrace);

			// Split tag name and argument by first whitespace
			const firstWhitespace = tagContent.search(/\s/);

			if (firstWhitespace === -1) {
				// No whitespace, entire content is the tag name with empty argument
				lineResult.push({ isTag: true, content: tagContent });
			} else {
				const tagName = tagContent.substring(0, firstWhitespace);
				const argument = tagContent.substring(firstWhitespace + 1);
				lineResult.push({ isTag: true, content: tagName, argument });
			}

			// Move position past the closing brace
			position = closeBrace + 1;
		}
		result.push(lineResult);
	}
	return result;
}
