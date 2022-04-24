const Command = require("../modules/commands/command");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = class BotInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "bot-info",
			description: "View info about the bot",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const permissions = interaction.guild.me.permissions.toArray().join("` `") || "None";
		const { client } = this;

		let memberCount = 0;
		client.guilds.cache.forEach(guild => {
			memberCount += guild.memberCount;
		});

		const info = new EmbedBuilder()

			.setColor(config.colors.default)
			.setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
			.setFields([
				{
					name: "Created",
					value: `<t:${parseInt(client.user.createdTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Joined",
					value: `<t:${parseInt(interaction.guild.me.joinedTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Started",
					value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
					inline: true
				},
				{
					name: "Guilds",
					value: client.guilds.cache.size.toString(),
					inline: true
				},
				{
					name: "Channels",
					value: client.channels.cache.size.toString(),
					inline: true
				},
				{
					name: "Members",
					value: memberCount.toString(),
					inline: true
				},
				{
					name: `Permissions (${interaction.guild.me.permissions.toArray().length})`,
					value: `\`${permissions}\``,
					inline: false
				}
			]);

		const githubButton = new ButtonBuilder({})

			.setLabel("GitHub")
			.setStyle(ButtonStyle.Link)
			.setURL("https://github.com/Archasion/bug-tracker");

		const supportButton = new ButtonBuilder({})

			.setLabel("Support")
			.setStyle(ButtonStyle.Link)
			.setURL("https://discord.gg/bTR5qBG");

		// prettier-ignore
		const inviteButton = new ButtonBuilder({})

			.setLabel("Invite")
			.setStyle(ButtonStyle.Link)
			.setURL(
				`https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=274878024704`
			);

		const voteButton = new ButtonBuilder({})

			.setLabel("Vote")
			.setStyle(ButtonStyle.Link)
			.setURL(`https://top.gg/bot/${client.user.id}`);

		const actionRow = new ActionRowBuilder().addComponents([
			githubButton,
			supportButton,
			inviteButton,
			voteButton
		]);

		interaction.reply({
			embeds: [info],
			components: [actionRow],
			ephemeral: true
		});
	}
};
