import { abort, getMemberId, wrap } from "../../lib/utils";
import { getSuggestionId, updateMessage } from "./index";
import { pb } from "../../lib/pocketbase";
import { button } from "jellycommands";

export default button({
	id: /suggestion-.{15}-unvote/i,

	run: wrap(async ({ interaction }) => {
		const suggestionId = getSuggestionId(interaction.message);
		const memberId = await getMemberId(interaction.user);
		const c = pb.collection("suggestionVote");

		const filter = pb.filter("suggestion={:s}&&voter={:m}", { s: suggestionId, m: memberId });
		const vote = await c.getFirstListItem(filter).catch(() => null);

		if (vote === null) abort("You have not voted for this suggestion.");

		await c.delete(vote.id);
		await updateMessage(interaction.message);

		return "Vote removed!";
	}),
});
