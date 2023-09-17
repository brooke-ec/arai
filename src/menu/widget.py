from __future__ import annotations
from typing import Callable, Dict, Iterable, Set, Type, TYPE_CHECKING
import logging
import hashlib
import base64

if TYPE_CHECKING:
    from menu.models import ElementView

LOGGER = logging.getLogger(__name__)

class BaseWidget:

    def __init__(self, view:ElementView, config:dict=None) -> None:
        self.__view = view

    @property
    def view(self) -> ElementView:
        return self.__view

    def generate_id(self) -> str:
        self.view.element.menu.incrementer += 1
        hash = hashlib.sha1(f"{self.view.element.menu.name}:{self.view.element.menu.incrementer}".encode("utf-8"))
        return base64.b64encode(hash.digest()).decode("ascii")


class WidgetLibrary:

    _widgets:Dict[str, Type[BaseWidget]] = {}

    def register_widget(self, name:str) -> Callable:
    
        def decorator(cls:Type[BaseWidget]):
            if not BaseWidget.__subclasscheck__(cls):
                raise TypeError("Widgets must inherit from BaseWidget")
            LOGGER.debug("Registering widget `%s`", name)
            self._widgets[name] = cls
            return cls
        return decorator

    def contains(self, name:str) -> bool:
        return name in self._widgets

    def intersection(self, keys:Iterable) -> Set[BaseWidget]:
        return set(keys).intersection(set(self._widgets.keys()))

    def build_widget(self, name:str, view:ElementView, config:dict) -> BaseWidget:
        return self._widgets.get(name)(view, config)
