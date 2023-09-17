from discord.ext import commands
from discord import app_commands
from typing import Dict
import discord
import logging
import os

from menu.models import Menu

LOGGER = logging.getLogger(__name__)

class MenusCog(commands.Cog):

    def __init__(self, client:commands.Bot) -> None:
        self.client = client
        self.menus = self.load_menus()
        choices = [app_commands.Choice(name=m,value=m) for m in self.menus.keys()]
        app_commands.choices(menu=choices)(self.send_menu_command)
        

    def load_menus(self) -> Dict[str, Menu]:
        menus = {}
        root = os.path.abspath("menus/")
        for path in os.listdir(root):
            path = os.path.join(root, path)
            if not os.path.isdir(path): continue
            if not os.path.exists(os.path.join(path, "menu.yml")): continue
            menu = Menu(path)
            menus[menu.name] = menu
            for view in menu.get_views():
                self.client.add_view(view)
        return menus

    
    @app_commands.command(name="send_menu", description="Sends the specified menu in it's channel")
    @app_commands.default_permissions(manage_channels = True)
    @app_commands.describe(menu='The name of the menu to send')
    async def send_menu_command(self, interaction:discord.Interaction, menu:str):
        await interaction.response.defer(ephemeral=True, thinking=True)
        await self.menus.get(menu).send_menu(self.client)
        await interaction.followup.send(f"<:universal_check:768906325010022411> Menu `{menu}` Sent!", ephemeral=True)