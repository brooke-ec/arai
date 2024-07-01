import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import type { SuggestionStateOptions } from "../../lib/pocketbase-types";
import { CHECK, CROSS_BLUE, DOWNVOTE, UPVOTE } from "../../lib/emoji";
import { CREATOR, createEmbed } from "./index";
import { getMember } from "../../lib/utils";
import { pb } from "../../lib/pocketbase";
import { event } from "jellycommands";

export default event({
	name: "interactionCreate",

	async run({ client }, interaction) {
		if (!interaction.isModalSubmit() || interaction.customId != "suggestion-create") return;

		const content = interaction.fields.getTextInputValue("content");
		const author = await getMember(interaction.user);

		const info = await pb.collection("suggestionInfo").create({ author: author.id, state: "open", content });
		const prefix = `suggestion-${info.id}-`;

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setCustomId(prefix + "upvote")
				.setEmoji(UPVOTE),
			new ButtonBuilder()
				.setCustomId(prefix + "downvote")
				.setStyle(ButtonStyle.Secondary)
				.setEmoji(DOWNVOTE),
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

		await interaction.reply({ content: `${CHECK} Suggestion created!`, ephemeral: true });

		// Delete old creator message
		const messages = await message.channel.messages.fetch({ limit: 10 });
		for (const [_, message] of messages) {
			if (message.author == client.user && isCreator(message)) await message.delete();
		}

		await message.channel.send(CREATOR);
	},
});

function isCreator(message: Message) {
	try {
		return message.components[0].components[0].customId == "suggestion-create";
	} catch {
		return false;
	}
}
