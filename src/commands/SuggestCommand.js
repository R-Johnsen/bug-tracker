const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = class SuggestCommand extends Command {
	constructor(client) {
		super(client, {
			name: "suggest",
			description: "Create a new suggestion",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			options: []
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await Guilds.findOne({ id: interaction.guildId });

		let submissionChannel;

		const suggestion = new TextInputBuilder()

			.setCustomId("suggestion")
			.setLabel("Suggestion")
			.setMinLength(6)
			.setMaxLength(1024)
			.setPlaceholder("Please enter your suggestion...")
			.setRequired(true)
			.setValue("")
			.setStyle(TextInputStyle.Paragraph);

		if (settings.suggestions_channel) {
			submissionChannel = interaction.guild.channels.cache.get(settings.suggestions_channel);
		}

		const form = new ModalBuilder().setCustomId("suggestion").setTitle("Suggestion");

		if (!submissionChannel) {
			interaction.reply({
				content: "There is no channel set for **suggestions**.\nPlease set one using `/channel set suggestions <channel>`",
				ephemeral: true
			});
			return;
		}

		const actionRow = new ActionRowBuilder().addComponents(suggestion);

		form.addComponents(actionRow);
		await interaction.showModal(form);
	}
};
