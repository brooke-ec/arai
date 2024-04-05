import amethyst
import discord
from environ import PB_EMAIL, PB_PASSWORD, PB_URL
from pocketbase import PocketBase

client = amethyst.Client(discord.Intents.all())
pb = PocketBase(PB_URL)


@client.event(amethyst.on_setup_hook)
async def setup():
    await pb.admins.auth.with_password(PB_EMAIL, PB_PASSWORD)


client.add_dependency(pb)
client.run(plugin_modules=["arai.plugin"])
