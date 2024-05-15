import { button } from "jellycommands";

export default button({
	id: "upvote",

	async run({ interaction }) {
		interaction.reply({
			content: "Suggestion Upvoted!",
			ephemeral: true,
		});
	},
});
