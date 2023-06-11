// @deno-types="npm:@types/express"
import express from "npm:express@4"
import { Server } from "npm:socket.io@4"
// @deno-types="npm:@types/node"
import { createServer as createHttpServer } from "node:http"
// @deno-types="npm:@types/node"
import { createHash } from "node:crypto"
import { ChatifySocket } from "./types.d.ts"
import { decode } from "https://deno.land/std@0.191.0/encoding/base64.ts"
import { DatabaseInstance } from "./database.ts"
import getAllHandlers from "./handlers.ts"
import { Arguments } from "./utils.ts"

const app = express()
const server = createHttpServer(app)
const io = new Server(server, {
   serveClient: false,
   // @ts-expect-error cors property exists
   cors: {
      origin: "*"
   },
   allowEIO3: true
})

const Database = DatabaseInstance
const Handlers = getAllHandlers()

io.use(async (socket: ChatifySocket, next) => {
   const authStorage = socket.handshake.auth.token
   if (!authStorage) {
      next(new Error("No authenthication provided: see docs for info"))
      return
   }

   let auth

   try {
      auth = JSON.parse(new TextDecoder().decode(decode(authStorage)))
   } catch (error) {
      console.error(error)
      next(new Error("Invalid JSON or Base64: see docs for info"))
      return
   }

   const userId = auth["id"]
   const userPass = auth["pass"]

   if (!userId || !userPass) {
      next(new Error("Missing id or pass: see docs for info"))
      return
   }

   const hashed = createHash("sha256").update(userPass).digest("hex")
   const selfUser = await Database.authenticate(userId, hashed)

   if (!selfUser) {
      next(new Error("Invalid credentials"))
      return
   }

   socket.self = selfUser
   next()
})

io.on("connect", (socket: ChatifySocket) => {
   if (!socket.self) {
      socket.disconnect()
      return
   }

   console.log(socket.self.handle + " has connected.")
   socket.emit("hello", socket.self)

   Handlers.forEach((handler) => {
      socket.on(handler.event, (...args) => {
         if (!socket.self) return
         handler.handler({
            io,
            socket,
            args: new Arguments(args),
            self: socket.self,
            database: Database
         })
      })
   })
})

server.listen(8080)
