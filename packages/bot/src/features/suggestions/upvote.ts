import { CHECK, CROSS } from "../../lib/emoji";
import { button } from "jellycommands";
import { castVote } from "./utils";

export default button({
	id: "upvote",

	async run({ interaction }) {
		await castVote(interaction, "upvote").catch((e) => {
			interaction.reply({ content: `${CROSS} There was an error voting for this suggestion.`, ephemeral: true });
			console.error(e);
		});

		interaction.reply({
			content: `${CHECK} Suggestion upvoted!`,
			ephemeral: true,
		});
	},
});
