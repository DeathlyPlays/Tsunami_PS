/**
 * Miscellaneous commands
 *
 * Fixed/Improved upon by: The Run, HoeenHero, Mystifi and Lord Haji.
 * Some of this code was borrowed from panpawn/jd/other contributors; as
 * such, credits go to them as well.
 * @license MIT license
 */
'use strict';

let fs = require('fs');

let monData;

try {
	monData = fs.readFileSync("data/tsussb-data.txt").toString().split("\n\n");
} catch (e) {
	console.error(e);
}

function getMonData(target) {
	let returnData = null;
	monData.forEach(function (data) {
		if (toId(data.split("\n")[0].split(" - ")[0] || " ") === target) {
			returnData = data.split("\n").map(function (line) {
				return Chat.escapeHTML(line);
			}).join("<br />");
		}
	});
	return returnData;
}
const https = require('https');

function clearRoom(room) {
	let len = (room.log && room.log.length) || 0;
	let users = [];
	while (len--) {
		room.log[len] = '';
	}
	for (let u in room.users) {
		users.push(u);
		Users(u).leaveRoom(room, Users(u).connections[0]);
	}
	len = users.length;
	setTimeout(() => {
		while (len--) {
			Users(users[len]).joinRoom(room, Users(users[len]).connections[0]);
		}
	}, 1000);
}

function getLinkId(msg) {
	msg = msg.split(' ');
	for (let i = 0; i < msg.length; i++) {
		if ((/youtu\.be/i).test(msg[i])) {
			let temp = msg[i].split('/');
			return temp[temp.length - 1];
		} else if ((/youtube\.com/i).test(msg[i])) {
			return msg[i].substring(msg[i].indexOf("=") + 1).replace(".", "");
		}
	}
}

