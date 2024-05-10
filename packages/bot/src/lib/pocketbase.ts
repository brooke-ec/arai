import type { TypedPocketBase } from "./pocketbase.d";
import PocketBase from "pocketbase";

export const pocketbase: TypedPocketBase = new PocketBase(process.env.PB_TYPEGEN_URL);
pocketbase.admins.authWithPassword(process.env.PB_TYPEGEN_EMAIL!, process.env.PB_TYPEGEN_PASSWORD!);
