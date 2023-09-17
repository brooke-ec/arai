from utils import AutoSyncBot
from typing import List
import discord
import logging

from arai.database import DatabseWrapper

LOGGER = logging.getLogger(__name__)

class ARAIClient(AutoSyncBot):

    def __init__(self, token:str, log_channel:int, database:dict, dynamic_channels:List[int], following_id:int) -> None:
        self.token = token
        self.log_channel_id = log_channel
        self.dynamic_channels = dynamic_channels
        self.following_id = following_id
        self.db = DatabseWrapper(**database)
        intents = discord.Intents.all()
        super().__init__("///", intents=intents)

    async def setup_hook(self):
        LOGGER.debug("Fetching Guild...")
        channel = await self.fetch_channel(self.log_channel_id)
        guild = await self.fetch_guild(channel.guild.id)
        self.watch_guild_id = guild.id
        LOGGER.info("Starting bot watching guild `%s`", guild.name)

        LOGGER.debug("Loading Cogs...")
        await self.load_extension("arai.cogs")
        await self.load_extension("menu")

        await self.ensure_commands_updated(guild=guild)

        LOGGER.debug("Finished Setup")

    async def on_ready(self):
        LOGGER.info("Bot connected as %s with %sms latency", self.user, round(self.latency*1000, 2))

    def run(self) -> None:
        return super().run(self.token)

    async def send_log(self, *args, **kwargs):
        LOGGER.debug("Sending message to logs channel")
        channel = self.get_channel(self.log_channel_id)
        await channel.send(*args, **kwargs)

    def channels_in_guild(self, *channels:discord.abc.GuildChannel) -> List[bool]:
        return [c is not None and c.guild.id == self.watch_guild_id for c in channels]