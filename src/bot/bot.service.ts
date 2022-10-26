import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'
import { FetcherService } from '../fetcher/fetcher.service'
import { delayedMap, getLoopCount } from '../utils'

type LinkStatus = '200' | 'bad'

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

	private async checkLinks(links: string[], chatId: number) {
		let chunks: string[] = []
		let linkStatusesCollection: {
			linkName: string
			status: string
		}[][] = []
		let counterMessageId = 0
		let checkedCounter = 0
		const loopCount = getLoopCount(links.length)
		let isAlmostDone = false

		const updateMesaageId = (a: TelegramBot.Message) =>
			(counterMessageId = a.message_id)
		const sendMessage = (text: string) =>
			sendReplyMessage(text).then(updateMesaageId)
		const updateMessage = (text: string) =>
			editMessage(text, counterMessageId).then(updateMesaageId)

		const handleLoop = (linksPart: string[], i: number) => {
			let linkStatuses: { linkName: string; status: string }[] = []
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
				(r) => {
					checkedCounter++
					const index = links.indexOf(r.linkName)
					const infoText = `Проверено: ${checkedCounter} из ${links.length}`
					if (counterMessageId === 0 && i === 0) sendMessage(infoText)
					try {
						linkStatuses.push(r)
					} catch (error) {
						console.log(error)
					}
				}
			)
				.then(assembleChunks)
				.then(async ({ chunks, linkStatusesCollection }) => {
					if (links.length >= 80) isAlmostDone = true
					console.log('almost DONE')
					if (chunks.length === loopCount + 1) {
						await delayedMap({ delayMs: 600, array: chunks }, (a: any) => {
							sendReplyMessage(a)
						})

						const getCount = (status_1: '200' | 'bad' | 'all') =>
							linkStatusesCollection
								.map((linksStatuses) =>
									linksStatuses
										.filter((v) => {
											if (v.status === '200' && status_1 === '200') return v
											if (v.status === 'bad' && status_1 === 'bad') return v
											if (status_1 === 'all') return v
										})
										.filter((e_1) => e_1 !== undefined)
								)
								.reduce((prev, curr) => prev.concat(curr))
						const ok = getCount('200')
						const bad = getCount('bad')
						const all = getCount('all')
						console.log(ok)
						sendReplyMessage(
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

		const editMessage = (text: string, messageId: number) => {
			return this.bot.editMessageText(text, {
				chat_id: chatId,
				message_id: messageId
			})
		}

		const sendReplyMessage = (u: string) => {
			// const messageOptions: TelegramBot.SendMessageOptions = {
			// 	reply_markup: replyKeyboard.getMarkup(),
			// }
			return this.bot.sendMessage(chatId, u)
		}
	}
}
