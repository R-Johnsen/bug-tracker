const Command = require("../modules/commands/command");

module.exports = class PublishCommandsCommand extends Command {
	constructor(client) {
		super(client, {
			name: "publish-commands",
			description: "Force publish slash commands into the server",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			permissions: [],
			options: [
				{
					name: "all_servers",
					description: "Publish commands to all servers",
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
		const publishToAllServers = interaction.options.getBoolean("all_servers");
		const { client } = this;

		if (publishToAllServers) {
			client.commands.publish();
			interaction.reply({
				content: "Publishing all commands",
				ephemeral: true
			});
		}

		try {
			client.commands.publish(interaction.guild);
			interaction.reply({
				content: "Successfully published commands to this server!",
				ephemeral: true
			});
		} catch {
			interaction.reply({
				content: "Failed to publish commands! Please try again or seek support",
				ephemeral: true
			});
		}
	}
};
