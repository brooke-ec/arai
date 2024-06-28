import { wrap } from "../../../lib/utils";
import { button } from "jellycommands";
import { castVote } from "./index";

export default button({
	id: "downvote",

	run: wrap(async ({ interaction }) => {
		await castVote(interaction, "downvote");
		return "Suggestion downvoted!";
	}),
});
