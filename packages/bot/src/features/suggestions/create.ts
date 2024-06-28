import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { SuggestionStateOptions } from "../../lib/pocketbase.d";
import { CROSS_BLUE, DOWNVOTE, UPVOTE } from "../../lib/emoji";
import { getMember, wrap } from "../../lib/utils";
import { pb } from "../../lib/pocketbase";
import { command } from "jellycommands";
import { createEmbed } from "./index";

export default command({
	name: "suggest",
	description: "Create a new suggestion",
	options: [{ name: "content", type: "String", description: "The content of the suggestion.", required: true }],

	global: true,

	run: wrap(async ({ interaction }) => {
		const content = interaction.options.getString("content", true);
		const author = await getMember(interaction.user);

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(new ButtonBuilder().setCustomId("upvote").setEmoji(UPVOTE).setStyle(ButtonStyle.Secondary))
			.addComponents(new ButtonBuilder().setCustomId("downvote").setEmoji(DOWNVOTE).setStyle(ButtonStyle.Secondary))
			.addComponents(new ButtonBuilder().setCustomId("unvote").setEmoji(CROSS_BLUE).setStyle(ButtonStyle.Secondary));

		const message = await interaction.channel?.send({
			embeds: [createEmbed({ content, upvotes: 0, downvotes: 0, state: "open" as SuggestionStateOptions }, author)],
			components: [row],
		});

		await pb
			.collection("suggestionInfo")
			.create({ content, author: author.id, channel: message!.channelId, message: message!.id, state: "open" });

		return "Suggestion created!";
	}),
});
