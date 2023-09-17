import os


def create_app():
    from arai.client import ARAIClient

    return ARAIClient(
        **{
            "token": os.environ["TOKEN"],
            "log_channel": int(os.environ["LOG_CHANNEL"]),
            "following_id": int(os.environ["FOLLOWING_USER"]),
            "database": {
                "host": os.environ["DB_HOST"],
                "port": int(os.environ["DB_PORT"]),
                "user": os.environ["DB_USER"],
                "password": os.environ["DB_PASSWORD"],
                "db": os.environ["DB_DATABASE"],
            },
            "dynamic_channels": [int(c) for c in os.environ["DYNAMIC_CHANNELS"].split(",")],
        }
    )
