import type { MemberResponse, SuggestionRecord, SuggestionVoteTypeOptions } from "../../lib/pocketbase.d";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { syncMember, upsert } from "../../lib/utils";
import { createProgress } from "./progress";
import { pb } from "../../lib/pocketbase";

export function createEmbed(suggestion: Omit<SuggestionRecord, "message" | "author">, author: MemberResponse) {
	const ratio = suggestion.upvotes! / (suggestion.downvotes! + suggestion.upvotes!);

	return new EmbedBuilder()
		.setColor(0xa6a6df)
		.setTitle(`Suggestion #${1}`)
		.setAuthor({ name: author.name, iconURL: pb.files.getUrl(author, author.avatar) })
		.setDescription(
			`${suggestion.content}\n
↑ ${suggestion.upvotes} ↓ ${suggestion.downvotes} : ${Math.round(ratio * 100)}%
${createProgress(ratio, 13)}`,
		);
}

export async function castVote(interaction: ButtonInteraction, type: keyof typeof SuggestionVoteTypeOptions) {
	const c = pb.collection("suggestion");

	const suggestionId = (await c.getFirstListItem(pb.filter("message={:m}", { m: interaction.message.id }))).id;
	const memberId = (await syncMember(interaction.user)).id;

	await upsert(pb.collection("suggestionVote"), { suggestion: suggestionId, voter: memberId, type });

	const suggestion = await c.getOne(suggestionId, { expand: "author" });
	const author = (suggestion.expand as { author: MemberResponse }).author;
	await interaction.message.edit({ embeds: [createEmbed(suggestion, author)] });
}
