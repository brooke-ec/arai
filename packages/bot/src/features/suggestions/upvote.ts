import { button } from "jellycommands";
import { CHECK } from "../../lib/emoji";
import { castVote } from "./utils";

export default button({
	id: "upvote",

	async run({ interaction }) {
		await castVote(interaction, "upvote");

		interaction.reply({
			content: `${CHECK} Suggestion Upvoted!`,
			ephemeral: true,
		});
	},
});
