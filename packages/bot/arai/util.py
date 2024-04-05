import hashlib
import logging

import amethyst
import discord
from pocketbase import FileUpload, PocketBase
from pocketbase.models.dtos import Record

_log = logging.getLogger(__name__)


class _Plugin(amethyst.Plugin):
    def __init__(self, pb: PocketBase) -> None:
        self.pb: PocketBase = pb

    async def sync_member(self, member: discord.Member) -> str:
        avatar = await member.display_avatar.with_format("webp").read()
        hash = hashlib.sha256(avatar).hexdigest()
        file = FileUpload((hash + ".webp", avatar))

        col = self.pb.collection("member")
        opts = {"params": {"filter": f"(snowflake='{member.id}')"}}
        old = next(iter(await col.get_full_list(opts)), None)

        if old is None:
            _log.debug("Creating new member record for '%s'", member.name)
            rec: Record = await col.create(
                {
                    "snowflake": member.id,
                    "name": member.display_name,
                    "avatar": file,
                }
            )
            return rec["id"]
        else:
            _log.debug("Updating existing member record '%s'", old["id"])
            params = {"name": member.display_name}
            if str(old["avatar"]).startswith(hash):
                params["avatar"] = file
            await col.update(old["id"], params)
            return old["id"]
