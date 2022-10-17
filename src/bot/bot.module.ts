import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [HttpModule],
	providers: [BotService],
	exports: [BotService],
})
export class BotModule {}
