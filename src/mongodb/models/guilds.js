const mongoose = require("mongoose");
const { Schema } = mongoose;

const guildSchema = new Schema({
	id: {
		type: String,
		required: true
	},
	bugs: {
		type: Array,
		default: []
	},
	reports: {
		type: Array,
		default: []
	},
	suggestions: {
		type: Array,
		default: []
	},
	auto: {
		type: Object,
		default: {
			thread: {
				bugs: false,
				suggestions: false
			},
			delete: [],
			role: []
		}
	},
	roles: {
		type: Object,
		default: {
			moderator: null,
			administrator: null
		}
	},
	bugs_channel: {
		type: String,
		default: null
	},
	reports_channel: {
		type: String,
		default: null
	},
	suggestions_channel: {
		type: String,
		default: null
	},
	archive_channel: {
		type: String,
		default: null
	},
	bot_updates_channel: {
		type: String,
		default: null
	}
});

const Guilds = mongoose.model("Guilds", guildSchema);
module.exports = Guilds;
