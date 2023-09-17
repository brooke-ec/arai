from discord.ext import commands
from os import path
import importlib
import pkgutil


async def setup(bot:commands.Bot) -> None:
    for _, name, _ in pkgutil.iter_modules([path.dirname(__file__)]):
        cog = importlib.import_module(__name__+"."+name)
        if hasattr(cog, "setup"): await cog.setup(bot)
