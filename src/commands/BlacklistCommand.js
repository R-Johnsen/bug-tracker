const Command = require("../modules/commands/command");
const Dev = require("../mongodb/models/dev");

module.exports = class BlacklistCommand extends Command {
	constructor(client) {
		super(client, {
			name: "blacklist",
			description: "Blacklist certain servers/roles/users from using the bot",
			ignored: {
				roles: [],
				channels: [],
				threads: []
			},
			permission_level: 4,
			permissions: [],
			options: [
				{
					name: "action",
					description: "The action to perform",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Add",
							value: "add"
						},
						{
							name: "Remove",
							value: "remove"
						}
					]
				},
				{
					name: "type",
					description: "The item to blacklist",
					type: Command.option_types.STRING,
					required: true,
					choices: [
						{
							name: "Guild",
							value: "guilds"
						},
						{
							name: "Role",
							value: "roles"
						},
						{
							name: "User",
							value: "users"
						}
					]
				},
				{
					name: "id",
					description: "The id of the item to blacklist",
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
		const action = interaction.options.getString("action");
		const type = interaction.options.getString("type");
		const id = interaction.options.getString("id");

		const { blacklist } = await Dev.findOne({});

		if (action === "remove") {
			if (!blacklist[type].includes(id)) {
				interaction.reply({
					content: `The ${type.slice(0, -1)} is not blacklisted`,
					ephemeral: true
				});
				return;
			}

			const item = `blacklist.${type}`;

			await Dev.updateOne({}, { $pull: { [item]: id } }).then(() => {
				interaction.reply({
					content: `The ${type.slice(0, -1)} has been removed from the blacklist`,
					ephemeral: true
				});
			});
		}

		if (action === "add") {
			if (blacklist[type].includes(id)) {
				interaction.reply({
					content: `The ${type.slice(0, -1)} is already blacklisted`,
					ephemeral: true
				});
				return;
			}

			const item = `blacklist.${type}`;

			await Dev.updateOne({}, { $push: { [item]: id } }).then(() => {
				interaction.reply({
					content: `The ${type.slice(0, -1)} has been added to the blacklist`,
					ephemeral: true
				});
			});
		}
	}
};
