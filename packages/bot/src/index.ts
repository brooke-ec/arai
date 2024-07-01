import "dotenv/config";
import { JellyCommands } from "jellycommands";
import { IntentsBitField } from "discord.js";
import eventsource from "eventsource";

// @ts-ignore
globalThis.EventSource = eventsource;

const client = new JellyCommands({
	commands: "src/features",
	events: "src/features",
	buttons: "src/features",

	clientOptions: {
		intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
	},

	dev: {
		global: process.env.NODE_ENV == "development",
		guilds: [process.env.GUILD_ID!],
	},
});

client.login();
