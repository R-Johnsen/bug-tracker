const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { ChannelType } = require("discord.js");

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: "channel",
			description: "Manage the channels for the bot",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 2,
			options: [
				{
					name: "action",
					description: "What action to perform",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Set",
							value: "set"
						},
						{
							name: "Reset",
							value: "reset"
						},
						{
							name: "View",
							value: "view"
						}
					]
				},
				{
					name: "type",
					description: "The type of channel to perform the action on",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bug Reports",
							value: "bugs"
						},
						{
							name: "Player Reports",
							value: "reports"
						},
						{
							name: "Suggestions",
							value: "suggestions"
						},
						{
							name: "Archive",
							value: "archive"
						},
						{
							name: "Bot Updates",
							value: "bot_updates"
						}
					]
				},
				{
					name: "channel",
					description: "The channel to perform the action on",
					type: Command.option_types.CHANNEL,
					required: false
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const channel = interaction.options.getChannel("channel");
		const action = interaction.options.getString("action");
		const type = interaction.options.getString("type");

		switch (action) {
			case "set":
				if (!channel) {
					interaction.reply({
						content: "You must specify a channel to set.",
						ephemeral: true
					});
					return;
				}

				if (channel.type !== ChannelType.GuildText) {
					interaction.reply({
						content: "The channel you specified is not a text channel.",
						ephemeral: true
					});
					return;
				}

				if (type === "bugs") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { bugs_channel: channel.id } }
					);
				}

				if (type === "reports") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { reports_channel: channel.id } }
					);
				}

				if (type === "suggestions") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { suggestions_channel: channel.id } }
					);
				}

				if (type === "archive") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { archive_channel: channel.id } }
					);
				}

				if (type === "bot_updates") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { bot_updates_channel: channel.id } }
					);
				}

				interaction.reply({
					content: `The **${type}** channel has been set to ${channel}.`,
					ephemeral: true
				});

				break;

			case "reset":
				if (type === "bugs") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { bugs_channel: null } }
					);
				}

				if (type === "reports") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { reports_channel: null } }
					);
				}

				if (type === "suggestions") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { suggestions_channel: null } }
					);
				}

				if (type === "archive") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { suggestions_channel: null } }
					);
				}

				if (type === "bot_updates") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { bot_updates_channel: null } }
					);
				}

				interaction.reply({
					content: `The **${type}** channel has been reset.`,
					ephemeral: true
				});

				break;

			case "view":
				const settings = await Guilds.findOne({ id: interaction.guildId });
				const channelId = settings[`${type}_channel`];

				// prettier-ignore
				if (!channelId) {
					interaction.reply({
						content: `There is no channel set for **${type}** reports.\nYou can set one using \`/channel set ${type.replace(/_/g, " ")} <channel>\``,
						ephemeral: true
					});
					return;
				}

				// prettier-ignore
				interaction.reply({
					content: `The **${type.replace(/_/g, " ")}** channel is set to <#${channelId}>.`,
					ephemeral: true
				});
		}
	}
};
