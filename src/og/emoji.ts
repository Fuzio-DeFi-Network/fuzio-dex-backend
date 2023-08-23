/* eslint-disable canonical/id-match */
/* eslint-disable id-length */
/* ! Copyright Twitter Inc. and other contributors. Licensed under MIT */

const U200D = String.fromCodePoint(8_205) // zero-width joiner
const UFE0Fg = /\uFE0F/gu // variation selector regex

export type EmojiType = keyof typeof apis

const apis = {
	blobmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/",
	fluent: (code: string) =>
		`https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_color.svg`,
	fluentFlat: (code: string) =>
		`https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_flat.svg`,
	noto: "https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/",
	openmoji: "https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/",
	twemoji: (code: string) =>
		`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`
}

const toCodePoint = (unicodeSurrogates: string): string => {
	const r: string[] = []
	let c = 0
	let index = 0
	let p = 0

	while (index < unicodeSurrogates.length) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		c = unicodeSurrogates.codePointAt(index++)!
		if (p) {
			// eslint-disable-next-line no-bitwise
			r.push((65_536 + ((p - 55_296) << 10) + (c - 56_320)).toString(16))
			p = 0
		} else if (c >= 55_296 && c <= 56_319) {
			p = c
		} else {
			r.push(c.toString(16))
		}
	}

	return r.join("-")
}

export const getIconCode = (char: string): string =>
	// eslint-disable-next-line no-negated-condition
	toCodePoint(!char.includes(U200D) ? char.replaceAll(UFE0Fg, "") : char)

export const loadEmoji = async (code: string, type: EmojiType) => {
	const api = apis[type] ?? apis.twemoji
	return typeof api === "function"
		? await fetch(api(code))
		: await fetch(`${api}${code.toUpperCase()}.svg`)
}
