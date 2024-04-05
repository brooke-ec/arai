START_EMOJIS = [
    "<:start_0:1225834607023489107>",
    "<:start_1:1225834618721275956>",
    "<:start_2:1225834630209343628>",
    "<:start_3:1225834642041471048>",
    "<:start_4:1225834658365968434>",
]

MIDDLE_EMOJIS = [
    "<:middle_0:1225834679379300352>",
    "<:middle_1:1225834690611515452>",
    "<:middle_2:1225834701558648923>",
    "<:middle_3:1225834714607259699>",
    "<:middle_4:1225834728372834425>",
]

END_EMOJIS = [
    "<:end_0:1225834744139481249>",
    "<:end_1:1225834764754489436>",
    "<:end_2:1225834774959231126>",
    "<:end_3:1225834789698011287>",
    "<:end_4:1225834803103006801>",
]

def generate_emoji_progress(progress: float, emoji_count: int) -> str:
    emoji_substeps = len(MIDDLE_EMOJIS)
    
    # Get the components of the progress bar
    progress *= emoji_count
    left = int(progress) # The number of emojies to the left
    right = emoji_count - left - 1 # The number of emojies to the right
    middle = progress - left # The progress through the middle emoji
    # The number of emojies of each type must be the same
    middle_index = int(middle * emoji_substeps) # Calculate the requiered index of the middle emoji
    # Middle will never be 1 so will never produce an invalid index
    
    # Correct for when the bar is full so that there is not an extra bar
    if left == emoji_count:
        left -= 1
        middle_index = emoji_substeps - 1
    
    bar = [emoji_substeps - 1] * left + [middle_index] + [0] * right
    string = ""
    for i, index in enumerate(bar):
        if i == 0:
            string += START_EMOJIS[index]
        elif i == len(bar) - 1:
            string += END_EMOJIS[index]
        else:
            string += MIDDLE_EMOJIS[index]
    return string
