const Guilds = require("../mongodb/models/guilds");
let current_presence = -1;

module.exports = class DiscordUtils {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Check if the bot has the required permissions
	 * @param {Interaction} interaction - the interaction
	 * @param {Array} permissions - the required permissions
	 * @returns {boolean}
	 */
	async insufficientPermissions(interaction, permissions, channel = interaction.channel) {
		const missingPermissions = permissions.filter(
			permission => !interaction.guild.me.permissionsIn(channel).has(permission)
		);

		// prettier-ignore
		if (missingPermissions[0]) {
			interaction.reply({
				content: `I need the following permissions in ${channel} (\`${channel.id}\`):\n\`${missingPermissions.join("` `")}\``,
				ephemeral: true,
			});
			return true;
		}

		return false;
	}

	/**
	 * Check if a guild member is able to moderate members
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isModerator(member) {
		const settings = await Guilds.findOne({ id: member.guild.id });

		const administratorRole = settings.roles.administrator;
		const moderatorRole = settings.roles.moderator;

		if (administratorRole) {
			if (member.roles.cache.has(administratorRole)) return true;
		} else if (member.permissions.has("Administrator")) return true;

		if (moderatorRole) {
			if (member.roles.cache.has(moderatorRole)) return true;
		} else if (member.permissions.has("ModerateMembers")) return true;

		return member.id === member.guild.ownerId || config.users.developers.includes(member.id);
	}

	/**
	 * Check if a guild member is an administrator
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isAdministrator(member) {
		const settings = await Guilds.findOne({ id: member.guild.id });
		const administratorRole = settings.roles.administrator;

		if (administratorRole) {
			if (member.roles.cache.has(administratorRole)) return true;
		} else if (member.permissions.has("Administrator")) return true;

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
