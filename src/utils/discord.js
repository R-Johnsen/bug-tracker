const Guilds = require("../mongodb/models/guilds");
let current_presence = -1;

module.exports = class DiscordUtils {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Check if a guild member is able to moderate members
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isModerator(member) {
		const guild = await Guilds.findOne({ id: member.guild.id });
		const administratorRole = guild.administrator_role;
		const moderatorRole = guild.moderator_role;

		let result = false;

		if (moderatorRole) {
			result = member.roles.cache.has(administratorRole);
		} else {
			result = member.permissions.has("ModerateMembers");
		}

		if (result) return true;

		if (administratorRole) {
			result = member.roles.cache.has(administratorRole);
		} else {
			result = member.permissions.has("Administrator");
		}

		if (result) return true;
		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is an administrator
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isAdministrator(member) {
		const guild = await Guilds.findOne({ id: member.guild.id });
		const administratorRole = guild.administrator_role;

		let result = false;

		if (administratorRole) {
			result = member.roles.cache.has(administratorRole);
		} else {
			result = member.permissions.has("Administrator");
		}

		if (result) return true;
		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is the owner
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isOwner(member) {
		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is a developer
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isDeveloper(member) {
		return config.users.developers.includes(member.id);
	}

	/**
	 * Select a presence from the config
	 * @returns {PresenceData}
	 */
	static selectPresence() {
		const { length } = config.presence.options;
		let num;

		if (length === 0) return {};
		if (length === 1) num = 0;
		else if (config.presence.randomize) num = Math.floor(Math.random() * length);
		else {
			current_presence += 1;
			if (current_presence === length) current_presence = 0;
			num = current_presence;
		}

		const { activity: name, status, type, url } = config.presence.options[num];
		return {
			activities: [{ name, type, url }],
			status
		};
	}
};
