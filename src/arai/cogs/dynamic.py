import asyncio
from typing import List

import discord
from discord import app_commands
from discord.ext import commands

from arai.client import ARAIClient


class ChannelData:
    def __init__(self, client: ARAIClient, id: int, connected: int, visible: bool) -> None:
        self.connected = connected
        self.client = client
        self.visible = visible
        self.id = id

    async def set_visibility(self, visible: bool):
        if visible == self.visible:
            return
        channel = self.client.get_channel(self.id)
        await channel.set_permissions(channel.guild.default_role, view_channel=visible)
        self.visible = visible


class DynamicVoiceChannels(commands.Cog):
    def __init__(self, client: ARAIClient) -> None:
        self.channels: List[ChannelData] = [None for i in client.dynamic_channels]
        self.client = client
        self.min_visible = 1

    @app_commands.command(
        name="set_visible",
        description="Sets the minimum number of voice channels that should be visible",
    )
    @app_commands.describe(number="The minimum number of voice channels that should be visible")
    @app_commands.default_permissions(manage_channels=True)
    async def set_min_command(self, interaction: discord.Interaction, number: int):
        if number > len(self.channels):
            return await interaction.response.send_message(
                "<:cross_red:768507522335506473> Cannot be larger than the number of channels",
                ephemeral=True,
            )
        self.min_visible = number
        await interaction.response.send_message(
            f"<:universal_check:768906325010022411> Minimum visible channels set to **{number}**",
            ephemeral=True,
        )
        await self.update_visibility()

    @commands.Cog.listener("on_ready")
    @commands.Cog.listener("on_resumed")
    async def update_data(self):
        await self.fetch_channels()
        await self.update_visibility()

    @commands.Cog.listener()
    async def on_voice_state_update(
        self,
        member: discord.Member,
        before: discord.VoiceState,
        after: discord.VoiceState,
    ):
        if True not in self.client.channels_in_guild(before.channel, after.channel):
            return
        if before.channel == after.channel:
            return

        b, a = before.channel is not None, after.channel is not None
        if b:
            self.get_channel(before.channel).connected -= 1
        if a:
            self.get_channel(after.channel).connected += 1
        if b or a:
            await self.update_visibility()

    # FETCH / STORE CHANNEL DATA
    async def fetch_channels(self):
        tasks = [self.fetch_channel(i, id) for i, id in enumerate(self.client.dynamic_channels)]
        await asyncio.gather(*tasks)

    async def fetch_channel(self, index: int, id: int):
        channel = await self.client.fetch_channel(id)
        visible = channel.overwrites_for(channel.guild.default_role).view_channel
        self.channels[index] = ChannelData(self.client, id, len(channel.voice_states), visible)

    def get_channel(self, channel: discord.VoiceChannel) -> ChannelData:
        return self.channels[self.client.dynamic_channels.index(channel.id)]

    # SET CHANNEL VISIBILITY
    def calculate_visibility(self) -> List[bool]:
        channels = [c.connected > 0 for c in self.channels]  # Make all occupied channels visible
        channels[channels.index(False)] = True  # Make first unoccupied channel visible
        for i in range(self.min_visible):
            channels[i] = True  # Make default channels visible (General I)
        return channels

    async def update_visibility(self):
        visibility = self.calculate_visibility()
        tasks = [self.channels[i].set_visibility(v) for i, v in enumerate(visibility)]
        await asyncio.gather(*tasks)


async def setup(client: ARAIClient):
    await client.add_cog(DynamicVoiceChannels(client))
