const EventListener = require("../modules/listeners/listener");
const Guilds = require("../mongodb/models/guilds");

const { EmbedBuilder, Attachment, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

const priorityImage = {
	NONE: new Attachment("images/none-priority.png", "NONE.png"),
	LOW: new Attachment("images/low-priority.png", "LOW.png"),
	MEDIUM: new Attachment("images/medium-priority.png", "MEDIUM.png"),
	HIGH: new Attachment("images/high-priority.png", "HIGH.png")
};

const statusImage = {
	approved: new Attachment("images/status-approved.png", "approved.png"),
	rejected: new Attachment("images/status-rejected.png", "rejected.png")
};

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "interactionCreate" });
	}

	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });
		const { customId } = interaction;
		log.debug(interaction);

		// ANCHOR Slash Commands
		if (interaction.isChatInputCommand()) {
			this.client.commands.handle(interaction);
		}

		// ANCHOR Modals
		else if (interaction.isModalSubmit()) {
			const approveButton = new ButtonBuilder({})

				.setCustomId("approve-report")
				.setLabel("Approve")
				.setStyle(ButtonStyle.Success);

			const rejectButton = new ButtonBuilder({})

				.setCustomId("reject-report")
				.setLabel("Reject")
				.setStyle(ButtonStyle.Danger);

			const discussionThreadButton = new ButtonBuilder({})

				.setCustomId("report-discussion-thread")
				.setLabel("Discussion Thread")
				.setStyle(ButtonStyle.Secondary);

			const archiveButton = new ButtonBuilder({})

				.setCustomId("archive-report")
				.setLabel("Archive")
				.setStyle(ButtonStyle.Secondary);

			const reportPlayerActionRow = new ActionRowBuilder().addComponents([
				approveButton,
				rejectButton,
				archiveButton
			]);

			const reportActionRow = new ActionRowBuilder().addComponents([
				approveButton,
				rejectButton,
				discussionThreadButton,
				archiveButton
			]);

			if (customId === "bot-update-announcement") {
				const title = interaction.fields.getTextInputValue("title");
				const description = interaction.fields.getTextInputValue("description");

				const announcement = new EmbedBuilder()

					.setColor(config.colors.default)
					.setTitle(title)
					.setDescription(description)
					.setTimestamp();

				const publishingGuilds = await Guilds.find({
					bot_updates_channel: { $ne: null }
				});

				interaction.reply({
					content: "Publishing message to guilds...",
					ephemeral: true
				});

				for (const item of publishingGuilds) {
					const announcementChannel = this.client.channels.cache.get(
						item.bot_updates_channel
					);

					if (announcementChannel) {
						announcementChannel.send({
							embeds: [announcement]
						});
						log.info(
							`Published bot update to "${announcementChannel.guild.name}" (${announcementChannel.guild.id})`
						);
					}
				}
			}

			// ANCHOR Report Bug
			if (customId.startsWith("report-bug")) {
				const summary = interaction.fields.getTextInputValue("summary");
				const description = interaction.fields.getTextInputValue("description");
				const specs = interaction.fields.getTextInputValue("specs");
				const priority = customId.split("-")[2].toUpperCase();

				const report = new EmbedBuilder()

					.setFields([
						{
							name: "Summary",
							value: summary,
							inline: false
						},
						{
							name: "Description",
							value: description,
							inline: false
						},
						{
							name: "System Specs",
							value: specs,
							inline: false
						}
					])
					.setColor(config.colors.priority[priority.toLowerCase()])
					.setTitle("Bug Report")
					.setAuthor({ name: `Priority: ${priority}` })
					.setFooter({ text: `#${settings.bugs.length + 1}` })
					.setThumbnail(`attachment://${priority}.png`)
					.setTimestamp();

				interaction.guild.channels.cache
					.get(settings.bugs_channel)
					.send({
						content: `${interaction.member} (\`${interaction.user.tag}\`)`,
						embeds: [report],
						files: [priorityImage[priority]],
						components: [reportActionRow]
					})
					.then(async message => {
						await Guilds.updateOne(
							{ id: interaction.guildId },
							{
								$push: {
									bugs: {
										number: settings.bugs.length + 1,
										messageId: message.id,
										author: interaction.member.id,
										priority,
										summary,
										description,
										specs
									}
								}
							}
						);
					});

				interaction.reply({
					content: "Thank you for your report, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Report Player
			if (customId === "report-player") {
				const player = interaction.fields.getTextInputValue("player");
				const reason = interaction.fields.getTextInputValue("reason");

				const report = new EmbedBuilder()

					.setFields([
						{
							name: "Reported Player",
							value: player,
							inline: false
						},
						{
							name: "Reason",
							value: reason,
							inline: false
						}
					])
					.setColor(config.colors.default)
					.setTitle("Player Report")
					.setFooter({ text: `#${settings.reports.length + 1}` })
					.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
					.setTimestamp();

				interaction.guild.channels.cache
					.get(settings.reports_channel)
					.send({
						content: `${interaction.member} (\`${interaction.user.tag}\`)`,
						embeds: [report],
						components: [reportPlayerActionRow]
					})
					.then(async message => {
						await Guilds.updateOne(
							{ id: interaction.guildId },
							{
								$push: {
									reports: {
										number: settings.reports.length + 1,
										messageId: message.id,
										author: interaction.member.id,
										player,
										reason
									}
								}
							}
						);
					});

				interaction.reply({
					content: "Thank you for your report, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Suggestion
			if (customId === "suggestion") {
				const suggestion = interaction.fields.getTextInputValue("suggestion");

				const embed = new EmbedBuilder()

					.setFields([
						{
							name: "Suggestion",
							value: suggestion,
							inline: false
						}
					])
					.setColor(config.colors.default)
					.setFooter({ text: `#${settings.suggestions.length + 1}` })
					.setThumbnail(interaction.member.user.displayAvatarURL({ dynamic: true }))
					.setTimestamp();

				const suggestionChannel = interaction.guild.channels.cache.get(
					settings.suggestions_channel
				);

				if (!suggestionChannel) {
					interaction.reply({
						content: "The suggestion channel no longer exists.",
						ephemeral: true
					});
					return;
				}

				const suggestingPermissions = [
					"SendMessages",
					"ReadMessageHistory",
					"EmbedLinks",
					"ViewChannel"
				];

				// prettier-ignore
				if (!interaction.guild.me.permissionsIn(suggestionChannel).has(suggestingPermissions)) {
					interaction.reply({
						content: `I need the following permissions in ${suggestionChannel}:\n\`${suggestingPermissions.join("` `")}\``,
						ephemeral: true
					});
					return;
				}

				suggestionChannel
					.send({
						content: `${interaction.member} (\`${interaction.user.tag}\`)`,
						embeds: [embed],
						components: [reportActionRow]
					})
					.then(async message => {
						await Guilds.updateOne(
							{ id: interaction.guildId },
							{
								$push: {
									suggestions: {
										number: settings.suggestions.length + 1,
										messageId: message.id,
										author: interaction.member.id,
										suggestion
									}
								}
							}
						);
					});

				interaction.reply({
					content: "Thank you for your suggestion, we will look into it as soon as possible.",
					ephemeral: true
				});
			}

			// ANCHOR Edit report
			if (customId.startsWith("edit-report")) {
				const type = customId.split("-")[3];

				const channel = interaction.guild.channels.cache.get(
					settings[`${type}_channel`]
				);

				const message = await channel.messages.fetch(customId.split("-")[2]);

				if (!message) {
					interaction.reply({
						content: "The message you are trying to edit does not exist anymore.",
						ephemeral: true
					});
				}

				const embed = message.embeds[0].data;

				embed.fields.forEach(field => {
					const inputLabel = field.name.toLowerCase().replace(/ /g, "-");
					field.value = interaction.fields.getTextInputValue(inputLabel);
				});

				message.edit({
					embeds: [embed]
				});

				interaction.reply({
					content: "Edited",
					ephemeral: true
				});
			}
		}

		// ANCHOR Select Menu
		else if (interaction.isSelectMenu()) {
		}

		// ANCHOR Buttons
		else if (interaction.isButton()) {
			if (customId === "report-discussion-thread") {
				if (!(await utils.isModerator(interaction.member))) {
					if (!settings.moderator_role) {
						interaction.reply({
							content: "You need the `Moderate Members` permission to use this interaction.",
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: `You need the <@&${settings.moderator_role}> role to use this interaction.`,
						ephemeral: true
					});
					return;
				}

				// prettier-ignore
				if (!interaction.guild.me.permissionsIn(interaction.channel).has("CreatePublicThreads")) {
					interaction.reply({
						content: "I don't have the permissions to create a thread (`CreatePublicThreads`)",
						ephemeral: true
					});
					return;
				}

				if (interaction.message.hasThread) {
					interaction.reply({
						content: "This message already has a thread.",
						ephemeral: true
					});
					return;
				}

				let threadName;
				let type;

				for (const item of settings.suggestions) {
					if (item.messageId === interaction.message.id) {
						threadName =
							item.suggestion.length > 97
								? `${item.suggestion.slice(0, 97)}...`
								: item.suggestion;
						type = "suggestion";
						break;
					}
				}

				for (const item of settings.bugs) {
					if (item.messageId === interaction.message.id) {
						threadName =
							item.summary.length > 97
								? `${item.summary.slice(0, 97)}...`
								: item.summary;
						type = "bug";
						break;
					}
				}

				if (!threadName) {
					interaction.reply({
						content: "I couldn't find the information required to make a discussion thread",
						ephemeral: true
					});
					return;
				}

				interaction.message.startThread({
					name: threadName,
					autoArchiveDuration: "MAX",
					reason: "Started a discussion thread for a report/suggestion"
				});

				interaction.reply({
					content: `Started a discussion thread for ${type} **${interaction.message.embeds[0].data.footer.text}**`,
					ephemeral: true
				});
			}

			if (customId === "approve-report" || customId === "reject-report") {
				if (!(await utils.isModerator(interaction.member))) {
					if (!settings.moderator_role) {
						interaction.reply({
							content: "You need the `Moderate Members` permission to use this interaction.",
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: `You need the <@&${settings.moderator_role}> role to use this interaction.`,
						ephemeral: true
					});
					return;
				}

				const embed = interaction.message.embeds[0].data;

				let type;
				switch (embed.title) {
					case "Bug Report":
						type = "bugs";
						break;
					case "Player Report":
						type = "reports";
						break;
					default:
						type = "suggestions";
						break;
				}

				const report = settings[type].find(
					item => item.messageId === interaction.message.id
				);

				let status = "rejected";
				if (customId === "approve-report") status = "approved";

				const file = [];

				if (type === "bugs") {
					if (embed.fields[3]) embed.fields.splice(3, 1);

					embed.thumbnail.url = `attachment://${status}.png`;
					file.push(statusImage[status]);
				}

				if (type === "reports") {
					if (embed.fields[2]) embed.fields.splice(2, 1);
				}

				if (type === "suggestions") {
					if (embed.fields[1]) embed.fields.splice(1, 1);
				}

				embed.color = config.colors.status[status];
				embed.author = { name: `Status: ${status.toUpperCase()}` };

				const disabledButton = new ButtonBuilder({})
					.setCustomId(customId)
					.setLabel(status === "approved" ? "Approve" : "Reject")
					.setStyle(status === "approved" ? ButtonStyle.Success : ButtonStyle.Danger)
					.setDisabled(true);

				const enabledButton = new ButtonBuilder({})
					.setCustomId(status === "approved" ? "reject-report" : "approve-report")
					.setLabel(status === "approved" ? "Reject" : "Approve")
					.setStyle(
						status === "approved" ? ButtonStyle.Danger : ButtonStyle.Success
					);

				// prettier-ignore
				interaction.message.components[0].components[status === "approved" ? 0 : 1] = disabledButton;

				// prettier-ignore
				interaction.message.components[0].components[status === "approved" ? 1 : 0] = enabledButton;

				interaction.message.edit({
					content: interaction.message.content,
					embeds: [embed],
					files: file,
					components: interaction.message.components
				});

				// prettier-ignore
				interaction.reply({
					content: `The ${type.slice(0, -1)} **#${report.number}** has been ${status}.`,
					ephemeral: true
				});
			}

			// ANCHOR Archive
			if (customId === "archive-report") {
				if (!(await utils.isModerator(interaction.member))) {
					if (!settings.moderator_role) {
						interaction.reply({
							content: "You need the `Moderate Members` permission to use this interaction.",
							ephemeral: true
						});
						return;
					}

					interaction.reply({
						content: `You need the <@&${settings.moderator_role}> role to use this interaction.`,
						ephemeral: true
					});
					return;
				}

				if (!settings.archive_channel) {
					interaction.reply({
						content: "There is no channel set for **archiving** reports/suggestions.\nYou can set one using `/channel set archive <channel>`",
						ephemeral: true
					});
					return;
				}

				const { message } = interaction;
				const embed = message.embeds[0].data;

				// prettier-ignore
				if (message.thread) {
					if (!interaction.guild.me.permissionsIn(interaction.channel).has("ManageThreads")) {
						interaction.reply({
							content: "I need the `ManageThreads` permission to archive this report/suggestion.",
							ephemeral: true
						});
						return;
					}

					await message.thread.edit({
						archived: true,
						locked: true
					});
				}

				interaction.guild.channels.cache.get(settings.archive_channel).send({
					content: message.content,
					embeds: message.embeds,
					components: []
				});

				// prettier-ignore
				interaction.reply({
					content: `${embed.title || "Suggestion"} **${embed.footer.text}** has been archived.`,
					ephemeral: true
				});

				message.delete();
			}
		}
	}
};
