import guildPacketHandler from "./handlers/guild.ts"
import listGuildsPacketHandler from "./handlers/listguilds.ts"
import { PacketHandler } from "./types.ts"

export default function registerAll(): PacketHandler[] {
   return [guildPacketHandler(), listGuildsPacketHandler()]
}
