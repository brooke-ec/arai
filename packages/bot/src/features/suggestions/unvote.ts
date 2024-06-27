import { getSuggestionId, updateMessage } from "./utils";
import { CHECK, CROSS_RED } from "../../lib/emoji";
import { getMemberId } from "../../lib/utils";
import { pb } from "../../lib/pocketbase";
import { button } from "jellycommands";

export default button({
	id: "unvote",

	async run({ interaction }) {
		try {
			const suggestionId = await getSuggestionId(interaction.message.channelId, interaction.message.id);
			const memberId = await getMemberId(interaction.user);
			const c = pb.collection("suggestionVote");

			const filter = pb.filter("suggestion={:s}&&voter={:m}", { s: suggestionId, m: memberId });
			const vote = await c.getFirstListItem(filter).catch(() => null);

			if (vote === null)
				return await interaction.reply({
					content: `${CROSS_RED} You have not voted for this suggestion.`,
					ephemeral: true,
				});

			await c.delete(vote.id);
			await updateMessage(suggestionId, interaction.message);

			interaction.reply({
				content: `${CHECK} Vote removed!`,
				ephemeral: true,
			});
		} catch (e) {
			console.error(e);
			await interaction.reply({
				content: `${CROSS_RED} There was an error removing your vote for this suggestion.`,
				ephemeral: true,
			});
		}
	},
});
