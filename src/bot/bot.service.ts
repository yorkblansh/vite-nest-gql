import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'
import { FetcherService } from '../fetcher/fetcher.service'
import { delayedMap, getLoopCount } from '../utils'

type LinkStatus = '200' | 'bad'
interface LinkStatusObject {
	linkName: string
	status: string
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
		this.initBot('1977330650:AAGBwqfpPKF7-hTUKiYZ98lrDkvefir0G4A')
		this.handleCommands()
	}

	initBot(token: string) {
		console.log('init bot')
		this.bot = new TelegramBot(token, { polling: true })
	}

	handleCommands() {
		this.handleLinks()
		this.bot.on('polling_error', (err) => console.log(err))
	}

	private handleLinks() {
		this.httpRequest = this.fetcherService.httpRequest
		this.bot.onText(/(.+)/, (msg, match) => {
			const chatId = msg.chat.id
			const links = match.input.split(/\r?\n/)
			this.checkLinks(links, chatId)
		})
	}

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

	private async checkLinks(links: string[], chatId: number) {
		let chunks: string[] = []
		let linkStatusesCollection: LinkStatusObject[][] = []
		let counterMessageId = 0
		let checkedCounter = 0
		const loopCount = getLoopCount(links.length)
		let isAlmostDone = false

		const updateMesaageId = (a: TelegramBot.Message) =>
			(counterMessageId = a.message_id)
		const sendMessage = (text: string) =>
			this.sendReplyMessage(chatId, text).then(updateMesaageId)
		const updateMessage = (text: string) =>
			this.editMessage(chatId, text, counterMessageId).then(updateMesaageId)

		const handleLoop = (linksPart: string[], i: number) => {
			let linkStatuses: LinkStatusObject[] = []
			const assembleChunks = () => {
				const mergedLinks = linkStatuses
					.map((el) => `${el.linkName} -- ${el.status}`)
					.join('\n\n')
				linkStatusesCollection.push(linkStatuses)
				chunks.push(mergedLinks)
				return { chunks, linkStatusesCollection }
			}

			delayedMap(
				{ array: linksPart, delayMs: 600, promisedFn: this.httpRequest },
				(linksStatus) => {
					checkedCounter++
					const infoText = `Проверено: ${checkedCounter} из ${links.length}`
					if (counterMessageId === 0 && i === 0) sendMessage(infoText)
					linkStatuses.push(linksStatus)
				}
			)
				.then(assembleChunks)
				.then(async ({ chunks, linkStatusesCollection }) => {
					if (links.length >= 80) isAlmostDone = true
					console.log('almost DONE')
					if (chunks.length === loopCount + 1) {
						await delayedMap({ delayMs: 600, array: chunks }, (a: any) => {
							this.sendReplyMessage(chatId, a)
						})

						const filterLinksStatuses = (
							linksStatuses: LinkStatusObject[],
							expectedStatus: LinkStatus | 'all'
						) =>
							linksStatuses
								.filter((value) => {
									if (value.status === '200' && expectedStatus === '200')
										return value
									if (value.status === 'bad' && expectedStatus === 'bad')
										return value
									if (expectedStatus === 'all') return value
								})
								.filter((linksStatus) => linksStatus !== undefined)

						const getCount = (expectedStatus: '200' | 'bad' | 'all') =>
							linkStatusesCollection
								.map((linksStatuses) =>
									filterLinksStatuses(linksStatuses, expectedStatus)
								)
								.reduce((prev, curr) => prev.concat(curr))

						const ok = getCount('200')
						const bad = getCount('bad')
						const all = getCount('all')
						console.log(ok)
						this.sendReplyMessage(
							chatId,
							`Готово\n Всего проверено: ${all.length}\n✅  доступные сайты: ${ok.length}\n❌  недоступные сайты: ${bad.length}`
						)
						clearInterval(bbh)

						return {
							okArr: ok.map((v_1) => v_1.linkName),
							badArr: bad.map((v_2) => v_2.linkName)
						}
					}
				})

				.catch((err) => {
					// process error here
				})
		}

		chunk(links, links.length / loopCount).map(handleLoop)

		let h = 0
		const cubeMap = ['🟥', '🟧', '🟨', '🟩', '🟦', '🟪']

		const bbh = setInterval(() => {
			try {
				const jj = cubeMap[h]
				const finishText = () =>
					isAlmostDone ? '\nПодготавливаем ответ...' : ''

				updateMessage(
					`Проверено: ${checkedCounter} из ${
						links.length
					} ${jj} ${finishText()}`
				)
				if (h === cubeMap.length - 1) {
					h = 0
				} else {
					h++
				}
			} catch (error) {}
		}, 400)
	}
}
