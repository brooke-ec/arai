from .widget import WidgetLibrary, BaseWidget
from .widgets import load_widgets

library:WidgetLibrary = WidgetLibrary()

async def setup(client):
    load_widgets()
    from .cog import MenusCog
    await client.add_cog(MenusCog(client))