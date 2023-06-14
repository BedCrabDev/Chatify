// @deno-types="npm:@types/express"
import express from "npm:express@4"
import { Server } from "npm:socket.io@4"
// @deno-types="npm:@types/node"
import { createServer as createHttpServer } from "node:http"
// @deno-types="npm:@types/node"
import { createHash } from "node:crypto"
import { ChatifySocket } from "./types.ts"
import { decode as decodeBase64 } from "https://deno.land/std@0.191.0/encoding/base64.ts"
import { DatabaseInstance } from "./database.ts"
import getAllHandlers from "./handlers.ts"
import { Arguments } from "./utils.ts"

// create the express & socket.io apps
const server = createHttpServer(express())
const io = new Server(server, {
   serveClient: false,
   // @ts-expect-error cors property exists
   cors: {
      origin: "*"
   },
   allowEIO3: true
})
const handlers = getAllHandlers()

// authenthication middleware
io.use(async (socket: ChatifySocket, next) => {
   // get token variable
   const authStorage = socket.handshake.auth.token
   if (!authStorage) {
      next(new Error("No authenthication provided: see docs for info"))
      return
   }

   // decode token
   let auth

   // base64
   try {
      auth = new TextDecoder().decode(decodeBase64(authStorage))
   } catch (error) {
      console.error(error)
      next(new Error("Invalid Base64: see docs for info"))
      return
   }

   // json
   try {
      auth = JSON.parse(auth)
   } catch (error) {
      console.error(error)
      next(new Error("Invalid JSON (unparsable): see docs for info"))
      return
   }

   // get info from token
   const userId = auth["id"]
   const userPass = auth["pass"]

   if (!userId || !userPass) {
      next(new Error("Invalid JSON (missing id or pass property): see docs for info"))
      return
   }

   // check if the user exists
   const hashed = createHash("sha256").update(userPass).digest("hex")
   const selfUser = await DatabaseInstance.authenticate(userId, hashed)

   if (!selfUser) {
      next(new Error("Invalid credentials"))
      return
   }

   // login the user
   socket.self = selfUser
   next()
})

io.on("connect", (socket: ChatifySocket) => {
   // this should never happen
   if (!socket.self) {
      socket.disconnect()
      return
   }

   console.log(socket.self.handle + " has connected.")
   socket.emit("hello", socket.self)

   // register handlers
   handlers.forEach((handler) => {
      socket.on(handler.event, (...args: unknown[]) => {
         if (!socket.self) return
         handler.handler({
            io,
            socket,
            args: new Arguments(args),
            self: socket.self,
            database: DatabaseInstance
         })
      })
   })
})

// start the http server
server.listen(8080)
// local link -> http://localhost:8080
