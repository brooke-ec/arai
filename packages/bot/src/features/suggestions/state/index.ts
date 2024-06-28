import type { SuggestionStateOptions } from "../../../lib/pocketbase.d";
import { MessageContextMenuCommandInteraction } from "discord.js";
import { getSuggestionId, updateMessage } from "../index";
import { pb } from "../../../lib/pocketbase";
import { abort } from "../../../lib/utils";

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
	const suggestionId = await getSuggestionId(message.channelId, message.id).catch(() => null);

	if (suggestionId === null) abort("This message is not a suggestion.");

	await pb.collection("suggestionInfo").update(suggestionId, { state: state });
	await updateMessage(suggestionId, message);

	return `Suggestion ${state}!`;
}
