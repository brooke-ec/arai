import "dotenv/config";
import { JellyCommands } from "jellycommands";
import { IntentsBitField } from "discord.js";

const client = new JellyCommands({
	commands: "src/commands",
	events: "src/events",
	buttons: "src/buttons",

	clientOptions: {
		intents: [IntentsBitField.Flags.Guilds],
	},

	dev: {
		global: process.env.NODE_ENV == "development",
		guilds: ["699972767403081838"],
	},
});

client.login();
