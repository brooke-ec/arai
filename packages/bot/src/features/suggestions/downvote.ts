import { button } from "jellycommands";

export default button({
	id: "downvote",

	async run({ interaction }) {
		interaction.reply({
			content: "Suggestion Downvoted!",
			ephemeral: true,
		});
	},
});
