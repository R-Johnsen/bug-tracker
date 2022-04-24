const EventListener = require("../modules/listeners/listener");

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: "messageCreate" });
	}

	async execute(message) {
		if (!message.guild) return;
		if (message.author.bot) return;
	}
};
