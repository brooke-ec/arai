import { ButtonInteraction, CommandInteraction, User } from "discord.js";
import { ClientResponseError } from "pocketbase";
import { MemberResponse } from "./pocketbase-types";
import { CHECK, CROSS_RED } from "./emoji";
import { pb } from "./pocketbase";
import { ofetch } from "ofetch";

class ExitMessage {
	content: string;

	constructor(content: string) {
		this.content = content;
	}
}

export function wrap<F extends (...args: any[]) => Promise<any>>(fn: F): F {
	type Interaction = CommandInteraction | ButtonInteraction;

	// @ts-ignore
	return async (options: { interaction: Interaction }, ...args: any) => {
		let message: ExitMessage | null = null;

		try {
			const result = await fn(options, ...args);
			if (typeof result == "string") message = new ExitMessage(`${CHECK} ${result}`);
		} catch (e) {
			if (e instanceof ExitMessage) message = e;
			else {
				message = new ExitMessage(`${CROSS_RED} Unexpected Error`);
				console.error(e);
			}
		}

		if (message && !options.interaction.replied)
			await options.interaction.reply({ content: message.content, ephemeral: true });
	};
}

export function abort(message: string, icon: string | null = CROSS_RED): never {
	if (icon) message = icon + " " + message;
	throw new ExitMessage(message);
}

export async function getMember(user: User): Promise<MemberResponse> {
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

export const getMemberId = async (user: User) => (await getMember(user)).id;

export const toTitleCase = (value: string) =>
	value.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
