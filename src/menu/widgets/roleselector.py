from typing import List
import discord

from menu import BaseWidget


class RoleSelectorWidget(BaseWidget):

    def __init__(self, view) -> None:
        super().__init__(view)
        self.all_roles = set()
        self.busy_users = []

    def register_role(self, id):
        self.all_roles.add(int(id))

    async def update_roles(self, interaction:discord.Interaction, values:List[str]):
        member = interaction.user
        if member.id in self.busy_users:
            return await interaction.response.send_message("❗❗❗ Please slow down!", ephemeral=True)
        else: await interaction.response.send_message("<:universal_check:768906325010022411> Roles Updated!", ephemeral=True)
        self.busy_users.append(member.id)
        current = self.all_roles.intersection(set([r.id for r in member.roles]))
        to_remove, to_add = [], []
        if "none" in values: to_remove = [discord.Object(r) for r in current]
        else:
            desired = set([int(r) for r in values])
            diffence = current.symmetric_difference(desired)
            for role in diffence:
                if role in desired: to_add.append(discord.Object(role))
                if role in current: to_remove.append(discord.Object(role))
        await member.remove_roles(*to_remove, reason="Member updated their settings")
        await member.add_roles(*to_add, reason="Member updated their settings")
        self.busy_users.remove(member.id)
