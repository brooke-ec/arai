from arai import create_app
import json

import colouredlogs
import logging

colouredlogs.install(level="DEBUG")

logging.getLogger("wavelink.websocket").setLevel("WARN")
logging.getLogger("discord.client").setLevel("WARN")
logging.getLogger("discord.gateway").setLevel("WARN")
logging.getLogger("discord.voice_client").setLevel("WARN")

config = json.load(open("config.json", "r", encoding="utf-8"))

app = create_app(config)
app.run()