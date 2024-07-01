import { command } from "jellycommands";
import { wrap } from "../../lib/utils";
import { CREATOR } from "./index";

export default command({
	name: "suggestions",
	description: "Setup suggestions in this channel",
	guards: { permissions: ["ManageChannels"] },

	guilds: [process.env.GUILD_ID!],

	run: wrap(({ interaction }) => interaction.reply(CREATOR)),
});
