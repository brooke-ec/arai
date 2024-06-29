import { messageCommand } from "jellycommands";
import { wrap } from "../../lib/utils";
import { setState } from "./index";

export default messageCommand({
	name: "🔴 Deny Suggestion",
	global: true,

	run: wrap(({ interaction }) => setState(interaction, "denied")),
});
