export type LinkStatus = '200' | 'bad'
export interface LinkStatusObject {
	linkName: string
	status: string
}

export const promisedFunction = (item: any) => new Promise((res) => res(item))

export const delayedMap = async (
	props: {
		array: string[]
		delayMs?: number
		promisedFn?: (item: any) => Promise<any>
	},
	cb: (r: { linkName: string; status: string }) => void
) => {
	const { delayMs, promisedFn, array } = props
	const pfn = promisedFn ? promisedFn : promisedFunction
	const delay = (t: number, data?: string) =>
		new Promise((resolve) => {
			setTimeout(resolve.bind(null, data), t)
		})
	let index = 0
	function next() {
		if (index < array.length) {
			return pfn(array[index++]).then((r: any) => {
				cb(r)
				return delay(delayMs).then(next)
			})
		}
	}
	return await Promise.resolve().then(next)
}

export const getLoopCount = (linksArrLength: number) => {
	const length = linksArrLength
	if (length <= 10) {
		return 2
	} else if (length <= 30) {
		return 3
	} else if (length <= 50) {
		return 5
	} else if (length <= 100) {
		return 10
	} else if (length <= 130) {
		return 15
	} else {
		return 25
	}
}

export const filterLinksStatuses = (
	linksStatuses: LinkStatusObject[],
	expectedStatus: LinkStatus | 'all'
) =>
	linksStatuses
		.filter((value) => {
			if (value.status === '200' && expectedStatus === '200') return value
			if (value.status === 'bad' && expectedStatus === 'bad') return value
			if (expectedStatus === 'all') return value
		})
		.filter((linksStatus) => linksStatus !== undefined)
