from __future__ import annotations

import logging
import os
from typing import List

import discord
import yaml
from discord import ui
from discord.ext import commands

from menu import library

LOGGER = logging.getLogger(__name__)


class Menu:
    def __init__(self, path: str) -> None:
        self.incrementer = 0
        self.path = path
        self.name = os.path.split(path)[-1]
        LOGGER.debug("Loading menu `%s`", self.name)
        config = yaml.safe_load(open(os.path.join(path, "menu.yml"), "r", encoding="utf-8"))
        self.channel: int = config["channel"]
        self.elements = [MenuElement(self, c) for c in config["elements"]]

    async def send_menu(self, client: commands.Bot):
        channel = client.get_channel(self.channel)
        for element in self.elements:
            await element.send_element(channel)

    def get_views(self) -> List[ElementView]:
        return [e.view for e in self.elements if e.view is not None]


class MenuElement:
    def __init__(self, menu: Menu, config: dict) -> None:
        self.menu = menu
        self.attachment = discord.File(os.path.join(menu.path, config["attachment"])) if "attachment" in config else None
        self.content = config["content"] if "content" in config else None
        self.view = ElementView(self, config)
        if not self.view.any_widgets:
            self.view = None

    async def send_element(self, channel: discord.TextChannel):
        await channel.send(self.content, view=self.view, file=self.attachment)


class ElementView(ui.View):
    def __init__(self, element: MenuElement, config: dict):
        self.element = element
        super().__init__(timeout=None)

        possible_widgets = library.intersection(config)
        if len(possible_widgets) > 0:
            widget = possible_widgets.pop()
            library.build_widget(widget, self, config[widget])

    @property
    def any_widgets(self) -> bool:
        return len(self.children) > 0
