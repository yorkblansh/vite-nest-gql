import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'

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

	constructor(private readonly httpService: HttpService) {}

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
		this.bot.onText(/(.+)/, (msg, match) => {
			const chatId = msg.chat.id
			const links = match.input.split(/\r?\n/)
			this.checkLinks(links, chatId)
		})
	}

	private async checkLinks(links: string[], chatId: number) {
		const delay = (t: number, data?: string) =>
			new Promise((resolve) => {
				setTimeout(resolve.bind(null, data), t)
			})

		const httpRequest = (link: string) =>
			this.httpService.axiosRef
				.request({ baseURL: `https://${link}`, timeout: 6500 })
				.then((r) =>
					r.status === 200
						? { linkName: `🟢  ${link}`, status: r.status.toString() }
						: { linkName: `🟡  ${link}`, status: 'unknown errorrrrrr' }
				)
				.catch((er) => ({ linkName: `🔴  ${link}`, status: 'bad' }))

		const checkAll = async (
			array: string[],
			cb: (r: { linkName: string; status: string }) => void
		) => {
			let index = 0
			function next() {
				if (index < array.length) {
					return httpRequest(array[index++]).then(function (r) {
						cb(r)
						const bb = index <= 2 ? 650 : 600
						return delay(bb).then(next)
					})
				}
			}
			return await Promise.resolve().then(next)
		}
		// usage

		const getLoopCount = () => {
			const length = links.length
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

		// const okArr: string[] = []
		// const badArr: string[] = []

		let res_arr: string[] = []
		let res_arr_distr: {
			linkName: string
			status: string
		}[][] = []
		let counterMessageId = 0
		let checkedCounter = 0
		const loopCount = getLoopCount()
		let timeStamp = null
		let isAlmostDone = false

		const updateMesaageId = (a: TelegramBot.Message) =>
			(counterMessageId = a.message_id)
		const sendMessage = (text: string) =>
			sendReplyMessage(text).then(updateMesaageId)
		const updateMessage = (text: string) =>
			editMessage(text, counterMessageId).then(updateMesaageId)

		chunk(links, links.length / loopCount).map((links_part, i) => {
			let arrr: {
				linkName: string
				status: string
			}[] = []

			checkAll(links_part, (r) => {
				checkedCounter++
				const index = links.indexOf(r.linkName)
				const infoText = `Проверено: ${checkedCounter} из ${links.length}`

				if (counterMessageId === 0 && i === 0) {
					console.log(`${r.linkName} ${i}`)

					sendMessage(infoText)
				}

				try {
					arrr.push(r)
				} catch (error) {
					console.log(error)
				}
			})
				.then(() => {
					const gg = arrr
						.map((el) => `${el.linkName} -- ${el.status}`)
						.join('\n\n')

					res_arr_distr.push(arrr)
					res_arr.push(gg)

					// console.log(res_arr_distr)
					return { res_arr, res_arr_distr }
				})
				.then(async ({ res_arr, res_arr_distr: res_arr_distr___ }) => {
					const aaa = res_arr
					if (links.length >= 80) isAlmostDone = true
					console.log('almost DONE')
					// res_arr.push(a)
					// console.log(aaa.length)
					if (aaa.length === loopCount + 1) {
						await checkAll(aaa, (a) => {
							sendReplyMessage(a.linkName)
						})
						// await Promise.all(aaa.map((a) => sendReplyMessage(a)))
						// sendReplyMessage('all DONE')
						const getCount = (status_1: '200' | 'bad' | 'all') =>
							res_arr_distr___
								.map((e) =>
									e
										.filter((v) => {
											if (v.status === '200' && status_1 === '200') {
												return v
											}

											if (v.status === 'bad' && status_1 === 'bad') {
												return v
											}

											if (status_1 === 'all') {
												return v
											}
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
		})

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
