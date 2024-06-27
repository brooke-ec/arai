import { CHECK, CROSS_RED } from "../../lib/emoji";
import { button } from "jellycommands";
import { castVote } from "./utils";

export default button({
	id: "upvote",

	async run({ interaction }) {
		try {
			await castVote(interaction, "upvote");
			interaction.reply({
				content: `${CHECK} Suggestion upvoted!`,
				ephemeral: true,
			});
		} catch (e) {
			console.error(e);
			await interaction.reply({
				content: `${CROSS_RED} There was an error voting for this suggestion.`,
				ephemeral: true,
			});
		}
	},
});
