import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts"

const userProps = {
   id: z.number(),
   created: z.date(),
   handle: z.string(),
   displayName: z.string()
}

export const User = z.object(userProps)
export const SelfUser = z.object({
   ...userProps,
   handleLastUpdated: z.date(),
   email: z.string().email()
})

export const File = z.object({
   userId: z.number(),
   fileName: z.string(),
   width: z.number().optional(),
   height: z.number().optional()
})

export const Guild = z.object({
   id: z.number(),
   name: z.string(),
   created: z.date(),
   icon: File.optional()
})

export const Membership = z.object({
   guild: z.number(),
   user: z.number()
})

export const Channel = z.object({
   id: z.number(),
   guild: z.number(),
   created: z.date(),
   name: z.string(),
   description: z.string()
})

export const Message = z.object({
   id: z.number(),
   created: z.date(),
   channel: z.number(),
   content: z.string(),
   author: z.number(),
   attachments: File.array()
})

export type toType<T extends z.ZodTypeAny> = T["_output"]

///

import { Socket, Server } from "npm:socket.io@4"
import { Arguments } from "./utils.ts"
import { Database } from "./database.ts"

export interface ChatifySocket extends Socket {
   self?: toType<typeof SelfUser>
}

export type PacketHandler = {
   event: string
   handler: (event: PacketRequest) => void
}

export type PacketRequest = {
   io: Server
   socket: ChatifySocket
   args: Arguments
   self: toType<typeof SelfUser>
   database: Database
}
