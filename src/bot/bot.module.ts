import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { HttpModule } from '@nestjs/axios'
import { FetcherModule } from '../fetcher/fetcher.module'

@Module({
	imports: [HttpModule, FetcherModule],
	providers: [BotService],
	exports: [BotService]
})
export class BotModule {}
