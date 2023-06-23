import channelPacketHandler from "./handlers/channel.ts"
import guildPacketHandler from "./handlers/guild.ts"
import listGuildsPacketHandler from "./handlers/listguilds.ts"
import { PacketHandler } from "./types.ts"

// place new handlers in this function
export default function registerAll(): PacketHandler[] {
   return [guildPacketHandler(), listGuildsPacketHandler(), channelPacketHandler()]
}
