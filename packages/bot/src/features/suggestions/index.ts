import type { MemberResponse, SuggestionRecord } from "../../lib/pocketbase.d";
import { EmbedBuilder, Message } from "discord.js";
import { toTitleCase } from "../../lib/utils";
import { STATE_COLOR } from "./state/index";
import { createProgress } from "./progress";
import { pb } from "../../lib/pocketbase";

export function createEmbed(suggestion: Omit<SuggestionRecord, "author" | "thread">, author: MemberResponse) {
	let ratio = suggestion.upvotes! / (suggestion.downvotes! + suggestion.upvotes!);
	if (Number.isNaN(ratio)) ratio = 0.5;

	return new EmbedBuilder()
		.setColor(STATE_COLOR[suggestion.state])
		.setTitle(`Suggestion ${toTitleCase(suggestion.state)}`)
		.setAuthor({ name: author.name, iconURL: pb.files.getUrl(author, author.avatar) })
		.setDescription(
			`${suggestion.content}\n
↑ ${suggestion.upvotes} ↓ ${suggestion.downvotes} : ${Math.round(ratio * 100)}%
${createProgress(ratio, 13)}`,
		);
}

export const getSuggestion = (c: string, m: string) =>
	pb.collection("suggestionInfo").getFirstListItem(pb.filter("channel={:c}&&message={:m}", { c, m }));

export async function getSuggestionId(c: string, m: string) {
	const s = await getSuggestion(c, m);
	return s.id;
}

export async function updateMessage(suggestionId: string, message: Message) {
	const suggestion = await pb.collection("suggestion").getOne(suggestionId, { expand: "author" });
	const author = (suggestion.expand as { author: MemberResponse }).author;
	await message.edit({ embeds: [createEmbed(suggestion, author)] });
}
