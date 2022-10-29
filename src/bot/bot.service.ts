import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'
import { FetcherService } from '../fetcher/fetcher.service'
import {
	delayedMap,
	filterLinksStatuses,
	getLoopCount,
	LinkStatusObject
} from '../utils'
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

interface FinalMessage {
	ok: string[]
	bad: string[]
	all: string[]
}

// const replyKeyboard = new ReplyKeyboard()
// const inlineKeyboard = new InlineKeyboard()

// const firstReplyKeyboardRowToShowConstructor = new Row<KeyboardButton>(
// 	new KeyboardButton('1:1 Button'),
// 	new KeyboardButton('1:2 Button'),
// )

// const firstReplyKeyboardRowToShowConstructor1 = new Row<
// 	InlineKeyboardButton<any>
// >(new InlineKeyboardButton('My text 2', 'callback_data', '/echo qwe'))

// const secondReplyKeyboardRowToShowRowAsArray = new Row<KeyboardButton>()

// secondReplyKeyboardRowToShowRowAsArray.push(
// 	new KeyboardButton('2:1 Button'),
// 	new KeyboardButton('2:2 Button'),
// )

// // replyKeyboard.push(
// // 	firstReplyKeyboardRowToShowConstructor,
// // 	secondReplyKeyboardRowToShowRowAsArray,
// // )
// inlineKeyboard.push(firstReplyKeyboardRowToShowConstructor1)

@Injectable()
export class BotService implements OnModuleInit {
	private bot: TelegramBot
	private httpRequest: FetcherService['httpRequest']

	constructor(
		private readonly httpService: HttpService,
		private readonly fetcherService: FetcherService
	) {}

	onModuleInit() {
		this.initBot(process.env.BOT_KEY)
		this.handleCommands()
	}

	initBot(token: string) {
		console.log('init bot')
		this.bot = new TelegramBot(token, { polling: true })
	}

	handleCommands() {
		this.handleScaner()
		this.bot.on('polling_error', (err) => console.log(err))
	}

	private handleScaner() {
		this.httpRequest = this.fetcherService.httpRequest
		this.bot.onText(/(.+)/, async (msg, match) => {
			let messageId = 0
			const chatId = msg.chat.id
			const links = match.input.split(/\r?\n/)
			let isAlmostDone = false

			const updateMesaageId = (a: TelegramBot.Message) =>
				(messageId = a.message_id)

			const handleStartMessage = () => {
				const infoText = `Проверено: ${1} из ${links.length}`
				this.sendReplyMessage(chatId, infoText).then(updateMesaageId)
			}

			const handleUpdateMessage = (checkedCount, cubeIndex, cubeMap) => {
				const percent = (checkedCount / links.length) * 100
				if (percent >= 85) isAlmostDone = true
				const text = `Проверено: ${checkedCount} из ${
					links.length
				} (${percent.toFixed(1)}%) ${cubeMap[cubeIndex]} ${
					isAlmostDone ? '\nПодготавливаем ответ...' : ''
				}`
				this.editMessage(chatId, text, messageId).then(updateMesaageId)
			}

			const promisedResults = await this.checkLinks(links, {
				handleStartMessage,
				handleUpdateMessage
			})
			const allLinksLength = links.length
			const loopCount = getLoopCount(links.length)

			promisedResults.map(async (results) => {
				const { chunks, linkStatusesCollection, updateInfoLoopId } =
					await results
				// if (allLinksLength >= 80) isAlmostDone = true
				console.log('almost DONE')
				if (chunks.length === loopCount + 1) {
					await delayedMap({ delayMs: 300, array: chunks }, (text: any) => {
						this.sendReplyMessage(chatId, text)
					})
					clearInterval(updateInfoLoopId)
					this.sendFinalMessage(chatId, {
						ok: this.getCountOf(linkStatusesCollection, '200'),
						bad: this.getCountOf(linkStatusesCollection, 'bad'),
						all: this.getCountOf(linkStatusesCollection, 'all')
					})
				}
			})
		})
	}

	private sendFinalMessage(
		chatId: string | number,
		{ ok, bad, all }: FinalMessage
	) {
		this.sendReplyMessage(
			chatId,
			`Готово\n Всего проверено: ${all.length}\n✅  доступные сайты: ${ok.length}\n❌  недоступные сайты: ${bad.length}`
		)
	}

	private getCountOf = (
		linkStatusesCollection,
		expectedStatus: '200' | 'bad' | 'all'
	) =>
		linkStatusesCollection
			.map((linksStatuses) => {
				return filterLinksStatuses(linksStatuses, expectedStatus)
			})
			.reduce((prev, curr) => prev.concat(curr))

	private editMessage = (
		chatId: string | number,
		text: string,
		messageId: number
	) => {
		return this.bot.editMessageText(text, {
			chat_id: chatId,
			message_id: messageId
		})
	}

	private sendReplyMessage = (chatId: string | number, text: string) => {
		// const messageOptions: TelegramBot.SendMessageOptions = {
		// 	reply_markup: replyKeyboard.getMarkup(),
		// }
		return this.bot.sendMessage(chatId, text)
	}

	private async checkLinks(
		links: string[],
		{ handleStartMessage, handleUpdateMessage }
	) {
		let chunks: string[] = []
		let linkStatusesCollection: LinkStatusObject[][] = []
		let checkedCount = 0
		const loopCount = getLoopCount(links.length)
		let startMessageSended = false

		const handleLoop = async (linksPart: string[], i: number) => {
			let linkStatuses: LinkStatusObject[] = []

			await delayedMap(
				{ array: linksPart, delayMs: 400, promisedFn: this.httpRequest },
				(linksStatus) => {
					checkedCount++
					if (i === 0 && !startMessageSended) {
						handleStartMessage()
						startMessageSended = true
					}
					linkStatuses.push(linksStatus)
				}
			)

			const mergedLinks = linkStatuses
				.map((el) => `${el.linkName} -- ${el.status}`)
				.join('\n\n')

			linkStatusesCollection.push(linkStatuses)
			chunks.push(mergedLinks)

			return {
				chunks,
				linkStatusesCollection,
				checkedCount,
				updateInfoLoopId
			}
		}

		let cubeIndex = 0
		const cubeMap = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪']
		const updateInfoLoopId = setInterval(() => {
			handleUpdateMessage(checkedCount, cubeIndex, cubeMap)
			cubeIndex === cubeMap.length - 1 ? (cubeIndex = 0) : cubeIndex++
		}, 500)

		const chunkSize = links.length / loopCount
		return chunk(links, chunkSize).map(handleLoop)
	}
}
