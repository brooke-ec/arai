import { wrap } from "../../../lib/utils";
import { button } from "jellycommands";
import { castVote } from "./index";

export default button({
	id: "upvote",

	run: wrap(async ({ interaction }) => {
		await castVote(interaction, "upvote");
		return "Suggestion upvoted!";
	}),
});
