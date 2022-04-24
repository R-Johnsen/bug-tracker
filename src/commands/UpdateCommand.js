const Command = require("../modules/commands/command");

module.exports = class UpdateCommand extends Command {
	constructor(client) {
		super(client, {
			name: "update",
			description: "View the most recent changes",
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
		interaction.reply({
			content: "Coming soon...",
			ephemeral: true
		});
	}
};
