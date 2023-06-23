import { PacketHandler, PacketRequest } from "../types.ts"

async function handler(event: PacketRequest) {
   // get channel
   const id = event.args.getNumber(0)
   if (!id) return

   // get the channel
   const channel = await event.database.getChannel(id)
   if (!channel) return

   // check if user has a membership
   if (!(await event.database.getMembership(channel.guild, event.self.id))) return

   // 1. find a list of messages
   const recent = await event.database.getRecentMessages(channel.guild)

   // 2. find all users in the guild
   const members = await event.database.getGuildMembers(channel.guild)

   // return the channel
   event.socket.emit("channel", {
      messages: recent,
      users: members
   })
}

export default function channelPacketHandler(): PacketHandler {
   return {
      event: "channel",
      handler: handler
   }
}
