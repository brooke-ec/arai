import { CHECK, CROSS_RED } from "../../lib/emoji";
import { button } from "jellycommands";
import { castVote } from "./utils";

export default button({
	id: "upvote",

	async run({ interaction }) {
		await castVote(interaction, "upvote").catch(async (e) => {
			console.error(e);
			await interaction.reply({
				content: `${CROSS_RED} There was an error voting for this suggestion.`,
				ephemeral: true,
			});
		});

		if (!interaction.replied)
			interaction.reply({
				content: `${CHECK} Suggestion upvoted!`,
				ephemeral: true,
			});
	},
});
