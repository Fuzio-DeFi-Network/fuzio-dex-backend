import { cacheManagerInstance } from "@utils/cache"
import { createImageResponse } from "og/og"
import React from "react"

export const config = {
	runtime: "node"
}

const ogImage = await Bun.file("public/og.png").arrayBuffer()

const arrayBufferToDataURL = (arrayBuffer: ArrayBuffer): string => {
	const buffer = Buffer.from(arrayBuffer)
	const base64 = buffer.toString("base64")
	return `data:image/png;base64,${base64}`
}

export const generateOGImage = async (
	type: "default" | "pool" | "swap",
	value: string
) => {
	const dataURL = arrayBufferToDataURL(ogImage)

	try {
		const pool = cacheManagerInstance.getPoolWithDataByIndex(Number(value) - 1)
		const token1 = cacheManagerInstance.getTokenByProperty(
			"denom",
			pool.liquidity.token1.denom
		)
		const token2 = cacheManagerInstance.getTokenByProperty(
			"denom",
			pool.liquidity.token2.denom
		)

		return createImageResponse(
			<div
				style={{
					alignItems: "center",
					backgroundColor: "white",
					display: "flex",
					height: "100%",
					position: "relative",
					textAlign: "center",
					width: "100%"
				}}
			>
				<img
					src={dataURL}
					style={{
						alignItems: "center",
						backgroundColor: "white",
						height: "100%",
						justifyContent: "center",
						position: "absolute",
						width: "100%"
					}}
				/>
				<div
					style={{
						alignItems: "center",
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						height: "100%",
						justifyContent: "flex-start",
						position: "relative",
						textAlign: "center",
						width: "100%"
					}}
				>
					<img
						src={token1.logoURI}
						style={{
							borderRadius: "50%",
							bottom: "4.5rem",
							height: "22.5rem",
							left: "-0.4rem",
							objectFit: "cover",
							position: "absolute",
							width: "22.5rem"
						}}
					/>
					<img
						src={token2.logoURI}
						style={{
							borderRadius: "50%",
							bottom: "1rem",
							height: "19rem",
							left: "9rem",
							objectFit: "cover",
							position: "absolute",
							width: "19rem"
						}}
					/>
					{pool.isVerified && (
						<div
							style={{
								alignItems: "center",
								backgroundColor: "white",
								borderRadius: "50%",
								bottom: "1rem",
								display: "flex",
								height: "6rem",
								justifyContent: "center",
								position: "absolute",
								width: "6.25rem"
							}}
						>
							<svg
								fill="#5CD367"
								stroke="white"
								style={{
									alignItems: "center",
									height: "5rem",
									justifyContent: "center",
									width: "6.5rem"
								}}
								viewBox="0 0 700 570"
							>
								<path d="m616 280c0-37.52-19.602-71.121-49.281-89.602 7.8398-34.16-1.6797-71.68-28.559-98.559s-63.84-35.84-98.559-28.559c-18.48-29.68-52.082-49.281-89.602-49.281s-71.121 19.602-89.602 49.281c-34.16-7.8398-71.68 1.6797-98.559 28.559s-35.84 63.84-28.559 98.559c-29.68 19.043-49.281 52.082-49.281 89.602s19.602 71.121 49.281 89.602c-7.8398 34.16 1.6797 71.68 28.559 98.559s63.84 36.398 98.559 28.559c19.039 29.68 52.078 49.281 89.602 49.281 37.52 0 70.559-19.602 89.602-49.281 34.16 7.8398 71.68-1.6797 98.559-28.559s36.398-63.84 28.559-98.559c29.68-18.48 49.281-52.082 49.281-89.602zm-321.44 87.922-54.32-54.32c-10.078-10.078-10.078-25.762 0-35.84s25.762-10.078 35.84 0l36.961 36.398 111.44-111.44c10.078-10.078 25.762-10.078 35.84 0 10.078 10.078 10.078 25.762 0 35.84l-129.92 129.36c-10.078 10.078-25.758 10.078-35.84 0z" />
							</svg>
						</div>
					)}

					<div
						style={{
							alignItems: "center",
							color: "white",
							display: "flex",
							flexDirection: "column",
							fontSize: 48,
							fontStyle: "bold",
							height: "27.25rem",
							justifyContent: "flex-start",
							position: "absolute",
							right: "1.75rem",
							top: "7.5rem",
							width: "37rem"
						}}
					>
						<p
							style={{
								alignItems: "center",
								justifyContent: "center",
								position: "relative",
								textAlign: "center",
								top: "-2.5rem",
								width: "100%"
							}}
						>
							Pool #{pool.poolId}
						</p>
						<div
							style={{
								background: "white",
								borderRadius: "1rem",
								height: "0.5rem",
								position: "relative",
								top: "-5rem",
								width: "90%"
							}}
						/>
						<div
							style={{
								color: "white",
								display: "flex",
								fontSize: 48,
								fontStyle: "bold",
								paddingLeft: "2rem",
								paddingRight: "2rem",
								position: "relative",
								top: "-7rem",
								width: "100%"
							}}
						>
							<p style={{ width: "10rem" }}>TVL</p>
							<div
								style={{
									color: "white",
									display: "flex",
									fontSize: 48,
									fontStyle: "bold",
									justifyContent: "flex-end",
									width: "100%"
								}}
							>
								<p style={{}}>
									$
									{Number(pool.liquidity.usd).toLocaleString("en-US", {
										maximumFractionDigits: 2,
										minimumFractionDigits: 2
									})}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>,
			{
				debug: false,
				height: 630,
				width: 1_200
			}
		)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error(`${error.message}`)
		return new Response(`Failed to generate the image`, {
			status: 500
		})
	}
}
