import type { MemberResponse, SuggestionRecord, SuggestionVoteTypeOptions } from "../../lib/pocketbase.d";
import { ButtonInteraction, EmbedBuilder, Message } from "discord.js";
import { getMemberId, upsert } from "../../lib/utils";
import { createProgress } from "./progress";
import { pb } from "../../lib/pocketbase";

export function createEmbed(suggestion: Omit<SuggestionRecord, "channel" | "message" | "author">, author: MemberResponse) {
	let ratio = suggestion.upvotes! / (suggestion.downvotes! + suggestion.upvotes!);
	if (Number.isNaN(ratio)) ratio = 0.5;

	return new EmbedBuilder()
		.setColor(0xa6a6df)
		.setTitle(`Suggestion`)
		.setAuthor({ name: author.name, iconURL: pb.files.getUrl(author, author.avatar) })
		.setDescription(
			`${suggestion.content}\n
↑ ${suggestion.upvotes} ↓ ${suggestion.downvotes} : ${Math.round(ratio * 100)}%
${createProgress(ratio, 13)}`,
		);
}

export async function getSuggestionId(c: string, m: string) {
	const s = await pb.collection("suggestion").getFirstListItem(pb.filter("channel={:c}&&message={:m}", { c, m }));
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
