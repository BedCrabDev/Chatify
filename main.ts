// @deno-types="npm:@types/express"
import express from "npm:express@4";
import { Server } from "npm:socket.io@4";
// @deno-types="npm:@types/node"
import { createServer as createHttpServer } from "node:http";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0";
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts";
import { createHash } from "node:crypto";
import { User, SelfUser, ChatifySocket } from "./types.d.ts";
import { decode } from "https://deno.land/std/encoding/base64.ts"
const env = await load();

// this is astro's favorite function
function strip(user: SelfUser): User {
    return {
        id: user.id,
        displayName: user.displayName,
        handle: user.handle,
        created: user.created,
    }
}

// @ts-nocheck any
type sex = any;

const app = express();
const server = createHttpServer(app);
const io = new Server(server, {
    serveClient: false,
    cors: {
        origin: '*',
    },
    allowEIO3: true
});

const supabase = createClient(
    env["SUPABASE_URL"],
    env["SUPABASE_SERVICE_ROLE"]
);

io.use(async (socket: ChatifySocket, next) => {
    const authStorage = socket.handshake.auth.token;
    console.log(authStorage)
    if (!authStorage) {
        console.log("1")
        next(new Error("No authenthication provided: see spec for info"));
        return;
    }
    
    let auth;

    try {
        auth = JSON.parse(new TextDecoder().decode(decode(authStorage)));
    } catch (_error) {
        console.error(_error)
        console.log("2")
        next(new Error("Invalid JSON or Base64: see spec for info"));
        return;
    }

    const userId = auth["id"];
    const userPass = auth["pass"];

    if (!userId || !userPass) {
        console.log("3")
        next(new Error("Missing id or pass: see spec for info"));
        return;
    }
    
    const hashed = createHash("sha256").update(userPass).digest("hex");

    const response = await supabase
        .from("users")
        .select()
        .eq("id", userId)
        .eq("key", hashed);

    if (response.error) {
        console.log("4")
        next(new Error("real error"));
        console.error(response.error);
        return;
    }

    if (response.data.length < 1) {
        console.log("5")
        next(new Error("Invalid credentials"));
        return;
    }

    const data: sex = response.data[0];

    socket.self = {
        id: data.id,
        created: data.created_at,
        handle: data.handle,
        displayName: data.display,

        handleLastUpdated: data.handle_updated,
        email: data.email
    }

    console.log("NEXT")

    next();
});

io.on("connect", (socket: ChatifySocket) => {
    console.log("PIPE BOMB")
    const message = "😼 " + socket.handshake.address;

    if (!socket.self) {
        // log the requesters ip 😼
        socket.send(message);
        console.log(message);
        socket.disconnect();
        return;
    }

    console.log(socket.self.handle + " (" + message + ") has connected.");

    socket.emit("hello", socket.self);
});

// app routes

app.get("/files/:userId/:fileName", (req, res) => {
    res.redirect(`https://aejkgpldmjxkcfaourbd.supabase.co/storage/v1/object/public/user_data/${req.params.userId}/${req.params.fileName}`);
});

app.get("/geolocate", (req, res) => {
    res.redirect("/geolocate/" + req.ip)
})

app.get("/geolocate/:ip", async(req, res) => {
    const data = await (await fetch("http://ip-api.com/json/" + req.params.ip)).json()
    res.send(data)
})

app.get("/cat", (_req, res) => {
    res.redirect("https://cataas.com/cat")
})

app.get("/joe", async(_req, res) => {
    const response = await fetch("https://api.yomomma.info/");
    const data = await response.json()

    res.send(data.joke)
})

app.get("/sex", (req, res) => {
    res.send(Math.random() < 0.1 ? "<h1 style='font-size:100px'>😼 <a href='/dox'>" + req.ip : "sex")
})

app.get("/dox", (req, res) => {
    res.send("<!DOCTYPE html><html lang=\"en\"> <head> <title>xd</title> <meta charset=\"UTF-8\"/> <meta name=\"viewport\" content=\"width=device-width\"\/> </head> <body> <h1 data-endpoint=\"/sex\"></h1> <p data-endpoint=\"/joe\"></p><pre></pre> <script> (async ()=>{for (const elem of document.querySelectorAll('[data-endpoint]')){const endpoint=elem.getAttribute('data-endpoint'); elem.innerHTML=await (await fetch(endpoint)).text();}const ip=await (await fetch('https://ifconfig.me/ip')).text(); const ipData=await (await fetch('/geolocate/' + ip)).json(); const message=`Your IP is ${ip}, you are located in ${ipData.city}, ${ipData.country} and ${ipData.isp} is your ISP.`; document.querySelector('pre').textContent=message;})(); </script> </body></html>");
})

server.listen(8080);
