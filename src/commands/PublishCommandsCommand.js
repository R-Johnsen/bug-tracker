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
			permission_level: 0,
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
		const guildId = interaction.options.getString("guild_id");
		const { client } = this;

		if (interaction.guild.id === guildId) {
			interaction.reply({
				content: "Slash commands have already been published into the server",
				ephemeral: true
			});
			return;
		}

		const guild = client.guilds.cache.get(guildId);

		if (!guild) {
			interaction.reply({
				content: "Invalid guild ID",
				ephemeral: true
			});
			return;
		}

		if (
			guild.ownerId !== interaction.user.id &&
			!(await utils.isDeveloper(interaction.member))
		) {
			interaction.reply({
				content: "You must be the owner of the guild to use this command",
				ephemeral: true
			});
			return;
		}

		client.commands.publish(guild);
		interaction.reply({
			content: `Tried publishing commands to "${guild.name}" (\`${guild.id}\`), if this did not work, please check if you have authorised \`application.commands\``,
			ephemeral: true
		});
	}
};
