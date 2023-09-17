from discord.ext import commands
from discord import app_commands
import discord.abc
import logging

LOGGER = logging.getLogger(__name__)

class AutoSyncBot(commands.Bot):

    async def setup_hook(self) -> None:
        await self.ensure_commands_updated()

    async def ensure_commands_updated(self, *, guild:discord.abc.Snowflake | None = None):
        LOGGER.debug("Checking for app command updates...")
        if await self._app_commands_changed(guild):
            LOGGER.info("Synchronising Application Commands....")
            if guild is not None: self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)


    async def _app_commands_changed(self, guild) -> bool:
        new = {k:v for k,v in self.tree._global_commands.items() if isinstance(v, app_commands.Command)}
        current = await self.tree.fetch_commands(guild=guild)

        presence_mismatch = set(new.keys()).symmetric_difference(set([c.name for c in current]))
        if len(presence_mismatch) > 0: return True
        # if we get past here we are sure that the commands in new and current are the same

        for command in current:
            if check_dict(new[command.name].to_dict(), command.to_dict()):
                return True
        return False


def has_mismatch(model, check) -> bool:
    if type(model) is dict:
        if check_dict(model, check): return True
    elif type(model) is list:
        if check_list(model, check): return True
    elif model != check: return True
    return False

def check_dict(model:dict, check:dict) -> bool:
    for k,v in model.items():
        if k not in check: continue
        if has_mismatch(v, check[k]):
            return True
    return False

def check_list(model:list, check:list) -> bool:
    for i in range(len(model)):
        if has_mismatch(model[i], check[i]):
            return True
    return False