from typing import Tuple

from utils import DatabaseConnection


class DatabseWrapper(DatabaseConnection):
    async def get_invite(self, id: str) -> Tuple[str, int]:
        cur = await self.execute_sql("SELECT `name`, `role` FROM `invites` WHERE `id`=%s", (id,))
        data = await cur.fetchone()
        if data is None:
            return (None, None)
        return data

    async def create_invite(self, id: str, name: str, role: int):
        await self.execute_sql(
            "INSERT INTO `invites`(`id`, `name`, `role`) VALUES (%s,%s,%s)",
            (id, name, role),
        )

    async def delete_invite(self, id: str):
        await self.execute_sql("DELETE FROM `invites` WHERE `id`=%s", (id,))
