import amethyst
import discord

COLOR = 0xA6A6DF
LEFT = "<:line_green_end_left:1225130715973423186>"
GREEN = "<:line_green_middle:1225130724915548201>"
RED = "<:line_red_middle:1225130758063128658>"
RIGHT = "<:line_red_end_right:1225130767865090189>"


class Suggestions(amethyst.Plugin):
    @amethyst.command("suggest")
    async def command(self, itr: discord.Interaction, content: str):
        embed = discord.Embed(color=COLOR, title=f"Suggestion #{1}")
        embed.set_author(name=itr.user.display_name, icon_url=itr.user.avatar)
        embed.description = f"""{content}

↑ 0 ↓ 0 : 0%
{LEFT}{GREEN*6}{RED*6}{RIGHT}
"""

        await itr.response.send_message(embed=embed)
