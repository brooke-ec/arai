import { messageCommand } from "jellycommands";
import { wrap } from "../../lib/utils";
import { setState } from "./index";

export default messageCommand({
	name: "🟢 Approve Suggestion",
	guards: { permissions: ["ManageMessages"] },

	guilds: [process.env.GUILD_ID!],

	run: wrap(({ interaction }) => setState(interaction, "approved")),
});