exports.commands = {
	clearall: function (target, room, user) {
		if (!this.can('declare')) return false;
		if (room.battle) return this.sendReply("You cannot clearall in battle rooms.");

		clearRoom(room);

		this.privateModCommand(`(${user.name} used /clearall.)`);
	},

	gclearall: 'globalclearall',
	globalclearall: function (target, room, user) {
		if (!this.can('gdeclare')) return false;

		Rooms.rooms.forEach(room => clearRoom(room));
		Users.users.forEach(user => user.popup('All rooms have been cleared.'));
		this.privateModCommand(`(${user.name} used /globalclearall.)`);
	},

	contact: 'whotocontact',
	wtc: 'whotocontact',
	whotocontact: function (target, room, user) {
		return this.sendReplyBox(
			'<b><u><font color="#008ae6"><h2>Who to Contact</u></b></font></h2>' +
			'<h3>For those who don\'t exactly know who to contact about a certain situation, this guide will help you contact the right person!</h3>' +
			'<hr>' +
			'<b>Global Drivers (%):</b> - Its best to contact a Global Driver if there are any forms of trolling, spamming, or severely negative behavior. If you ever witness this, please contact them as soon as possible. <br />' +
			'<hr>' +
			'<b>Global Moderators (@)</b> - Normally if there are multiple spammers, Global Mods can be contacted to resolve the issue.  <br />' +
			'<hr>' +
			'<b>Global Leaders (&)</b> - Its best to contact a Leader if there are any issues with Global Auth or Room Owners. It is up to the Leaders to make the final decision of any situation reported. At the same time, they also handle requests on appointing Room Owners and creating/deregistering a room. <br />' +
			'<hr>' +
			'<b>Administrators (~)</b> - Administrators are to be contacted if there is a serious issue. This may include sexual harrassment and/or abuse of power from Room Owners as well as Global Staff. Its also important to contact Administrators if there are any bugs within the server system that need to be looked at.  <br />'
		);
	},

	roomlist: function (target, room, user) {
		let header = ['<b><font color="#1aff1a" size="2">Total users connected: ' + Rooms.global.userCount + '</font></b><br />'],
			official = ['<b><font color="#ff9900" size="2"><u>Official Rooms:</u></font></b><br />'],
			nonOfficial = ['<hr><b><u><font color="#005ce6" size="2">Public Rooms:</font></u></b><br />'],
			privateRoom = ['<hr><b><u><font color="#ff0066" size="2">Private Rooms:</font></u></b><br />'],
			groupChats = ['<hr><b><u><font color="#00b386" size="2">Group Chats:</font></u></b><br />'],
			battleRooms = ['<hr><b><u><font color="#cc0000" size="2">Battle Rooms:</font></u></b><br />'];

		let rooms = [];

		Rooms.rooms.forEach(curRoom => {
			if (curRoom.id !== 'global') rooms.push(curRoom.id);
		});

		rooms.sort();

		for (let u in rooms) {
			let curRoom = Rooms(rooms[u]);
			if (curRoom.type === 'battle') {
				battleRooms.push('<a href="/' + curRoom.id + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
			}
			if (curRoom.type === 'chat') {
				if (curRoom.isPersonal) {
					groupChats.push('<a href="/' + curRoom.id + '" class="ilink">' + curRoom.id + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isOfficial) {
					official.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isPrivate) {
					privateRoom.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Chat.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
			}
			if (curRoom.type !== 'battle') nonOfficial.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + curRoom.title + '</a> (' + curRoom.userCount + ')');
		}

		if (!user.can('roomowner')) return this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' '));
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
	},

	hide: 'hideauth',
	hideauth: function (target, room, user) {
		if (!user.can('lock')) return this.sendReply("/hideauth - Access Denied.");
		let tar = ' ';
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target !== '#') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
				}
			} else {
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}
		user.customSymbol = tar;
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
	},
	hidehelp: ["/hide - Hides user's global rank. Requires: & ~"],

	show: 'showauth',
	showauth: function (target, room, user) {
		if (!user.can('lock')) return this.sendReply("/showauth - Access Denied.");
		user.customSymbol = false;
		user.updateIdentity();
		this.sendReply("You have now revealed your auth symbol.");
		this.sendReply("Your symbol has been reset.");
	},
	showhelp: ["/show - Displays user's global rank. Requires: & ~"],

	servercredits: 'credits',
	credits: function (target, room, user) {
		let popup = "|html|" + "<font size=5 color=#0066ff><u><b>Tsunami Credits</b></u></font><br />" +
			"<br />" +
			"<u><b>Server Maintainers:</u></b><br />" +
			"- " + Tsunami.nameColor('Desokoro', true) + " (Server Host, Owner, SysAdmin)<br />" +
			"<br />" +
			"<u><b>Major Contributors:</b></u><br />" +
			"- " + Tsunami.nameColor('HoeenHero', true) + " (Development)<br />" +
			"- " + Tsunami.nameColor('Tsunami Prince', true) + " (Policy Admin)<br />" +
			"- " + Tsunami.nameColor('Insist', true) + " (Development)<br />" +
			"- " + Tsunami.nameColor('Kraken Mare', true) + " (Development)<br />" +
			"<br />" +
			"<u><b>Retired Staff:</b></u><br />" +
			"- " + Tsunami.nameColor('Clue', true) + " (Former Policy & Media Admin)<br />" +
			"<br />" +
			"<u><b>Special Thanks:</b></u><br />" +
			"- Our Staff Members<br />" +
			"- Our Regular Users<br />";
		user.popup(popup);
	},

	rk: 'kick',
	roomkick: 'kick',
	kick: function (target, room, user) {
		if (!target) return this.parse('/help kick');
		if (!this.canTalk() && !user.can('bypassall')) {
			return this.sendReply("You cannot do this while unable to talk.");
		}

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (target.length > 300) return this.errorReply("The reason is too long. It cannot exceed 300 characters.");
		if (!targetUser || !targetUser.connected) return this.sendReply("User \"" + this.targetUsername + "\" not found.");
		if (!this.can('mute', targetUser, room)) return false;
		if (!room.users[targetUser.userid]) return this.errorReply("User \"" + this.targetUsername + "\" is not in this room.");

		this.addModCommand(targetUser.name + " was kicked from the room by " + user.name + ". (" + target + ")");
		targetUser.popup("You were kicked from " + room.id + " by " + user.name + ". (" + target + ")");
		targetUser.leaveRoom(room.id);
	},
	kickhelp: ["/kick - Kick a user out of a room. Requires: % @ # & ~"],

	masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!this.can('pmall')) return false;
		if (!target) return this.parse('/help pmall');

		let pmName = ' Tsunami Server';
		Users.users.forEach(curUser => {
			let message = '|pm|' + pmName + '|' + curUser.getIdentity() + '|' + target;
			curUser.send(message);
		});
	},
	pmallhelp: ["/pmall [message]."],

	staffpm: 'pmallstaff',
	pmstaff: 'pmallstaff',
	pmallstaff: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target) return this.parse('/help pmallstaff');

		let pmName = ' Tsunami Server';

		Users.users.forEach(curUser => {
			if (!curUser.isStaff) return;
			let message = '|pm|' + pmName + '|' + curUser.getIdentity() + '|' + target;
			curUser.send(message);
		});
	},
	pmallstaffhelp: ["/pmallstaff [message]"],

	hc: function (room, user, cmd) {
		return this.parse('/hotpatch chat');
	},

	hf: function (room, user, cmd) {
		return this.parse('/hotpatch formats');
	},

	hb: function (room, user, cmd) {
		return this.parse('/hotpatch battles');
	},

	hv: function (room, user, cmd) {
		return this.parse('/hotpatch validator');
	},

	'!regdate': true,
	regdate: function (target, room, user, connection) {
		if (!target) target = user.name;
		target = toId(target);
		if (target.length < 1 || target.length > 19) {
			return this.sendReply("Usernames can not be less than one character or longer than 19 characters. (Current length: " + target.length + ".)");
		}
		if (!this.runBroadcast()) return;
		Tsunami.regdate(target, date => {
			if (date) {
				this.sendReplyBox(regdateReply(date));
			}
		});

		function regdateReply(date) {
			if (date === 0) {
				return Tsunami.nameColor(target, true) + " <b><font color='red'>is not registered.</font></b>";
			} else {
				let d = new Date(date);
				let MonthNames = ["January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December",
				];
				let DayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
				return Tsunami.nameColor(target, true) + " was registered on <b>" + DayNames[d.getUTCDay()] + ", " + MonthNames[d.getUTCMonth()] + ' ' + d.getUTCDate() + ", " + d.getUTCFullYear() + "</b> at <b>" + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + " UTC.</b>";
			}
			//room.update();
		}
	},
	regdatehelp: ["/regdate - Gets the regdate (register date) of a username."],

	uor: 'usersofrank',
	usersofrank: function (target, room, user) {
		if (!target || !Config.groups[target]) return false;
		if (!this.runBroadcast()) return;
		let names = [];
		Users.users.forEach(user => {
			if (user.group === target) {
				names.push(user.name);
			}
		});
		names = names.sort();
		if (names.length < 1) return this.sendReplyBox('There are no users of the rank <font color="#24678d"><b>' + Chat.escapeHTML(Config.groups[target].name) + '</b></font> currently online.');
		return this.sendReplyBox('There ' + (names.length === 1 ? 'is' : 'are') + ' <font color="#24678d"><b>' + names.length + '</b></font> ' + (names.length === 1 ? 'user' : 'users') + ' with the rank <font color="#24678d"><b>' + Config.groups[target].name + '</b></font> currently online.<br />' + names.join(', '));
	},

	'!tsunamirepo': true,
	tsu: 'tsunamirepo',
	tsur: 'tsunamirepo',
	repo: 'tsunamirepo',
	tsunamirepo: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReply(`|raw|<a href="https://github.com/DesoGit/Tsunami_PS">Tsunami's repo</a>`);
	},
	tsunamirepohelp: ["/tsunamirepo - Links to the Tsunami repository on GitHub."],

	'!seen': true,
	seen: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help seen');
		let targetUser = Users.get(target);
		if (targetUser && targetUser.connected) return this.sendReplyBox(Tsunami.nameColor(targetUser.name, true) + " is <b><font color='limegreen'>Currently Online</b></font>.");
		target = Chat.escapeHTML(target);
		let seen = Db.seen.get(toId(target));
		if (!seen) return this.sendReplyBox(Tsunami.nameColor(target, true) + " has <b><font color='red'>never been online</font></b> on this server.");
		this.sendReplyBox(Tsunami.nameColor(target, true) + " was last seen <b>" + Chat.toDurationString(Date.now() - seen, {precision: true}) + "</b> ago.");
	},
	seenhelp: ["/seen - Shows when the user last connected on the server."],

	tell: function (target, room, user, connection) {
		if (!target) return this.parse('/help tell');
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!target) {
			this.sendReply("You forgot the comma.");
			return this.parse('/help tell');
		}

		if (targetUser && targetUser.connected) {
			return this.parse('/pm ' + this.targetUsername + ', ' + target);
		}

		if (user.locked) return this.popupReply("You may not send offline messages when locked.");
		if (target.length > 255) return this.popupReply("Your message is too long to be sent as an offline message (>255 characters).");

		if (Config.tellrank === 'autoconfirmed' && !user.autoconfirmed) {
			return this.popupReply("You must be autoconfirmed to send an offline message.");
		} else if (!Config.tellrank || Config.groupsranking.indexOf(user.group) < Config.groupsranking.indexOf(Config.tellrank)) {
			return this.popupReply("You cannot send an offline message because offline messaging is " +
				(!Config.tellrank ? "disabled" : "only available to users of rank " + Config.tellrank + " and above") + ".");
		}

		let userid = toId(this.targetUsername);
		if (userid.length > 18) return this.popupReply("\"" + this.targetUsername + "\" is not a legal username.");

		let sendSuccess = Tells.addTell(user, userid, target);
		if (!sendSuccess) {
			if (sendSuccess === false) {
				return this.popupReply("User " + this.targetUsername + " has too many offline messages queued.");
			} else {
				return this.popupReply("You have too many outgoing offline messages queued. Please wait until some have been received or have expired.");
			}
		}
		return connection.send('|pm|' + user.getIdentity() + '|' +
			(targetUser ? targetUser.getIdentity() : ' ' + this.targetUsername) +
			"|/text This user is currently offline. Your message will be delivered when they are next online.");
	},
	tellhelp: ["/tell [username], [message] - Send a message to an offline user that will be received when they log in."],

	usetoken: function (target, room, user, connection, cmd, message) {
		target = target.split(',');
		if (target.length < 2) return this.parse('/help usetoken');
		target[0] = toId(target[0]);
		if (target[0] === 'intro') target[0] = 'disableintroscroll';
		let msg = '';
		if (['avatar', 'declare', 'icon', 'color', 'emote', 'title', 'disableintroscroll'].indexOf(target[0]) === -1) return this.parse('/help usetoken');
		if (!user.tokens || !user.tokens[target[0]]) return this.errorReply('You need to buy this from the shop first.');
		target[1] = target[1].trim();

		switch (target[0]) {
		case 'avatar':
			msg = '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeemed a avatar token.<br/><img src="' + target[1] + '" alt="avatar"/><br/>';
			msg += '<button class="button" name="send" value="/customavatar set ' + user.userid + ', ' + target[1] + '">Apply Avatar</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'declare':
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeemed a global declare token.<br/> Message: ' + target[1] + "<br/>";
			msg += '<button class="button" name="send" value="/globaldeclare ' + target[1] + '">Globally Declare the Message</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'color':
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeemed a custom color token.<br/> hex color: <span' + target[1] + '<br/>';
			msg += '<button class="button" name="send" value="/customcolor set ' + user.name + ',' + target[1] + '">Set color (<b><font color="' + target[1] + '">' + target[1] + '</font></b>)</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'icon':
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeemed a icon token.<br/><img src="' + target[1] + '" alt="icon"/><br/>';
			msg += '<button class="button" name="send" value="/customicon set ' + user.userid + ', ' + target[1] + '">Apply icon</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'title':
			if (!target[2]) return this.errorReply('/usetoken title, [name], [hex code]');
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeem a title token.<br/> title name: ' + target[1] + '<br/>';
			msg += '<button class="button" name="send" value="/customtitle set ' + user.userid + ', ' + target[1] + ', ' + target[2] + '">Set title (<b><font color="' + target[2] + '">' + target[2] + '</font></b>)</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'emote':
			if (!target[2]) return this.errorReply('/usetoken emote, [name], [img]');
			target[2] = target[2].trim();
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeem a emote token.<br/><img src="' + target[2] + '" alt="' + target[1] + '"/><br/>';
			msg += '<button class="button" name="send" value="/emote add, ' + target[1] + ', ' + target[2] + '">Add emote</button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		case 'disableintroscroll':
			if (!target[1]) return this.errorReply('/usetoken disableintroscroll, [room]');
			let roomid = toId(target[1]);
			if (!Rooms(roomid)) return this.errorReply(`${roomid} is not a room.`);
			if (Db.disabledScrolls.has(roomid)) return this.errorReply(`${Rooms(roomid).title} has already roomintro scroll disabled.`);
			msg += '/html <center>' + Tsunami.nameColor(user.name, true) + ' has redeemed roomintro scroll disabler token.<br/>';
			msg += '<button class="button" name="send" value="/disableintroscroll ' + target[1] + '">Disable Intro Scrool for <b>' + Rooms(roomid).title + '</b></button></center>';
			delete user.tokens[target[0]];
			return Tsunami.messageSeniorStaff(msg);
		default:
			return this.errorReply('An error occured in the command.'); // This should never happen.
		}
	},
	usetokenhelp: [
		'/usetoken [token], [argument(s)] - Redeem a token from the shop. Accepts the following arguments: ',
		'/usetoken avatar, [image] | /usetoken declare, [message] | /usetoken color, [hex code]',
		'/usetoken icon [image] | /usetoken title, [name], [hex code] | /usetoken emote, [name], [image]',
		'/usetoken disableintroscroll [room name]',
	],

	bonus: 'dailybonus',
	checkbonus: 'dailybonus',
	dailybonus: function (target, room, user) {
		let obj = Db.DailyBonus.get(user.latestIp, [1, Date.now()]);
		let nextBonus = Date.now() - obj[1];
		if ((86400000 - nextBonus) <= 0) return Tsunami.giveDailyReward(user);
		return this.sendReply('Your next bonus is ' + obj[0] + ' ' + (obj[0] === 1 ? currencyName : currencyPlural) + ' in ' + Chat.toDurationString(Math.abs(86400000 - nextBonus)));
	},

	etour: function (target, room, user) {
		if (!target) return this.parse("/help etour");
		this.parse("/tour create " + target + ", elimination");
	},
	etourhelp: ["/etour [format] - Creates a single elimination tournament in the format provided."],

	rtour: function (target, room, user) {
		if (!target) return this.parse("/help rtour");
		this.parse("/tour create " + target + ", roundrobin");
	},
	rtourhelp: ["/rtour [format] - Creates a round robin tournament in the format provided."],

	disableintroscroll: function (target, room, user) {
		if (!this.can('roomowner')) return false;
		if (!target) return this.errorReply("No Room Specified");
		target = toId(target);
		if (!Rooms(target)) return this.errorReply(`${target} is not a room`);
		if (Db.disabledScrolls.has(target)) return this.errorReply(`${Rooms(target).title} has roomintro scroll disabled.`);
		Db.disabledScrolls.set(target, true);
		Monitor.adminlog(user.name + ` has disabled the roomintro scroll bar for ${Rooms(target).title}.`);
	},

	disableintroscrollhelp: ["/disableintroscroll [room] - Disables scroll bar preset in the room's roomintro."],
	enableintroscroll: function (target, room, user) {
		if (!this.can('roomowner')) return false;
		if (!target) return this.errorReply("No Room Specified");
		target = toId(target);
		if (!Rooms(target)) return this.errorReply(`${target} is not a room`);
		if (!Db.disabledScrolls.has(target)) return this.errorReply(`${Rooms(target).title} has roomintro scroll enabled.`);
		Db.disabledScrolls.remove(target);
		Monitor.adminlog(user.name + ` has enabled the roomintro scroll bar for ${Rooms(target).title}.`);
	},
	enableintroscrollhelp: ["/enableintroscroll [room] - Enables scroll bar preset in the room's roomintro."],

	'!tsussb': true,
	tsussb: function (target, room, user) {
		if (!this.runBroadcast()) return false;
		if (!target || target === 'help') return this.parse('/help tsussb');
		let targetData = getMonData(toId(target));
		if (toId(target) === toId('krakenmare')) return this.sendReplyBox(getMonData('callieagent1'));
		if (toId(target) === toId('c7')) return this.sendReplyBox(getMonData('c733937123'));
		if (!targetData) return this.errorReply("The staffmon '" + toId(target) + "' could not be found.");
		return this.sendReplyBox(targetData);
	},
	tsussbhelp: ["/tsussb (staffmon name) - Gives details on a staffmon from Tsunami SSB."],

	pmroom: 'rmall',
	roompm: 'rmall',
	rmall: function (target, room, user) {
		if (!this.can('declare', null, room)) return this.errorReply("/rmall - Access denied.");
		if (!target) return this.sendReply("/rmall [message] - Sends a pm to all users in the room.");
		target = target.replace(/<(?:.|\n)*?>/gm, '');

		let pmName = ' Tsunami Server';

		for (let i in room.users) {
			let message = '|pm|' + pmName + '|' + room.users[i].getIdentity() + '| ' + target;
			room.users[i].send(message);
		}
		this.privateModCommand('(' + Chat.escapeHTML(user.name) + ' mass room PM\'ed: ' + target + ')');
	},

	fj: 'forcejoin',
	forcejoin: function (target, room, user) {
		if (!user.can('root')) return false;
		if (!target) return this.parse('/help forcejoin');
		let parts = target.split(',');
		if (!parts[0] || !parts[1]) return this.parse('/help forcejoin');
		let userid = toId(parts[0]);
		let roomid = toId(parts[1]);
		if (!Users.get(userid)) return this.sendReply("User not found.");
		if (!Rooms.get(roomid)) return this.sendReply("Room not found.");
		Users.get(userid).joinRoom(roomid);
	},
	forcejoinhelp: ["/forcejoin [target], [room] - Forces a user to join a room"],

	//Credits to OCPU for this run play function
	'!dub': true,
	dub: 'dubtrack',
	music: 'dubtrack',
	radio: 'dubtrack',
	dubtrackfm: 'dubtrack',
	dubtrack: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let nowPlaying = "";
		let options = {
			host: 'api.dubtrack.fm',
			port: 443,
			path: '/room/lavender-radio-tower',
			method: 'GET',
		};
		https.get(options, res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				if (data.charAt(0) === '{') {
					data = JSON.parse(data);
					if (data['data'] && data['data']['currentSong']) nowPlaying = "<br /><b>Now Playing:</b> " + Chat.escapeHTML(data['data']['currentSong'].name);
				}
				this.sendReplyBox('Join our dubtrack.fm room <a href="https://www.dubtrack.fm/join/lavender-radio-tower">here!</a>' + nowPlaying);
				room.update();
			});
		});
	},

	'!discord': true,
	discord: function () {
		if (!this.runBroadcast()) return;
		this.sendReplyBox("<a href=\"https://discord.gg/qRvnKBJ\">The Official Tsunami Discord</a>");
	},

	'!tsumeta': true,
	tsumeta: function () {
		if (!this.runBroadcast()) return;
		this.sendReplyBox("<a href=\"http://tsunamips.weebly.com/tsumeta.html\">The Official TsuMeta Website</a>");
	},

	'!youtube': true,
	yt: 'youtube',
	youtube: function (target, room, user) {
		if (!this.runBroadcast()) return false;
		if (!target) return false;
		let params_spl = target.split(' '), g = ' ';
		for (let i = 0; i < params_spl.length; i++) {
			g += '+' + params_spl[i];
		}
		g = g.substr(1);

		let reqOpts = {
			hostname: 'www.googleapis.com',
			method: 'GET',
			path: '/youtube/v3/search?part=snippet&q=' + g + '&type=video&key=AIzaSyA4fgl5OuqrgLE1B7v8IWYr3rdpTGkTmns',
			headers: {
				'Content-Type': 'application/json',
			},
		};

		let self = this;
		let data = '';
		let req = require('https').request(reqOpts, function (res) {
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function (chunk) {
				let d = JSON.parse(data);
				if (d.pageInfo.totalResults === 0) {
					room.add('No videos found');
					room.update();
					return false;
				}
				let id = getLinkId(target);
				const image = '<button style="background: none; border: none;"><img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg?custom=true&w=168&h=94&stc=true&jpg444=true&jpgq=90&sp=68&sigh=tbq7TDTjFXD_0RtlFUMGz-k3JiQ" height="180" width="180"></button>';
				self.sendReplyBox('<center>' + image + '<br><a href="https://www.youtube.com/watch?v=' + d.items[0].id.videoId + '"><b> ' + d.items[0].snippet.title + '</b></center>');
				room.update();
			});
		});
		req.end();
	},
	'!digidex': true,
	dd: 'digidex',
	dg: 'digidex',
	digidex: function (target) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse("/help digidex");
		if (this.broadcasting) {
			this.parse("!dt " + target + ", digimon");
		} else {
			this.parse("/dt " + target + ", digimon");
		}
	},
	digidexhelp: ["/digidex [Digimon] - Checks for a Digimon's data from Digimon Showdown."],
};
