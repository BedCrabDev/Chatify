import { Guild, File, User, Membership, Channel, Message, SelfUser } from "./types.d.ts"
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.24.0"

///
///
/// SETUP
///
///

const env = await load()

const SUPABASE_URL = env["SUPABASE_URL"].endsWith("/")
   ? env["SUPABASE_URL"].substring(0, env["SUPABASE_URL"].length)
   : env["SUPABASE_URL"]

const FILE_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/user_data`

const supabase = createClient(env["SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE"], {
   auth: {
      // to disable a warning
      persistSession: false
   }
})

///
///
/// UTILS
///
///

// deno-lint-ignore no-explicit-any
function createFile(jsonb: any | undefined): File | undefined {
   if (!jsonb) {
      return undefined
   }

   if (!jsonb.userId || !jsonb.fileName) {
      return undefined
   }

   if (typeof jsonb.userId == "string" || typeof jsonb.fileName == "string") {
      return undefined
   }

   const file: File = {
      userId: jsonb.userId,
      fileName: jsonb.fileName
   }

   if (
      jsonb.width &&
      typeof jsonb.width == "number" &&
      jsonb.height &&
      typeof jsonb.height == "number"
   ) {
      file.width = jsonb.width
      file.height = jsonb.height
   }

   return file
}

// deno-lint-ignore no-explicit-any
function createFileBulk(jsonb: any | undefined): File[] {
   if (!jsonb) {
      return []
   }

   // deno-lint-ignore no-explicit-any
   const anyArray = jsonb as any[]
   const fileArray: File[] = []

   anyArray.forEach((anyElem) => {
      const fileElem = createFile(anyElem)
      if (fileElem) fileArray.push(fileElem)
   })

   return fileArray
}

///
///
/// EXPORTED
///
///

export async function authenticate(id: number, key: string): Promise<SelfUser | undefined> {
   const { data, error } = await supabase.from("users").select().eq("id", id).eq("key", key)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) {
      return undefined
   }

   const result = data[0]

   return {
      id: id,
      created: result.created_at,
      handle: result.handle,
      displayName: result.display,

      handleLastUpdated: result.handle_updated,
      email: result.email
   }
}

export async function getUser(id: number): Promise<User | undefined> {
   const { data, error } = await supabase.from("users").select().eq("id", id)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) return undefined

   const result = data[0]

   return {
      id: id,
      created: result["created_at"],
      handle: result["handle"],
      displayName: result["display"]
   }
}

export function getFileURL(file: File): string {
   let fileUrl = `${FILE_BASE_URL}/${file.userId}/${file.fileName}?`

   if (file.width && file.height) {
      fileUrl += `width=${file.width}&height=${file.height}&`
   }

   return fileUrl.substring(0, fileUrl.length - 1)
}

export async function getGuild(id: number): Promise<Guild | undefined> {
   const { data, error } = await supabase.from("guilds").select().eq("id", id)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) return undefined

   const result = data[0]

   const guild: Guild = {
      id: id,
      name: result["name"],
      created: result["created_at"]
   }

   const icon: File | undefined = createFile(result.icon)
   if (icon) guild.icon = icon

   return guild
}

export async function getMembership(guild: number, user: number): Promise<Membership | undefined> {
   const { data, error } = await supabase
      .from("memberships")
      .select()
      .eq("guild", guild)
      .eq("user", user)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) return undefined

   const result = data[0]

   return {
      guild: result["guild"],
      user: result["user"]
   }
}

export async function getChannel(id: number): Promise<Channel | undefined> {
   const { data, error } = await supabase.from("channels").select().eq("id", id)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) return undefined

   const result = data[0]

   return {
      id: id,
      guild: result["guild"],
      created: result["created_at"],
      name: result["name"],
      description: result["description"]
   }
}

export async function getMessage(id: number): Promise<Message | undefined> {
   const { data, error } = await supabase.from("channels").select().eq("id", id)

   if (error) {
      console.error(error)
      return undefined
   }

   if (!data[0]) return undefined

   const result = data[0]

   return {
      id: id,
      created: result["created_at"],
      channel: result["channel"],
      content: result["content"],
      author: result["author"],
      attachments: createFileBulk(result["attachments"])
   }
}
