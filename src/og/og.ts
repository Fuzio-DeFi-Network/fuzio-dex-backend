import { type EmojiType } from "./emoji"
import { getIconCode, loadEmoji } from "./emoji"
import { renderAsync } from "@resvg/resvg-js"
import { type ReactElement } from "react"
import { type SatoriOptions } from "satori"

const satoriImport = import("satori")
const fallbackFont = Bun.file("public/Satoshi-BlackItalic.woff").arrayBuffer()

const isDevelopment = process.env.NODE_ENV === "DEVELOPMENT"

const languageFontMap = {
	"ar-AR": "Satoshi+Arabic",
	"bn-IN": "Satoshi+Bengali",
	devanagari: "Satoshi+Devanagari",
	"he-IL": "Satoshi+Hebrew",
	"ja-JP": "Satoshi+JP",
	kannada: "Satoshi+Kannada",
	"ko-KR": "Satoshi+KR",
	math: "Satoshi+Math",
	"ml-IN": "Satoshi+Malayalam",
	symbol: ["Satoshi+Symbols", "Satoshi+Symbols+2"],
	"ta-IN": "Satoshi+Tamil",
	"te-IN": "Satoshi+Telugu",
	"th-TH": "Satoshi+Thai",
	unknown: "Satoshi",
	"zh-CN": "Satoshi+SC",
	"zh-HK": "Satoshi+HK",
	"zh-TW": "Satoshi+TC"
}

const loadGoogleFont = async (fontFamily: string[] | string, text: string) => {
	if (!fontFamily || !text) return

	const API = `https://fonts.googleapis.com/css2?family=${fontFamily}&text=${encodeURIComponent(
		text
	)}`
	const css = await fetch(API, {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
		}
	}).then(async (response) => await response.text())

	const resource = /src: url\((.+)\) format\('(?:opentype|truetype)'\)/u.exec(
		css
	)
	if (!resource) throw new Error("Failed to load font")

	// eslint-disable-next-line consistent-return
	return await fetch(resource[1]).then(
		async (response) => await response.arrayBuffer()
	)
}

const assetCache = new Map()

const loadDynamicAsset = (emojiType: EmojiType = "twemoji") => {
	// eslint-disable-next-line @typescript-eslint/naming-convention, canonical/id-match, consistent-return
	const function_ = async (languageCode: string, text: string) => {
		if (languageCode === "emoji") {
			return (
				"data:image/svg+xml;base64," +
				btoa(await (await loadEmoji(getIconCode(text), emojiType)).text())
			)
		}

		// eslint-disable-next-line no-param-reassign
		if (!Object.hasOwn(languageFontMap, languageCode)) languageCode = "unknown"

		try {
			const fontData = await loadGoogleFont(
				languageFontMap[languageCode as keyof typeof languageFontMap],
				text
			)
			if (fontData) {
				return {
					data: fontData,
					name: `satori_${languageCode}_fallback_${text}`,
					style: "normal",
					weight: 400
				}
			}
		} catch (error) {
			console.error("Failed to load dynamic font for", text, ". Error:", error)
		}
	}

	return async (...args: Parameters<typeof function_>) => {
		const cacheKey = JSON.stringify({ ...args, emojiType })
		const cachedFont = assetCache.get(cacheKey)
		if (cachedFont) return cachedFont

		const font = await function_(...args)
		assetCache.set(cacheKey, font)
		return font
	}
}

export type ImageResponseOptions = ConstructorParameters<typeof Response>[1] & {
	debug?: boolean
	emoji?: EmojiType
	fonts?: SatoriOptions["fonts"]
	height?: number
	width?: number
}

export const createImageResponse = (
	element: ReactElement,
	options: ImageResponseOptions = {}
): Response => {
	const extendedOptions = {
		debug: false,
		height: 630,
		width: 1_200,
		...options,
		status: 200
	}

	const stream = new ReadableStream({
		async start(controller) {
			const fontData = await fallbackFont
			const { default: satori } = await satoriImport
			const svg = await satori(element, {
				debug: extendedOptions.debug,
				fonts: extendedOptions.fonts ?? [
					{
						data: fontData,
						name: "Satoshi",
						style: "normal",
						weight: 700
					}
				],
				height: extendedOptions.height,
				loadAdditionalAsset: loadDynamicAsset(extendedOptions.emoji),
				width: extendedOptions.width
			})
			const image = await renderAsync(svg, {
				fitTo: {
					mode: "width",
					value: extendedOptions.width
				}
			})
			controller.enqueue(image.asPng())
			controller.close()
		}
	})

	return new Response(stream, {
		headers: {
			"cache-control": isDevelopment
				? "no-cache, no-store"
				: "public, immutable, no-transform, max-age=31536000",
			"content-type": "image/png",
			...extendedOptions.headers
		},
		status: extendedOptions.status,
		statusText: extendedOptions.statusText
	})
}
