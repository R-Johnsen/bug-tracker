const EventListener = require("../modules/listeners/listener");
const Guilds = require("../mongodb/models/guilds");

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "messageCreate" });
	}

	async execute(message) {
		const settings = await Guilds.findOne({ id: message.guild.id });
		if (settings.auto.delete.includes(message.channel.id) && !message.author.bot)
			message.delete();
	}
};
