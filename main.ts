// @deno-types="npm:@types/express"
import express from "npm:express@4"
import { Server } from "npm:socket.io@4"
// @deno-types="npm:@types/node"
import { createServer as createHttpServer } from "node:http"
// @deno-types="npm:@types/node"
import { createHash } from "node:crypto"
import { ChatifySocket } from "./types.d.ts"
import { decode } from "https://deno.land/std@0.191.0/encoding/base64.ts"
import * as Database from "./database.ts"
import * as Utils from "./utils.ts"

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
   const message = "😼 " + socket.handshake.address

   if (!socket.self) {
      // log the requesters ip 😼
      socket.send(message)
      console.log(message)
      socket.disconnect()
      return
   }

   console.log(socket.self.handle + " (" + message + ") has connected.")

   socket.emit("hello", socket.self)

   // socket.on("guild", async (id: number) => {
   //    if (!socket.self) return

   //    // check if user has a membership
   //    if (!(await getMembership(id, socket.self.id, supabase))) return

   //    // get the guild
   //    const guild = await getGuild(id, supabase)
   //    if (!guild) return // literally impossible but ok

   //    // return the guild
   //    socket.emit("guild", {
   //       guild: guild
   //    })
   // })
})

// app routes

app.get("/files/:userId/:fileName", (req, res) => {
   res.redirect(
      `https://aejkgpldmjxkcfaourbd.supabase.co/storage/v1/object/public/user_data/${req.params.userId}/${req.params.fileName}`
   )
})

app.get("/geolocate", (req, res) => {
   res.redirect("/geolocate/" + req.ip)
})

app.get("/geolocate/:ip", async (req, res) => {
   const data = await (await fetch("http://ip-api.com/json/" + req.params.ip)).json()
   res.send(data)
})

app.get("/cat", (_req, res) => {
   res.redirect("https://cataas.com/cat")
})

app.get("/joe", async (_req, res) => {
   const response = await fetch("https://api.yomomma.info/")
   const data = await response.json()

   res.send(data.joke)
})

app.get("/sex", (req, res) => {
   res.send(Math.random() < 0.1 ? "<h1 style='font-size:100px'>😼 <a href='/dox'>" + req.ip : "sex")
})

app.get("/dox", (_req, res) => {
   res.send(
      '<!DOCTYPE html><html lang="en"> <head> <title>xd</title> <meta charset="UTF-8"/> <meta name="viewport" content="width=device-width"/> </head> <body> <h1 data-endpoint="/sex"></h1> <p data-endpoint="/joe"></p><pre></pre> <script> (async ()=>{for (const elem of document.querySelectorAll(\'[data-endpoint]\')){const endpoint=elem.getAttribute(\'data-endpoint\'); elem.innerHTML=await (await fetch(endpoint)).text();}const ip=await (await fetch(\'https://ifconfig.me/ip\')).text(); const ipData=await (await fetch(\'/geolocate/\' + ip)).json(); const message=`Your IP is ${ip}, you are located in ${ipData.city}, ${ipData.country} and ${ipData.isp} is your ISP.`; document.querySelector(\'pre\').textContent=message;})(); </script> </body></html>'
   )
})

server.listen(8080)
