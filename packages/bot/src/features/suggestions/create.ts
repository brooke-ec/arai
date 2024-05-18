import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { command } from "jellycommands";
import { createEmbed } from "./util";
import { syncMember } from "../../lib/utils";
import { CHECK } from "../../lib/emoji";

export default command({
	name: "suggest",
	description: "Create a new suggestion",
	options: [
		{ name: "content", type: "String", description: "The content of the suggestion.", required: true },
	],

	global: true,

	run: async ({ interaction }) => {
		const row = new ActionRowBuilder<ButtonBuilder>();

		row.addComponents(
			new ButtonBuilder().setCustomId("upvote").setEmoji("⬆️").setStyle(ButtonStyle.Secondary),
		);

		row.addComponents(
			new ButtonBuilder().setCustomId("downvote").setEmoji("⬇️").setStyle(ButtonStyle.Secondary),
		);

		const content = interaction.options.getString("content", true);
		const author = await syncMember(interaction.user);

		interaction.channel?.send({
			embeds: [createEmbed({ content }, author)],
			components: [row],
		});

		interaction.reply({ content: `${CHECK} Suggestion Created`, ephemeral: true });
	},
});
