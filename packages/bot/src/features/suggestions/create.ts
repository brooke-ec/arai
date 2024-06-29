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

		const info = await pb.collection("suggestionInfo").create({ author: author.id, state: "open", content });
		const prefix = `suggestion-${info.id}-`;

		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setCustomId(prefix + "upvote")
					.setEmoji(UPVOTE),
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId(prefix + "downvote")
					.setStyle(ButtonStyle.Secondary)
					.setEmoji(DOWNVOTE),
			)
			.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Secondary)
					.setCustomId(prefix + "unvote")
					.setEmoji(CROSS_BLUE),
			);

		const message = await interaction.channel!.send({
			embeds: [createEmbed({ content, upvotes: 0, downvotes: 0, state: "open" as SuggestionStateOptions }, author)],
			components: [row],
		});

		await message.startThread({ name: content });

		return "Suggestion created!";
	}),
});
