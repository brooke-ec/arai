import importlib
import pkgutil
from os import path


def load_widgets() -> None:
    for _, name, _ in pkgutil.iter_modules([path.dirname(__file__)]):
        importlib.import_module(__name__ + "." + name)
