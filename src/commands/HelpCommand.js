const Command = require("../modules/commands/command");

const { EmbedBuilder } = require("discord.js");

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: "help",
			description: "List the commands you have access to",
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
		// Check the user's rank
		const isModerator = await utils.isModerator(interaction.member);
		const isAdministrator = await utils.isAdministrator(interaction.member);
		const isOwner = await utils.isOwner(interaction.member);
		const isDeveloper = await utils.isDeveloper(interaction.member);

		const commands = this.manager.commands.filter(command => {
			// Validate the user's permissions
			if (command.permissions.length > 0) {
				return interaction.member.permissions.has(command.permissions);
			}

			if (command.permission_level === 0) return true;

			// Validate the user's rank
			if (
				(command.permission_level === 1 && isModerator) ||
				(command.permission_level === 2 && isAdministrator) ||
				(command.permission_level === 3 && isOwner) ||
				(command.permission_level === 4 && isDeveloper)
			)
				return true;

			return false;
		});

		// Create a list of commands the user has access to
		const listOfCommands = commands.map(command => {
			const description =
				command.description.length > 50
					? command.description.substring(0, 50) + "..."
					: command.description;
			return `**\`/${command.name}\` ·** ${description}`;
		});

		// Respond with the list of commands
		await interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(config.colors.default)
					.setTitle("Help")
					.setDescription("The commands you have access to are listed below.")
					.addFields({ name: "Commands", value: listOfCommands.join("\n") })
			],
			ephemeral: true
		});
	}
};
