import { BaseSystemFields, MemberResponse } from "./pocketbase.d";
import { ClientResponseError, RecordService } from "pocketbase";
import { pb } from "./pocketbase";
import { User } from "discord.js";
import { ofetch } from "ofetch";

export async function syncMember(user: User): Promise<MemberResponse> {
	const old = await pb
		.collection("member")
		.getFirstListItem(pb.filter("snowflake={:id}", { id: user.id }))
		.catch((e: ClientResponseError) => {
			if (e.status == 404) return null;
			else throw e;
		});

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

export async function upsert<T extends BaseSystemFields>(
	collection: RecordService<T>,
	data: { [key: string]: any },
): Promise<T> {
	return await collection.create(data).catch(async (e: ClientResponseError) => {
		if (e.status != 400) throw e;

		const filter: string[] = [];
		const params: { [key: string]: any } = {};
		for (const [field, error] of Object.entries(e.response.data) as [string, { code: string }][]) {
			if (error.code != "validation_not_unique") throw e;
			filter.push(`${field}={:${field}}`);
			params[field] = data[field];
		}

		const existing = await collection.getFirstListItem(pb.filter(filter.join("&&"), params));
		return await collection.update(existing.id, data);
	});
}
