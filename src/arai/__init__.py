

def create_app(config:dict):
    from arai.client import ARAIClient
    return ARAIClient(**config)