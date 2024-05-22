import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { syncMember } from "../../lib/utils";
import { pb } from "../../lib/pocketbase";
import { CHECK } from "../../lib/emoji";
import { command } from "jellycommands";
import { createEmbed } from "./utils";

export default command({
	name: "suggest",
	description: "Create a new suggestion",
	options: [{ name: "content", type: "String", description: "The content of the suggestion.", required: true }],

	global: true,

	run: async ({ interaction }) => {
		const content = interaction.options.getString("content", true);
		const author = await syncMember(interaction.user);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder().setCustomId("upvote").setEmoji("⬆️").setStyle(ButtonStyle.Secondary))
			.addComponents(new ButtonBuilder().setCustomId("downvote").setEmoji("⬇️").setStyle(ButtonStyle.Secondary));

		const message = await interaction.channel?.send({
			embeds: [createEmbed({ content, upvotes: 0, downvotes: 0 }, author)],
			components: [row],
		});

		await pb.collection("suggestion").create({ content, author: author.id, message: message!.id });

		interaction.reply({ content: `${CHECK} Suggestion Created`, ephemeral: true });
	},
});
