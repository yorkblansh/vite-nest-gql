import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'

type LinkStatus = '200' | 'bad'

@Injectable()
export class FetcherService {
	constructor(private readonly httpService: HttpService) {}

	httpRequest = async (link: string) => {
		try {
			const r = await this.httpService.axiosRef.request({
				baseURL: `https://${link}`,
				timeout: 6500
			})
			return r.status === 200
				? { linkName: `🟢  ${link}`, status: r.status.toString() }
				: { linkName: `🟡  ${link}`, status: 'unknown errorrrrrr' }
		} catch (er) {
			return { linkName: `🔴  ${link}`, status: 'bad' }
		}
	}
}
