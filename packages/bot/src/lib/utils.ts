import { MemberResponse } from "./pocketbase.d";
import { pb } from "./pocketbase";
import { User } from "discord.js";
import { ofetch } from "ofetch";

export async function syncMember(user: User): Promise<MemberResponse> {
	const old = (await pb.collection("member").getList(1, 1, { filter: `snowflake="${user.id}"` })).items[0];

	const payload = new FormData();
	payload.append("snowflake", user.id);
	payload.append("name", user.displayName);

	// Only synchronise avatar if it has changed
	if (!old?.avatar.startsWith(`${user.avatar}`)) {
		const avatarBlob = await ofetch(user.avatarURL({ extension: "webp" }));
		const avatarFile = new File([avatarBlob], `${user.avatar}.webp`);
		payload.append("avatar", avatarFile);
	}

	if (old) return await pb.collection("member").update(old.id, payload);
	return await pb.collection("member").create(payload);
}
