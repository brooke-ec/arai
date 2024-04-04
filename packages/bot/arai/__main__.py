import amethyst
import discord

client = amethyst.Client(discord.Intents.all())
client.run(plugin_modules=["arai.plugin"])
