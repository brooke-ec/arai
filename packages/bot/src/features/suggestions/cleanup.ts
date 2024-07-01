import { pb } from "../../lib/pocketbase";
import { getSuggestionId } from "./index";
import { event } from "jellycommands";

export default event({
	name: "messageDelete",

	run: async (_, message) => {
		if (message.partial) return;
		const suggestionId = getSuggestionId(message);
		if (suggestionId === null) return;

		message.thread?.delete();
		pb.collection("suggestionInfo").delete(suggestionId);
	},
});
