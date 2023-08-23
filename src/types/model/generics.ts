export type NestedKeys<T> = {
	[K in string & keyof T]: T[K] extends object ? K | NestedPaths<T[K], K> : K
}[string & keyof T]

export type NestedPaths<T, P extends string> = {
	[K in string & keyof T]: T[K] extends object
		? NestedPaths<T[K], `${P}.${K}`> | `${P}.${K}`
		: `${P}.${K}`
}[string & keyof T]
