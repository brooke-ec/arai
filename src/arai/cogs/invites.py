import logging
from datetime import datetime
from typing import Hashable, Optional, Set

import discord
from discord import app_commands
from discord.ext import commands

from arai.client import ARAIClient

LOGGER = logging.getLogger(__name__)


class InviteData(Hashable):
    def __init__(self, invite: discord.Invite) -> None:
        self.id = invite.id
        self.url = invite.url
        self.uses = invite.uses
        self.inviter = invite.inviter
        self.expires_at = invite.expires_at

    def __hash__(self) -> int:
        return hash(f"{self.id}:{self.uses}")

    def __eq__(self, other: object) -> bool:
        return hash(self) == hash(other)

    def __str__(self) -> str:
        return self.id

    def __repr__(self) -> str:
        return self.id


class InviteTracker(commands.Cog):
    def __init__(self, client: ARAIClient) -> None:
        self.client = client
        self.invites: Set[InviteData] = []

    @commands.Cog.listener("on_ready")
    @commands.Cog.listener("on_resumed")
    async def initialise(self):
        await self.update_invites()

    @commands.Cog.listener()
    async def on_invite_create(self, invite: discord.Invite):
        if invite.guild.id != self.client.watch_guild_id:
            return
        LOGGER.debug("Invite creation detected, recording...")
        self.invites.add(InviteData(invite))

    @commands.Cog.listener()
    async def on_invite_delete(self, invite: discord.Invite):
        if invite.guild.id != self.client.watch_guild_id:
            return
        LOGGER.debug("Invite deletion detected, updating invites...")
        await self.update_invites()
        await self.client.db.delete_invite(invite.id)

    async def update_invites(self):
        guild = self.client.get_guild(self.client.watch_guild_id)
        raw_invites = await guild.invites()
        self.invites = set([InviteData(i) for i in raw_invites])
        LOGGER.debug("Current Invites: %s", self.invites)

    async def get_invite_used(self) -> InviteData | None:
        # Update Invites
        old_invites = self.invites
        await self.update_invites()
        new_invites = self.invites
        # Check for discrepencies between current and recorded invites
        diff = old_invites.difference(new_invites)
        if len(diff) > 1:
            diff = {i for i in diff if i.expires_at is not None and i.expires_at.timestamp() > datetime.utcnow().timestamp()}
        if len(diff) == 1:
            return diff.pop()
        # If execution gets to here then must be through vanity invite
        return None

    @commands.Cog.listener()
    async def on_member_join(self, member: discord.Member):
        if member.guild.id != self.client.watch_guild_id:
            return
        # Get Invite
        invite = await self.get_invite_used()
        # Send Log Message
        if invite is None:
            LOGGER.info("`%s`'s invite could not be found")
            embed = discord.Embed(
                title=f"{member} Joined!",
                description=f"Could not determine the invite {member.mention} joined through",
                color=0x04FF00,
            )
            embed.set_thumbnail(url=member.avatar.url)
            await self.client.send_log(embed=embed)
            return
        LOGGER.info("`%s` joined through `%s`'s invite (%s)", member, invite.inviter, invite.id)
        name, role = await self.client.db.get_invite(invite.id)
        if name is None:
            embed = discord.Embed(
                title=f"{member} Joined!",
                description=f"{member.mention} Joined through {invite.inviter.mention}'s invite",
                color=0x04FF00,
            )
        else:
            embed = discord.Embed(
                title=f"{member} Joined!",
                description=f"{member.mention} Joined from invite **{name}**",
                color=0x04FF00,
            )
        embed.set_thumbnail(url=member.avatar.url)
        embed.set_footer(text=invite.url)
        await self.client.send_log(embed=embed)
        # Add Invite Role
        if role is not None:
            LOGGER.info("Giving `%s` the invite role for `%s`", member, invite.id)
            await member.add_roles(discord.Object(role), reason="Invite Role")

    @app_commands.command(
        name="create_invite",
        description="Creates a new unique invite for tracking where members join from",
    )
    @app_commands.describe(channel="The channel that the invite should take new members to")
    @app_commands.describe(name="The name of this invite, should be recognisable")
    @app_commands.describe(role="A role to give all members who join through this invite")
    @app_commands.default_permissions(manage_channels=True)
    async def create_invite_command(
        self,
        interaction: discord.Interaction,
        channel: discord.TextChannel,
        name: str,
        role: Optional[discord.Role],
    ):
        invite = await channel.create_invite(unique=True, reason=f"Unique invite created by {interaction.user}")
        await self.client.db.create_invite(invite.id, name, None if role is None or role.is_default() else role.id)
        embed = discord.Embed(
            title=f"Invite ``{name}`` Created",
            color=0x00E5FF,
            description=None if role is None or role.is_default() else f"Invite Role: {role.mention}",
        )
        await interaction.response.send_message(invite.url, embed=embed)


async def setup(client: ARAIClient):
    await client.add_cog(InviteTracker(client))
