const Command = require("../modules/commands/command");

module.exports = class GuideCommand extends Command {
	constructor(client) {
		super(client, {
			name: "guide",
			description: "View the guides for reports and suggestions",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 0,
			permissions: [],
			options: [
				{
					name: "guide",
					description: "The guide you want to view",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "How to Report Bugs",
							value: "bugs"
						},
						{
							name: "How to Report Player",
							value: "player"
						},
						{
							name: "How to Suggest",
							value: "suggest"
						}
					]
				},
				{
					name: "public",
					description: "Whether or not the guide should be sent publicly",
					type: Command.option_types.BOOLEAN,
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
		let publicMessage = interaction.options.getBoolean("public") || false;
		if (!(await utils.isModerator(interaction.member)) && publicMessage) publicMessage = false;

		interaction.reply({
			content: "Coming soon...",
			ephemeral: !publicMessage
		});
	}
};
