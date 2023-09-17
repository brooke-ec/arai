from os import path
import importlib
import pkgutil


def load_widgets() -> None:
    for _, name, _ in pkgutil.iter_modules([path.dirname(__file__)]):
        importlib.import_module(__name__+"."+name)
