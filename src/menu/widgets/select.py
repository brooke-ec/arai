import discord
from discord import ui

from menu import library
from menu.widgets.roleselector import RoleSelectorWidget


class SelectWidget(RoleSelectorWidget, ui.Select):
    def __init__(self, view, config: dict, placeholder: str, min_values: int, max_values: int) -> None:
        RoleSelectorWidget.__init__(self, view)
        options = [self.load_option(c) for c in config]
        ui.Select.__init__(
            self,
            custom_id=self.generate_id(),
            placeholder=placeholder,
            min_values=min_values,
            max_values=max_values,
            options=options,
        )
        self.view.add_item(self)

    def load_option(self, config: dict) -> discord.SelectOption:
        emoji = config["emoji"] if "emoji" in config else None
        label = config["label"] if "label" in config else None
        description = config["description"] if "description" in config else None
        role = config["role"] if "role" in config else None
        if role is None:
            role = "none"
        else:
            self.register_role(role)
        return discord.SelectOption(emoji=emoji, label=label, description=description, value=role)

    async def callback(self, interaction: discord.Interaction):
        await self.update_roles(interaction, self.values)


@library.register_widget("selectmany")
class SelectManyWidget(SelectWidget):
    def __init__(self, view, config: dict) -> None:
        super().__init__(view, config, "Select One or Many", 0, len(config))


@library.register_widget("selectone")
class SelectOneWidget(SelectWidget):
    def __init__(self, view, config: dict) -> None:
        super().__init__(view, config, "Select One", None, None)
