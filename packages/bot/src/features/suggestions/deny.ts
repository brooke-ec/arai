import { messageCommand } from "jellycommands";
import { setState } from "./utils";

export default messageCommand({
	name: "🔴 Deny Suggestion",
	global: true,

	run: ({ interaction }) => setState(interaction, "denied"),
});
