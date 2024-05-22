import { button } from "jellycommands";
import { CHECK } from "../../lib/emoji";
import { castVote } from "./utils";

export default button({
	id: "downvote",

	async run({ interaction }) {
		await castVote(interaction, "downvote");

		interaction.reply({
			content: `${CHECK} Suggestion Downvoted!`,
			ephemeral: true,
		});
	},
});
