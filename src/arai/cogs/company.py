from typing import Optional

import discord
from discord import app_commands
from discord.ext import commands

from arai.client import ARAIClient


class TerraCompany(commands.Cog):
    def __init__(self, client: ARAIClient) -> None:
        self.client = client

    @commands.Cog.listener()
    async def on_voice_state_update(
        self,
        member: discord.Member,
        before: discord.VoiceState,
        after: discord.VoiceState,
    ):
        if before.channel == after.channel:
            return
        if not self.client.channels_in_guild(after.channel)[0]:
            return
        if member.id != self.client.following_id:
            return
        if after.channel is None:
            return
        await self.join(after.channel)

    @app_commands.command(name="join", description="Join the voice channel you are currently connected to")
    @app_commands.describe(member="The user to join in voice call")
    async def join_command(self, interation: discord.Interaction, member: Optional[discord.Member]):
        if member is None:
            member = interation.user
        if member.voice is None:
            await interation.response.send_message(
                "<:cross_red:768507522335506473> That user is not connected to a voice channel",
                ephemeral=True,
            )
        await interation.response.send_message("👋")
        await self.join(member.voice.channel)

    async def join(self, channel: discord.VoiceChannel):
        if channel.guild.voice_client is not None:
            if channel.guild.voice_client.channel == channel:
                return
            await channel.guild.voice_client.disconnect(force=True)
        await channel.connect()


async def setup(client: ARAIClient):
    await client.add_cog(TerraCompany(client))
