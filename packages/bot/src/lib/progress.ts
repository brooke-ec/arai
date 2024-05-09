const START_EMOJIS = [
	"<:start_0:1225834607023489107>",
	"<:start_1:1225834618721275956>",
	"<:start_2:1225834630209343628>",
	"<:start_3:1225834642041471048>",
	"<:start_4:1225834658365968434>",
];

const MIDDLE_EMOJIS = [
	"<:middle_0:1225834679379300352>",
	"<:middle_1:1225834690611515452>",
	"<:middle_2:1225834701558648923>",
	"<:middle_3:1225834714607259699>",
	"<:middle_4:1225834728372834425>",
];

const END_EMOJIS = [
	"<:end_0:1225834744139481249>",
	"<:end_1:1225834764754489436>",
	"<:end_2:1225834774959231126>",
	"<:end_3:1225834789698011287>",
	"<:end_4:1225834803103006801>",
];

export function generateProgress(progress: number, length: number) {
	const substeps = MIDDLE_EMOJIS.length;

	// Get the components of the progress bar
	progress *= length;
	let left = Math.floor(progress); // The number of emojies to the left
	let middle = progress - left; // The progress through the middle emoji
	// The number of emojies of each type must be the same
	let middleState = Math.floor(middle * substeps); // Calculate the requiered state of the middle emoji
	// Middle will never be 1 so will never produce an invalid index

	// Correct for when the bar is full so that there is not an extra bar
	if (left == length) {
		middleState = substeps - 1;
		left -= 1;
	}

	let string = "";
	for (let i = 0; i < length; i++) {
		const state = i < left ? substeps - 1 : i == left ? middleState : 0;

		if (i == 0) string += START_EMOJIS[state];
		else if (i == length - 1) string += END_EMOJIS[state];
		else string += MIDDLE_EMOJIS[state];
	}

	return string;
}
