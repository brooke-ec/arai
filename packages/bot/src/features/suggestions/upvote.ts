import { CHECK, CROSS } from "../../lib/emoji";
import { button } from "jellycommands";
import { castVote } from "./utils";

export default button({
	id: "upvote",

	async run({ interaction }) {
		await castVote(interaction, "upvote").catch(async (e) => {
			console.error(e);
			await interaction.reply({
				content: `${CROSS} There was an error voting for this suggestion.`,
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
