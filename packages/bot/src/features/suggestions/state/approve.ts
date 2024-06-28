import { messageCommand } from "jellycommands";
import { wrap } from "../../../lib/utils";
import { setState } from "./index";

export default messageCommand({
	name: "🟢 Approve Suggestion",
	global: true,

	run: wrap(({ interaction }) => setState(interaction, "approved")),
});
