const Command = require("../modules/commands/command");
const Guilds = require("../mongodb/models/guilds");

module.exports = class RoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: "role",
			description: "Manage the roles for the bot.",
			permissions: [],
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 2,
			options: [
				{
					name: "action",
					description: "What action to perform",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Set",
							value: "set"
						},
						{
							name: "Reset",
							value: "reset"
						},
						{
							name: "View",
							value: "view"
						}
					]
				},
				{
					name: "type",
					description: "The type of role to perform the action on",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Auto Role on Join",
							value: "auto"
						},
						{
							name: "Moderator",
							value: "moderator"
						},
						{
							name: "Administrator",
							value: "administrator"
						}
					]
				},
				{
					name: "role",
					description: "The role to perform the action on",
					type: Command.option_types.ROLE,
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
		const action = interaction.options.getString("action");
		const role = interaction.options.getRole("role");
		const type = interaction.options.getString("type");

		switch (action) {
			case "set":
				if (!role) {
					interaction.reply({
						content: "You must specify a role to set.",
						ephemeral: true
					});
					return;
				}

				if (type === "auto") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { auto_role: role.id } }
					);
				}

				if (type === "moderator") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { moderator_role: role.id } }
					);
				}

				if (type === "administrator") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { administrator_role: role.id } }
					);
				}

				interaction.reply({
					content: `The **${type}** role has been set to ${role}.`,
					ephemeral: true
				});

				break;

			case "reset":
				if (type === "auto") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { auto_role: null } }
					);
				}

				if (type === "moderator") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { moderator_role: null } }
					);
				}

				if (type === "administrator") {
					await Guilds.updateOne(
						{ id: interaction.guildId },
						{ $set: { administrator_role: null } }
					);
				}

				interaction.reply({
					content: `The **${type}** role has been reset.`,
					ephemeral: true
				});

				break;

			case "view":
				const settings = await Guilds.findOne({ id: interaction.guildId });
				const roleId = settings[`${type}_role`];

				if (!roleId) {
					interaction.reply({
						content: `The **${type}** role has not been set.`,
						ephemeral: true
					});
					return;
				}

				interaction.reply({
					content: `The **${type}** role is set to <@&${roleId}>.`,
					ephemeral: true
				});
		}
	}
};
