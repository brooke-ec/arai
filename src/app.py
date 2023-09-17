import json
import logging

import colouredlogs

from arai import create_app

CONFIG_PATH = "config.json"

colouredlogs.install(level="DEBUG")

logging.getLogger("wavelink.websocket").setLevel("WARN")
logging.getLogger("discord.client").setLevel("WARN")
logging.getLogger("discord.gateway").setLevel("WARN")
logging.getLogger("discord.voice_client").setLevel("WARN")

app = create_app(json.load(open(CONFIG_PATH, "r", encoding="utf-8")))
app.run()