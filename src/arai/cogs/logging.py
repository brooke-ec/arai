from datetime import datetime, timezone
from typing import Dict

import discord
from discord.ext import commands

from arai.client import ARAIClient


class MiscLogging(commands.Cog):
    def __init__(self, client: ARAIClient) -> None:
        self.client = client
        self.join_records: Dict[int, int] = {}

    @commands.Cog.listener()
    async def on_raw_member_remove(self, payload: discord.RawMemberRemoveEvent):
        if payload.guild_id != self.client.watch_guild_id:
            return
        time_here = datetime.now(timezone.utc) - payload.user.joined_at
        embed = discord.Embed(
            title=f"{payload.user} Left",
            description=f"{payload.user.mention} has left after {time_here.days} days",
            color=0xFF0000,
        )
        embed.set_thumbnail(url=payload.user.avatar.url)
        await self.client.send_log(embed=embed)

    @commands.Cog.listener()
    async def on_voice_state_update(
        self,
        member: discord.Member,
        before: discord.VoiceState,
        after: discord.VoiceState,
    ):
        if after.channel.guild.id != self.client.watch_guild_id:
            return
        if member.bot:
            return
        if after.channel == before.channel:
            return
        if True not in self.client.channels_in_guild(before.channel, after.channel):
            return
        if before.channel is not None:
            joined_at = self.join_records.get(member.id, None)
            diff = datetime.utcnow().timestamp() - joined_at if joined_at is not None else None
            if len(before.channel.voice_states) > 0 and diff is not None and diff <= 5:
                await self.client.send_log(f"{member.mention} just left {before.channel.mention} after {round(diff)} second{'s' if diff >= 2 else ''}")
            if member.id in self.join_records:
                self.join_records.pop(member.id)
        if after.channel is not None:
            self.join_records[member.id] = datetime.utcnow().timestamp()


async def setup(client: ARAIClient):
    await client.add_cog(MiscLogging(client))
