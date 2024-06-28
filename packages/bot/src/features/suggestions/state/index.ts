import { EmbedBuilder, MessageContextMenuCommandInteraction, ThreadChannel } from "discord.js";
import type { SuggestionStateOptions } from "../../../lib/pocketbase.d";
import { getSuggestion, updateMessage } from "../index";
import { abort, toTitleCase } from "../../../lib/utils";
import { pb } from "../../../lib/pocketbase";

export const STATE_COLOR: { [k in keyof typeof SuggestionStateOptions]: number } = {
	approved: 0x2ecc71,
	denied: 0xcc3b2e,
	open: 0xa6a6df,
};

export async function setState(
	interaction: MessageContextMenuCommandInteraction,
	state: keyof typeof SuggestionStateOptions,
) {
	const message = interaction.targetMessage;
	const suggestion = await getSuggestion(message.channelId, message.id).catch(() => null);

	if (suggestion === null) abort("This message is not a suggestion.");

	await pb.collection("suggestionInfo").update(suggestion.id, { state: state });
	await updateMessage(suggestion.id, message);

	const thread = (await interaction.client.channels.fetch(suggestion.thread)) as ThreadChannel;
	thread.send({
		embeds: [new EmbedBuilder().setColor(STATE_COLOR[state]).setTitle(`Suggestion ${toTitleCase(state)}`)],
	});

	return `Suggestion ${state}!`;
}
