import { ButtonInteraction, EmbedBuilder, Message, MessageContextMenuCommandInteraction } from "discord.js";
import { getMemberId, toTitleCase, upsert } from "../../lib/utils";
import { createProgress } from "./progress";
import { pb } from "../../lib/pocketbase";
import type {
	MemberResponse,
	SuggestionRecord,
	SuggestionStateOptions,
	SuggestionVoteTypeOptions,
} from "../../lib/pocketbase.d";
import { CHECK, CROSS_RED } from "../../lib/emoji";

const COLORS: { [k in keyof typeof SuggestionStateOptions]: number } = {
	approved: 0x2ecc71,
	denied: 0xcc3b2e,
	open: 0xa6a6df,
};

export function createEmbed(suggestion: Omit<SuggestionRecord, "author">, author: MemberResponse) {
	let ratio = suggestion.upvotes! / (suggestion.downvotes! + suggestion.upvotes!);
	if (Number.isNaN(ratio)) ratio = 0.5;

	return new EmbedBuilder()
		.setColor(COLORS[suggestion.state])
		.setTitle(`Suggestion ${toTitleCase(suggestion.state)}`)
		.setAuthor({ name: author.name, iconURL: pb.files.getUrl(author, author.avatar) })
		.setDescription(
			`${suggestion.content}\n
↑ ${suggestion.upvotes} ↓ ${suggestion.downvotes} : ${Math.round(ratio * 100)}%
${createProgress(ratio, 13)}`,
		);
}

export async function getSuggestionId(c: string, m: string) {
	const s = await pb.collection("suggestionInfo").getFirstListItem(pb.filter("channel={:c}&&message={:m}", { c, m }));
	return s.id;
}

export async function updateMessage(suggestionId: string, message: Message) {
	const suggestion = await pb.collection("suggestion").getOne(suggestionId, { expand: "author" });
	const author = (suggestion.expand as { author: MemberResponse }).author;
	await message.edit({ embeds: [createEmbed(suggestion, author)] });
}

export async function castVote(interaction: ButtonInteraction, type: keyof typeof SuggestionVoteTypeOptions) {
	const suggestionId = await getSuggestionId(interaction.message.channelId, interaction.message.id);
	const memberId = await getMemberId(interaction.user);

	await upsert(pb.collection("suggestionVote"), { suggestion: suggestionId, voter: memberId, type });

	await updateMessage(suggestionId, interaction.message);
}

export async function setState(
	interaction: MessageContextMenuCommandInteraction,
	state: keyof typeof SuggestionStateOptions,
) {
	const message = interaction.targetMessage;
	const suggestionId = await getSuggestionId(message.channelId, message.id).catch(() => null);

	if (suggestionId === null)
		return await interaction.reply({
			content: `${CROSS_RED} This message is not a suggestion.`,
			ephemeral: true,
		});

	await pb.collection("suggestionInfo").update(suggestionId, { state: state });
	await updateMessage(suggestionId, message);

	interaction.reply({
		content: `${CHECK} Suggestion ${state}!`,
		ephemeral: true,
	});
}
