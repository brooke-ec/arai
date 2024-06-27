import { messageCommand } from "jellycommands";

export default messageCommand({
	name: "Approve Suggestion",
	global: true,

	run: ({ interaction }) => {
		interaction.reply({ content: "Hello World" });
	},
});
