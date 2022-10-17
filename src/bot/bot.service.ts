import { Injectable, OnModuleInit } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { HttpService } from '@nestjs/axios'
import chunk from 'lodash.chunk'

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
		// // Matches "/echo [whatever]"
		// this.bot.onText(/\/echo (.+)/, (msg, match) => {
		// 	// 'msg' is the received Message from Telegram
		// 	// 'match' is the result of executing the regexp above on the text content
		// 	// of the message

		// 	const chatId = msg.chat.id
		// 	const resp = match[1] // the captured "whatever"

		// 	const messageOptions: TelegramBot.SendMessageOptions = {
		// 		reply_markup: inlineKeyboard.getMarkup(),

		// 	}
		// 	// send back the matched "whatever" to the chat
		// 	this.bot.sendMessage(chatId, resp, messageOptions)
		// })

		this.bot.onText(/(.+)/, (msg, match) => {
			// console.log(match.input)
			const chatId = msg.chat.id
			const links = match.input.split(/\r?\n/)
			// // console.log(links)
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

	private async checkLinks(links: string[], chatId: number) {
		// let results: { linkName: string; status: string }[] = []
		const check = async (
			l: string[],
		): Promise<{ linkName: string; status: string }[]> =>
			await Promise.all(
				l.map(async (link): Promise<{ linkName: string; status: string }> => {
					return await this.httpService.axiosRef
						.request({ baseURL: `https://${link}`, timeout: 5000 })
						.then((r) =>
							r.status === 200
								? { linkName: link, status: r.status.toString() }
								: { linkName: link, status: 'unknown errorrrrrr' },
						)
						.catch((er) => ({ linkName: link, status: 'bad' }))
				}),
			)

		const part = chunk(links, 100)
		const results = await Promise.all(part.map((v) => check(v)))

		const i = await Promise.all(
			results.map((arr) =>
				arr.map((o) => `${o.linkName} -- ${o.status}`).join('\n\n'),
			),
		)
		// links.map((link) => {
		// 	// this.httpService.axiosRef
		// 	// 	.request({ baseURL: `https://${link}`, timeout: 5000 })
		// 	// 	.then((r) => {
		// 	// 		if (r.status === 200) {
		// 	// 			results.push({ linkName: link, status: r.status.toString() })
		// 	// 			// this.bot.sendMessage(chatId, `${link} ${r.status.toString()}`)
		// 	// 		}
		// 	// 		// console.log({ link, hh: r })
		// 	// 	})
		// 	// 	.catch((er) => {
		// 	// 		results.push({ linkName: link, status: 'bad' })

		// 	// 		// this.bot.sendMessage(chatId, `${link} bad`)

		// 	// 		// console.log(er)
		// 	// 	})
		// })
		// const r = results.map((o) => `${o.linkName} -- ${o.status}`).join('\n\n')

		i.map((u) => {
			// const messageOptions: TelegramBot.SendMessageOptions = {
			// 	reply_markup: replyKeyboard.getMarkup(),
			// }
			this.bot.sendMessage(chatId, u)
		})
	}
}

// partners.accemedin.com
// www.covid19.accemedin.com
// admin.accemedin.com
// camp.alterraschool.space
// presentation.alterraschool.space
// online.alterraschool.space
// externat.alterraschool.space
// school.angstremua.com
// backend.angstremua.com
// www.aplus.ua
// bcsharks.aplus.ua
// fayna.aplus.ua
// study.atschool.com.ua
// www.voshozdenieschool.com.ua
// zm.jammschool.com.ua
// mail.jammschool.com.ua
// www.online.eurocollegium.com
// mail.eurocollegium.com
// www.cdo.org.ua
// chat.cdo.org.ua
// newbase.cdo.org.ua
// mail.cdo.org.ua
// www.listener.chat.cdo.org.ua
// ntsadtamv.knute.edu.ua
// sertificate.knute.edu.ua
// ldn.knute.edu.ua
// secs.knute.edu.ua
// mia.knute.edu.ua
// bug.knute.edu.ua
// cdn.knute.edu.ua
// mia.adm.knute.edu.ua
// game.optima.school
// kids.optima.school
// courses.ed-era.com
// eu-agreement.ed-era.com
// www.nonviolence.ed-era.com
// ukr-lifehacks.ed-era.com
// biology.ed-era.com
// ican.ed-era.com
// www.entrepreneurship.ed-era.com
// www.cocacola.ed-era.com
// www.verified.ed-era.com
// physics.ed-era.com
// math.ed-era.com
// ukr.ed-era.com
// history.ed-era.com
// anticorruption-lesson.ed-era.com
// english.ed-era.com
// stophate.ed-era.com
// www.leader.ed-era.com
// artmon59.ed-era.com
// zno.ed-era.com
// biomon69.ed-era.com
// geography.ed-era.com
// miyklas.com.ua
// etutorium.com
// smls.com.ua
// nz.ua
// e-schools.info
// shodennik.ua
// videoconferenceukraine.com
// sendpulse.com
// preply.com
// portals.veracross.eu
// sso.mapnwea.org
// psikiev.follettdestiny.com
// moodle.org
// atutor.ca
// classroom.google.com
// new.edmodo.com
// classdojo.com
// docebo.com
// zoom.us
// freeconference.com
// mon.gov.ua
// kno.rada.gov.ua
// don.kyivcity.gov.ua
// www.vin.gov.ua
// voladm.gov.ua
// dn.gov.ua
// adm.dp.gov.ua
// osvita.zt.gov.ua
// deponms.carpathia.gov.ua
// osvita.zoda.gov.ua
// osvita.kr-admin.gov.ua
// oblosvita-lg.gov.ua
// loda.gov.ua
// osvita.odessa.gov.ua
// www.poltav-oblosvita.gov.ua
// www.osvita.sm.gov.ua
// dniokh.gov.ua
// uon.gov.ua
// osvita.adm-km.gov.ua
// www.osvita-cherkasy.gov.ua
// uon.cg.gov.ua
// vin-osvita.gov.ua
// aikom.iea.gov.ua
// pozashkillia.iea.gov.ua
// sport.iea.gov.ua
// academy.nszu.gov.ua
// phc.org.ua
// imzo.gov.ua
// naps.gov.ua
