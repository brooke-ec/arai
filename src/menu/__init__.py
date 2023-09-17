from .widget import BaseWidget, WidgetLibrary
from .widgets import load_widgets

library: WidgetLibrary = WidgetLibrary()


async def setup(client):
    load_widgets()
    from .cog import MenusCog

    await client.add_cog(MenusCog(client))
