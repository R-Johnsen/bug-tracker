const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder } = require("discord.js");

module.exports = class ConfigCommand extends Command {
	constructor(client) {
		super(client, {
			name: "config",
			description: "View the server configuration",
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
		const settings = await Guilds.findOne({ id: interaction.guild.id });

		const {
			bugs_channel,
			reports_channel,
			archive_channel,
			bot_updates_channel,
			suggestions_channel,
			auto_role,
			moderator_role,
			administrator_role,
			bugs,
			reports,
			suggestions
		} = settings;

		const embed = new EmbedBuilder()

			.setColor(config.colors.default)
			.setAuthor({
				name: `${interaction.guild.name}`,
				iconURL: interaction.guild.iconURL({ dynamic: true })
			})
			.setFields([
				{
					name: "Reports/Suggestions",
					value: (bugs.length + reports.length + suggestions.length).toString(),
					inline: true
				},
				{
					name: "Bug Reports Channel",
					value: `${bugs_channel ? `<#${bugs_channel}>` : "None"}`,
					inline: true
				},
				{
					name: "Player Reports Channel",
					value: `${reports_channel ? `<#${reports_channel}>` : "None"}`,
					inline: true
				},
				{
					name: "Suggestions Channel",
					value: `${suggestions_channel ? `<#${suggestions_channel}>` : "None"}`,
					inline: true
				},
				{
					name: "Archive Channel",
					value: `${archive_channel ? `<#${archive_channel}>` : "None"}`,
					inline: true
				},
				{
					name: "Bot Updates Channel",
					value: `${bot_updates_channel ? `<#${bot_updates_channel}>` : "None"}`,
					inline: true
				},
				{
					name: "Auto Role",
					value: `${auto_role ? `<@&${auto_role}>` : "None"}`,
					inline: true
				},
				{
					name: "Moderator Role",
					value: `${moderator_role ? `<@&${moderator_role}>` : "None"}`,
					inline: true
				},
				{
					name: "Administrator Role",
					value: `${administrator_role ? `<@&${administrator_role}>` : "None"}`,
					inline: true
				}
			]);

		interaction.reply({
			embeds: [embed],
			ephemeral: true
		});
	}
};
