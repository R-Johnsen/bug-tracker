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
					name: "guild_id",
					description: "The guild to publish commands to",
					type: Command.option_types.STRING,
					required: true
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const guildId = interaction.options.getBoolean("guild_id");
		const { client } = this;

		const guild = client.guilds.cache.get(guildId);

		try {
			client.commands.publish(guild);
			interaction.reply({
				content: `Successfully published commands to the guild "${guild.name}" (\`${guild.id}\`)`,
				ephemeral: true
			});
		} catch {
			interaction.reply({
				content: "Failed to publish commands!",
				ephemeral: true
			});
		}
	}
};
