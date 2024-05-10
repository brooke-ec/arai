import type { TypedPocketBase } from "./pocketbase.d";
import PocketBase from "pocketbase";

export const pb: TypedPocketBase = new PocketBase(process.env.PB_TYPEGEN_URL);
pb.admins.authWithPassword(process.env.PB_TYPEGEN_EMAIL!, process.env.PB_TYPEGEN_PASSWORD!);
