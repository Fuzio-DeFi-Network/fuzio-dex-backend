import { NewStyle } from "blipgloss"

export const welcomeStyle = NewStyle()
	.Bold(true)
	.Foreground("#FAFAFA")
	.Background("#2975CB")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)

export const infoStyle = NewStyle()
	.Bold(true)
	.Foreground("#FAFAFA")
	.Background("#0087AE")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)

export const successStyle = NewStyle()
	.Bold(true)
	.Foreground("#FAFAFA")
	.Background("#5CD367")
	.PaddingRight(1)
	.PaddingLeft(1)

export const warnStyle = NewStyle()
	.Bold(true)
	.Foreground("#FAFAFA")
	.Background("#FF9E60")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)

export const errorStyle = NewStyle()
	.Bold(true)
	.Foreground("#FAFAFA")
	.Background("#d83A45")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)

export const logStyle = infoStyle
	.Copy()
	.Foreground("#FAFAFA")
	.Background("#2975CB")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)

export const launchStyle = successStyle
	.Copy()
	.Foreground("#FAFAFA")
	.PaddingTop(1)
	.PaddingRight(1)
	.PaddingBottom(1)
	.PaddingLeft(1)