import { Module } from '@nestjs/common'
import { FetcherService } from './fetcher.service'
import { HttpModule } from '@nestjs/axios'

@Module({
	imports: [HttpModule],
	providers: [FetcherService],
	exports: [FetcherService]
})
export class FetcherModule {}
