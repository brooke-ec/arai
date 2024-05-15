import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { command } from "jellycommands";

export default command({
	name: "suggest",
	description: "Create a new suggestion",

	global: true,

	run: ({ interaction }) => {
		const row = new ActionRowBuilder<ButtonBuilder>();

		row.addComponents(
			new ButtonBuilder().setCustomId("upvote").setEmoji("⬆️").setStyle(ButtonStyle.Secondary),
		);

		row.addComponents(
			new ButtonBuilder().setCustomId("downvote").setEmoji("⬇️").setStyle(ButtonStyle.Secondary),
		);

		interaction.reply({
			content: "New Suggestion",
			components: [row],
		});
	},
});
