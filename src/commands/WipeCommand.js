const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

module.exports = class WipeCommand extends Command {
	constructor(client) {
		super(client, {
			name: "wipe",
			description: "Wipe certain/all data from the database",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 3,
			permissions: [],
			options: [
				{
					name: "type",
					description: "The data you want to wipe",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Bug Reports",
							value: "bug"
						},
						{
							name: "Player Reports",
							value: "report"
						},
						{
							name: "Suggestions",
							value: "suggestion"
						},
						{
							name: "Channels",
							value: "channel"
						},
						{
							name: "Roles",
							value: "role"
						},
						{
							name: "Everything",
							value: "all"
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
		const type = interaction.options.getString("type");

		if (type === "bug" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { bugs: [] } });

		if (type === "report" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { reports: [] } });

		if (type === "suggestion" || type === "all")
			await Guilds.updateOne({ id: interaction.guildId }, { $set: { suggestions: [] } });

		if (type === "channel" || type === "all") {
			await Guilds.updateOne(
				{ id: interaction.guildId },
				{
					$set: {
						bugs_channel: null,
						reports_channel: null,
						suggestions_channel: null,
						archive_channel: null,
						bot_updates_channel: null
					}
				}
			);
		}

		if (type === "role" || type === "all") {
			await Guilds.updateOne(
				{ id: interaction.guildId },
				{
					$set: {
						moderator_role: null,
						administrator_role: null,
						auto_role: null
					}
				}
			);
		}

		// prettier-ignore
		interaction.reply({
			content: `Successfully wiped all${type !== "all" ? ` ${type}` : ""} data from the database!`,
			ephemeral: true
		});
	}
};
