const EventListener = require("../modules/listeners/listener");
const Guilds = require("../mongodb/models/guilds");

module.exports = class ReadyEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: "ready",
			once: true
		});
	}

	async execute() {
		log.success(
			`Connected to Discord as "${this.client.user.tag}" in ${this.client.guilds.cache.size} servers`
		);
		log.info("Loading commands");

		this.client.commands.load();
		this.client.commands.publish();

		// Presence
		if (config.presence.options.length > 1) {
			const { selectPresence } = require("../utils/discord");
			setInterval(() => {
				const presence = selectPresence();
				this.client.user.setPresence(presence);
			}, config.presence.duration * 1000);
		}

		this.client.guilds.cache.forEach(guild => {
			Guilds.findOne({ id: guild.id }, (err, settings) => {
				if (err) {
					log.error(err);
					return;
				}

				if (!settings) {
					const newGuild = new Guilds({ id: guild.id });
					newGuild.save().then(() => {
						log.info(
							`Created new guild configuration: ${guild.name} - ${guild.id}`
						);
					});
				}
			});
		});
	}
};
