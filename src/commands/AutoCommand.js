const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = class AutoCommand extends Command {
	constructor(client) {
		super(client, {
			name: "auto",
			description: "Configure automated tasks",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 2,
			permissions: [],
			options: [
				{
					name: "thread",
					description: "Automate discussion thread creation",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "type",
							description:
								"The type of messages to create discussion threads for",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Bug Reports",
									value: "bugs"
								},
								{
									name: "Suggestions",
									value: "suggestions"
								}
							]
						},
						{
							name: "enabled",
							description: "Whether or not this task is enabled",
							type: Command.option_types.BOOLEAN,
							required: true
						}
					]
				},
				{
					name: "role",
					description: "Automatically assign role(s) to new members",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "action",
							description: "The action to take",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Add",
									value: "add"
								},
								{
									name: "Remove",
									value: "remove"
								},
								{
									name: "View",
									value: "view"
								}
							]
						},
						{
							name: "role",
							description: "The role you want to assign to new members",
							type: Command.option_types.ROLE,
							required: false
						}
					]
				},
				{
					name: "delete",
					description: "Automatically delete messages in certain channels",
					type: Command.option_types.SUB_COMMAND,
					options: [
						{
							name: "action",
							description: "The action to take",
							type: Command.option_types.STRING,
							required: true,
							choices: [
								{
									name: "Add",
									value: "add"
								},
								{
									name: "Remove",
									value: "remove"
								},
								{
									name: "View",
									value: "view"
								}
							]
						},
						{
							name: "channel",
							description: "The channel you want message to be removed in",
							type: Command.option_types.CHANNEL,
							required: false
						}
					]
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();
		const settings = await Guilds.findOne({ id: interaction.guild.id });

		// ANCHOR Automatic Thread Creation
		if (subCommand === "thread") {
			const enabled = interaction.options.getBoolean("enabled");
			const type = interaction.options.getString("type");

			if (!settings.channels[type]) {
				interaction.reply({
					content: `There is no channel set for ${type}.`,
					ephemeral: true
				});
				return;
			}

			const channelId = settings.channels[type];
			const channel = interaction.guild.channels.cache.get(channelId);

			if (!channel) {
				interaction.reply({
					content: `The channel for ${type} is not valid.`,
					ephemeral: true
				});
				return;
			}

			const generalPermissions = [
				"SendMessages",
				"ViewChannel",
				"ReadMessageHistory",
				"CreatePublicThreads"
			];

			// prettier-ignore
			if (await utils.insufficientPermissions(interaction, generalPermissions, channel)) return;

			// prettier-ignore
			if (settings.auto.thread[type] === enabled) {
				interaction.reply({
					content: `The ${type.slice(0, -1)} discussion thread creation is already ${enabled ? "enabled" : "disabled"}.`,
					ephemeral: true
				});
				return;
			}

			// prettier-ignore
			await Guilds.updateOne({ id: interaction.guild.id }, { [`auto.thread.${type}`]: enabled });

			// prettier-ignore
			interaction.reply({
				content: `The ${type.slice(0, -1)} discussion thread creation has been ${enabled ? "enabled" : "disabled"}.`,
				ephemeral: true
			});
		}

		// SECTION Automatic Message Deletion
		if (subCommand === "delete") {
			const channel = interaction.options.getChannel("channel");
			const action = interaction.options.getString("action");

			switch (action) {
				// ANCHOR Add
				case "add":
					if (!channel) {
						interaction.reply({
							content: "You must specify a channel.",
							ephemeral: true
						});
						return;
					}

					const generalPermissions = [
						"ViewChannel",
						"ReadMessageHistory",
						"ManageMessages"
					];

					// prettier-ignore
					if (await utils.insufficientPermissions(interaction, generalPermissions, channel)) return;

					if (
						channel.type !== ChannelType.GuildText &&
						channel.type !== ChannelType.GuildNews
					) {
						interaction.reply({
							content: "The channel you specified is not a text channel.",
							ephemeral: true
						});
						return;
					}

					if (settings.auto.delete.includes(channel.id)) {
						interaction.reply({
							content: `Messages in ${channel} are already set to be deleted.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guild.id },
						{ $push: { "auto.delete": channel.id } }
					);

					interaction.reply({
						content: `Messages in ${channel} will now be deleted.`,
						ephemeral: true
					});

					break;

				// ANCHOR Remove
				case "remove":
					if (!channel) {
						interaction.reply({
							content: "You must specify a channel.",
							ephemeral: true
						});
						return;
					}

					if (!settings.auto.delete.includes(channel.id)) {
						interaction.reply({
							content: `Messages in ${channel} are not set to be deleted.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guild.id },
						{ $pull: { "auto.delete": channel.id } }
					);

					interaction.reply({
						content: `Messages in ${channel} will no longer be deleted.`,
						ephemeral: true
					});

					break;

				// ANCHOR View
				case "view":
					if (settings.auto.delete.length === 0) {
						interaction.reply({
							content: "There are no channels with automatic message deletion.",
							ephemeral: true
						});
						return;
					}

					const embed = new EmbedBuilder()

						.setColor(config.colors.default)
						.setTitle("Automatic Message Deletion")
						.setFields([
							{
								name: "Channels",
								value: `<#${settings.auto.delete.join("> <#")}>`
							}
						]);

					interaction.reply({
						embeds: [embed],
						ephemeral: true
					});
			}
		}
		// !SECTION

		// SECTION Automatic Role Assignment
		if (subCommand === "role") {
			const action = interaction.options.getString("action");
			const role = interaction.options.getRole("role");

			switch (action) {
				// ANCHOR Add
				case "add":
					if (!role) {
						interaction.reply({
							content: "You must specify a role.",
							ephemeral: true
						});
						return;
					}

					if (!interaction.guild.me.permissions.has("ManageRoles")) {
						interaction.reply({
							content: "I need the `ManageRoles` permission",
							ephemeral: true
						});
						return;
					}

					if (settings.auto.role.includes(role.id)) {
						interaction.reply({
							content: `The ${role} role is already set to be automatically assigned.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guild.id },
						{ $push: { "auto.role": role.id } }
					);

					interaction.reply({
						content: `The ${role} role will now be automatically assigned on join.`,
						ephemeral: true
					});

					break;

				// ANCHOR Remove
				case "remove":
					if (!role) {
						interaction.reply({
							content: "You must specify a role.",
							ephemeral: true
						});
						return;
					}

					if (!settings.auto.role.includes(role.id)) {
						interaction.reply({
							content: `The ${role} role is not set to be automatically assigned.`,
							ephemeral: true
						});
						return;
					}

					await Guilds.updateOne(
						{ id: interaction.guild.id },
						{ $pull: { "auto.role": role.id } }
					);

					interaction.reply({
						content: `The ${role} role will no longer be automatically assigned on join.`,
						ephemeral: true
					});

					break;

				// ANCHOR View
				case "view":
					if (settings.auto.role.length === 0) {
						interaction.reply({
							content: "There are no roles with automatic assignment on join.",
							ephemeral: true
						});
						return;
					}

					const embed = new EmbedBuilder()

						.setColor(config.colors.default)
						.setTitle("Automatic Role Assignment")
						.setFields([
							{
								name: "Roles",
								value: `<@&${settings.auto.role.join("> <@&")}>`
							}
						]);

					interaction.reply({
						embeds: [embed],
						ephemeral: true
					});
			}
		}
		// !SECTION
	}
};
