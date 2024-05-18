import type { MemberResponse, SuggestionRecord } from "../../lib/pocketbase.d";
import { createProgress } from "./progress";
import { EmbedBuilder } from "discord.js";
import { pb } from "../../lib/pocketbase";

export function createEmbed(
	suggestion: Omit<SuggestionRecord, "message" | "author">,
	author: MemberResponse,
) {
	return new EmbedBuilder()
		.setColor(0xa6a6df)
		.setTitle(`Suggestion #${1}`)
		.setAuthor({ name: author.name, iconURL: pb.files.getUrl(author, author.avatar) })
		.setDescription(`${suggestion.content}\n\n↑ 0 ↓ 0 : 0%\n${createProgress(0.5, 13)}`);
}
