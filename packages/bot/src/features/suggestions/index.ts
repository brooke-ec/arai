import { abort, getMemberId, hasRole, toTitleCase } from "../../lib/utils";
import { pb, upsert } from "../../lib/pocketbase";
import { createProgress } from "./progress";
import {
	Message,
	ButtonStyle,
	EmbedBuilder,
	ButtonBuilder,
	ActionRowBuilder,
	ButtonInteraction,
	MessageContextMenuCommandInteraction,
} from "discord.js";
import {
	MemberResponse,
	SuggestionRecord,
	SuggestionStateOptions,
	SuggestionVoteTypeOptions,
} from "../../lib/pocketbase-types";

const BLACKLIST = process.env.SUGGESTION_ROLE_BLACKLIST?.split(",") ?? [];

export const STATE_COLOR: { [k in keyof typeof SuggestionStateOptions]: number } = {
	approved: 0x2ecc71,
	denied: 0xcc3b2e,
	open: 0xa6a6df,
};

export const CREATOR = {
	content: "­",
	components: [
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("suggestion-create")
				.setStyle(ButtonStyle.Secondary)
				.setLabel("✨ Create Suggestion ✨"),
		),
	],
};

export async function setState(
	interaction: MessageContextMenuCommandInteraction,
	state: keyof typeof SuggestionStateOptions,
) {
	const message = interaction.targetMessage;
	const suggestionId = getSuggestionId(message);
	if (suggestionId === null) abort("This message is not a suggestion");

	await pb.collection("suggestionInfo").update(suggestionId, { state: state });
	await updateMessage(message);

	if (message.thread)
		message.thread.send({
			embeds: [new EmbedBuilder().setColor(STATE_COLOR[state]).setTitle(`Suggestion ${toTitleCase(state)}`)],
		});

	return `Suggestion ${state}!`;
}

export async function castVote(interaction: ButtonInteraction, type: keyof typeof SuggestionVoteTypeOptions) {
	if (BLACKLIST.some((r) => hasRole(r, interaction.member!.roles))) abort("You are not permitted to vote on suggestions");

	const suggestion = await fetchSuggestion(interaction.message);
	if (suggestion.state != SuggestionStateOptions.open) abort("This suggestion is has been closed");

	const memberId = await getMemberId(interaction.user);

	await upsert(pb.collection("suggestionVote"), { suggestion: suggestion.id, voter: memberId, type });
	await updateMessage(interaction.message);
}

export function createEmbed(suggestion: Omit<SuggestionRecord, "author">, author: MemberResponse) {
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

export const getSuggestionId = (message: Message) => {
	try {
		return message.components[0].components[0].customId!.match(/suggestion-(.{15})-.+/i)![1];
	} catch {
		return null;
	}
};

export const fetchSuggestion = (message: Message) => pb.collection("suggestion").getOne(getSuggestionId(message)!);

export async function updateMessage(message: Message) {
	const suggestion = await pb.collection("suggestion").getOne(getSuggestionId(message)!, { expand: "author" });
	const author = (suggestion.expand as { author: MemberResponse }).author;
	await message.edit({ embeds: [createEmbed(suggestion, author)] });
}
