import PocketBase, { ClientResponseError, RecordService } from "pocketbase";
import type { BaseSystemFields, TypedPocketBase } from "./pocketbase-types";

export const pb: TypedPocketBase = new PocketBase(process.env.PB_TYPEGEN_URL);
pb.admins.authWithPassword(process.env.PB_TYPEGEN_EMAIL!, process.env.PB_TYPEGEN_PASSWORD!);

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
