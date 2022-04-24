const Command = require("../modules/commands/command");

module.exports = class AnnounceCommand extends Command {
	constructor(client) {
		super(client, {
			name: "announce",
			description: "Notify server regarding certain updates",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			permissions: [],
			options: [
				{
					name: "message",
					description: "The message to send",
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
		const message = interaction.options.getString("message");
		const { client } = this;

		client.guilds.cache.forEach(async guild => {
			const owner = await guild.members.fetch(guild.ownerId);

			owner.send(message).catch(() => {
				log.warn(`Failed to send message to ${owner.user.tag}`);
			});
		});

		interaction.reply({
			content: "Message sent to all servers!",
			ephemeral: true
		});
	}
};
