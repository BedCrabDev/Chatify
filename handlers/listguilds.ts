import { PacketHandler, PacketRequest } from "../types.ts"

async function handler(event: PacketRequest) {
   event.socket.emit("listguilds", await event.database.getGuildList(event.self.id))
}

export default function listGuildsPacketHandler(): PacketHandler {
   return {
      event: "listguilds",
      handler: handler
   }
}
