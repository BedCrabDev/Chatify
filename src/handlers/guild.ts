import { PacketHandler, PacketRequest } from "../types.ts"

async function handler(event: PacketRequest) {
   // get guild
   const id = event.args.getNumber(0)
   if (!id) return

   // check if user has a membership
   if (!(await event.database.getMembership(id, event.self.id))) return

   // get the guild
   const guild = await event.database.getGuild(id)
   if (!guild) return // literally impossible but ok

   // get the channels
   const channels = await event.database.getChannels(guild.id)

   // return the guild
   event.socket.emit("guild", {
      guild: guild,
      channels: channels
   })
}

export default function guildPacketHandler(): PacketHandler {
   return {
      event: "guild",
      handler: handler
   }
}
