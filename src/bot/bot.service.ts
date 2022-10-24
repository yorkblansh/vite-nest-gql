import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'
import debounce from 'lodash.debounce'
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
		this.handleText()
	}

	initBot(token: string) {
		console.log('init bot')
		this.bot = new TelegramBot(token, { polling: true })
	}

	handleText() {
		this.bot.onText(/(.+)/, (msg, match) => {
			const chatId = msg.chat.id
			const links = match.input.split(/\r?\n/)
			this.checkLinks(links, chatId)
		})

		// import {
		// 	InlineKeyboard,
		// 	ReplyKeyboard,
		// 	ForceReply,
		// 	Row,
		// 	KeyboardButton,
		// 	InlineKeyboardButton,
		// } from 'node-telegram-keyboard-wrapper'
		// import * as TelegramBot from 'node-telegram-bot-api'

		// if (process.argv.length < 3) {
		// 	throw new Error(
		// 		'To test this bot, please pass a bot-token to the application.',
		// 	)
		// }

		// const token = '1977330650:AAGBwqfpPKF7-hTUKiYZ98lrDkvefir0G4A'
		// const bot = new TelegramBot(token, { polling: true })

		// const BotState = {
		// 	isReplyKeyboardOpen: false,
		// }

		// const replyKeyboard = new ReplyKeyboard()
		// const inlineKeyboard = new InlineKeyboard()

		// const firstReplyKeyboardRowToShowConstructor = new Row<KeyboardButton>(
		// 	new KeyboardButton('1:1 Button'),
		// 	new KeyboardButton('1:2 Button'),
		// )

		// const secondReplyKeyboardRowToShowRowAsArray = new Row<KeyboardButton>()

		// secondReplyKeyboardRowToShowRowAsArray.push(
		// 	new KeyboardButton('2:1 Button'),
		// 	new KeyboardButton('2:2 Button'),
		// )

		// replyKeyboard.push(
		// 	firstReplyKeyboardRowToShowConstructor,
		// 	secondReplyKeyboardRowToShowRowAsArray,
		// )

		// inlineKeyboard.push(
		// 	/**
		// 	 * Forcing generic type here due to InlineKeyboardButton generic.
		// 	 * See Row's file for a better Typescript explanation
		// 	 */

		// 	new Row<InlineKeyboardButton>(
		// 		// new InlineKeyboardButton('1:2 Button', 'url', 'https://www.google.com'),
		// 		new InlineKeyboardButton('1:1 Button', 'callback_data', 'Works 1!'),
		// 		new InlineKeyboardButton('1:2 Button', 'callback_data', 'Works 2!'),
		// 	),
		// 	// new Row<InlineKeyboardButton>(
		// 	// 	new InlineKeyboardButton('2:1 Button', 'callback_data', 'Works 3!'),
		// 	// 	new InlineKeyboardButton('2:2 Button', 'callback_data', 'Works 4!'),
		// 	// ),
		// )

		// function hasBotCommands(entities: TelegramBot.MessageEntity[]) {
		// 	if (!entities || !(entities instanceof Array)) {
		// 		return false
		// 	}

		// 	return entities.some((e) => e.type === 'bot_command')
		// }

		// bot.onText(/\/replyKeyboard/i, async (msg) => {
		// 	const messageOptions: TelegramBot.SendMessageOptions = {
		// 		reply_markup: replyKeyboard.getMarkup(),
		// 	}

		// 	await bot.sendMessage(
		// 		msg.from.id,
		// 		'This is a message with a reply keyboard. Click on one of the buttons to close it.',
		// 		messageOptions,
		// 	)
		// 	BotState.isReplyKeyboardOpen = true
		// })

		// bot.onText(/\/forceReply/i, (msg) => {
		// 	const options: TelegramBot.SendMessageOptions = {
		// 		reply_markup: ForceReply.getMarkup(),
		// 	}

		// 	bot.sendMessage(
		// 		msg.from.id,
		// 		"Hey, this is a forced-reply. Reply me. C'mon. I dare you.",
		// 		options,
		// 	)
		// })

		// this.bot.onText(/\/start/i, (msg) => {
		// 	const options: TelegramBot.SendMessageOptions = {
		// 		reply_markup: inlineKeyboard.getMarkup(),
		// 	}

		// 	this.bot.sendMessage(msg.from.id, 'выводим клавиатуру', options)
		// })

		// this.bot.on('message', async (msg) => {
		// 	if (!hasBotCommands(msg.entities)) {
		// 		if (BotState.isReplyKeyboardOpen) {
		// 			const options: TelegramBot.SendMessageOptions = {
		// 				reply_markup: replyKeyboard.remove(),
		// 			}

		// 			await this.bot.sendMessage(
		// 				msg.from.id,
		// 				"Message Received. I'm closing the replyKeyboard.",
		// 				options,
		// 			)
		// 			BotState.isReplyKeyboardOpen = false
		// 		} else if (!!msg.reply_to_message) {
		// 			await this.bot.sendMessage(
		// 				msg.from.id,
		// 				'HOW DARE YOU! But force reply worked.',
		// 			)
		// 		}
		// 	}
		// })

		// this.bot.on('callback_query', async (query) => {
		// 	await this.bot.answerCallbackQuery(query.id, { text: 'Action received!' })
		// 	// await bot.sendMessage(
		// 	// 	query.from.id,
		// 	// 	'Hey there! You clicked on an inline button! ;) So, as you saw, the support library works!',
		// 	// )
		// })

		this.bot.on('polling_error', (err) => console.log(err))
	}

	private sleep(cb, ms) {
		return new Promise((resolve) => {
			cb()
			return setTimeout(resolve, ms)
		})
	}

	private async checkLinks(links: string[], chatId: number) {
		const delay = (t: number, data?: string) =>
			new Promise((resolve) => {
				setTimeout(resolve.bind(null, data), t)
			})

		const httpRequest = (link: string) =>
			this.httpService.axiosRef
				.request({ baseURL: `https://${link}`, timeout: 5500 })
				.then((r) =>
					r.status === 200
						? { linkName: `🟢  ${link}`, status: r.status.toString() }
						: { linkName: `🟢  ${link}`, status: 'unknown errorrrrrr' }
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
						const bb = index <= 2 ? 850 : 10
						return delay(bb).then(next)
					})
				}
			}
			return await Promise.resolve().then(next)
		}
		// usage
		let res_arr: string[] = []
		let res_arr_distr: {
			linkName: string
			status: string
		}[][] = []
		let counterMessageId = 0
		let checkedCounter = 0
		const loopCount = 10
		let timeStamp = null

		const updateMesaageId = (a: TelegramBot.Message) =>
			(counterMessageId = a.message_id)
		const sendFirst = (text: string) =>
			sendReplyMessage(text).then(updateMesaageId)
		const update = (text: string) =>
			editMessage(text, counterMessageId).then(updateMesaageId)

		chunk(links, links.length / loopCount).map((links_part, i) => {
			let arrr: {
				linkName: string
				status: string
			}[] = []

			checkAll(links_part, async (r) => {
				checkedCounter++
				const index = links.indexOf(r.linkName)
				const infoText = `Проверено: ${checkedCounter} из ${links.length}`

				if (counterMessageId === 0 && i === 0) {
					console.log(`${r.linkName} ${i}`)

					sendFirst(infoText)
				}

				try {
					arrr.push(r)
				} catch (error) {
					console.log(error)
				}
			})
				.then(() => {
					res_arr_distr.push(arrr)
					res_arr.push(
						arrr.map((el) => `${el.linkName} -- ${el.status}`).join('\n\n')
					)

					return res_arr
				})
				.then((aaa) => {
					// res_arr.push(a)
					if (aaa.length === loopCount) {
						aaa.map((a) => sendReplyMessage(a))
						setTimeout(() => {
							// sendReplyMessage('all DONE')

							const getCount = (status: '200' | 'bad') =>
								res_arr_distr
									.map((e) =>
										e
											.map((ee) =>
												ee.status === status
													? [ee.linkName, ee.status]
													: undefined
											)
											.filter((e) => e !== undefined)
									)

									.reduce((prev, curr) => prev.concat(curr))

							const ok = getCount('200')
							const bad = getCount('bad')
							// console.log(bad)

							sendReplyMessage(
								`Готово\n✅  доступные сайты: ${ok.length}\n❌  недоступные сайты: ${bad.length}`
							)
						}, 800)
						clearInterval(bbh)
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
				update(`Проверено: ${checkedCounter} из ${links.length} ${jj}`)
				if (h === cubeMap.length - 1) {
					h = 0
				} else {
					h++
				}
			} catch (error) {}
		}, 250)

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
