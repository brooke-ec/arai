import { SuggestionVoteTypeOptions } from "../../../lib/pocketbase.d";
import { getSuggestionId, updateMessage } from "../index";
import { pb, upsert } from "../../../lib/pocketbase";
import { getMemberId } from "../../../lib/utils";
import { ButtonInteraction } from "discord.js";

export async function castVote(interaction: ButtonInteraction, type: keyof typeof SuggestionVoteTypeOptions) {
	const suggestionId = await getSuggestionId(interaction.message.channelId, interaction.message.id);
	const memberId = await getMemberId(interaction.user);

	await upsert(pb.collection("suggestionVote"), { suggestion: suggestionId, voter: memberId, type });
	await updateMessage(suggestionId, interaction.message);
}
