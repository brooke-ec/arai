import { messageCommand } from "jellycommands";
import { wrap } from "../../lib/utils";
import { setState } from "./index";

export default messageCommand({
	name: "🔴 Deny Suggestion",
	guards: { permissions: ["ManageMessages"] },

	guilds: [process.env.GUILD_ID!],

	run: wrap(({ interaction }) => setState(interaction, "denied")),
});
