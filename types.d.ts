import { Socket, Server } from "npm:socket.io@4"
import { Arguments } from "./utils.ts"
import { Database } from "./database.ts"

/// internal types

declare interface ChatifySocket extends Socket {
   self?: SelfUser
}

declare type PacketHandler = {
   event: string
   handler: (event: PacketRequest) => void
}

declare type PacketRequest = {
   io: Server
   socket: ChatifySocket
   args: Arguments
   self: SelfUser
   database: Database
}

/// app types

declare type User = {
   id: number
   created: Date
   handle: string
   displayName: string
}

declare type SelfUser = User & {
   handleLastUpdated: Date
   email: string
}

declare type File = {
   userId: number
   fileName: string
   width?: number
   height?: number
}

declare type Guild = {
   id: number
   name: string
   created: Date
   icon?: File
}

declare type Membership = {
   guild: number
   user: number
}

declare type Channel = {
   id: number
   guild: number
   created: Date
   name: string
   description: string
}

declare type Message = {
   id: number
   created: Date
   channel: number
   content: string
   author: number
   attachments: File[]
}
