from discord import ui
import discord

from menu.widgets.roleselector import RoleSelectorWidget
from menu import library

STYLE_MAP = {"grey":discord.ButtonStyle.grey,"danger":discord.ButtonStyle.danger,
    "blurple":discord.ButtonStyle.blurple,"green":discord.ButtonStyle.green,
    "primary":discord.ButtonStyle.primary,"secondary":discord.ButtonStyle.secondary,
    "red":discord.ButtonStyle.red,"success":discord.ButtonStyle.success}



@library.register_widget("radio")
class RadioWidget(RoleSelectorWidget):

    def __init__(self, view, config:dict) -> None:
        super().__init__(view)
        for button in config:
            self.view.add_item(self.load_button(button))

    def load_button(self, config:dict):
        emoji = config["emoji"] if "emoji" in config else None
        label = config["label"] if "label" in config else None
        role = config["role"] if "role" in config else None
        style = STYLE_MAP.get(config["style"], None) if "style" in config else discord.ButtonStyle.gray
        if role is None: role = "none"
        else: self.register_role(role)
        if not (emoji is None and label is None): return RadioWidgetButton(self, role, style, label, emoji)
    

class RadioWidgetButton(ui.Button):

    def __init__(self, widget:RadioWidget, value:str, style:discord.ButtonStyle, label:str, emoji:str):
        self.widget = widget
        self.value = value
        super().__init__(style=style, label=label, custom_id=widget.generate_id(), emoji=emoji, row=0)

    async def callback(self, interaction: discord.Interaction):
        await self.widget.update_roles(interaction, [self.value])