import { Guild, File, User, Membership, Channel, Message, SelfUser } from "./types.d.ts"
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.24.0"

const env = await load()

export default class DatabaseFactory {
   private static instance: Database
   private static create(): Database {
      return new Database(
         createClient(env["SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE"], {
            auth: {
               // to disable a warning
               persistSession: false
            }
         })
      )
   }

   static get(): Database {
      if (!DatabaseFactory.instance) {
         DatabaseFactory.instance = this.create()
      }
      return this.instance
   }

   private constructor() {}
}

export class Database {
   private supabase: SupabaseClient
   constructor(client: SupabaseClient) {
      this.supabase = client
   }

   async authenticate(id: number, key: string): Promise<SelfUser | undefined> {
      const { data, error } = await this.supabase.from("users").select().eq("id", id).eq("key", key)

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

   async getUser(id: number): Promise<User | undefined> {
      const { data, error } = await this.supabase.from("users").select().eq("id", id)

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

   getFileURL(file: File): string {
      return this.supabase.storage
         .from("user_data")
         .getPublicUrl(file.userId + "/" + file.fileName, {
            transform: {
               width: file.width,
               height: file.height
            }
         }).data.publicUrl
   }

   async getGuildList(userId: number): Promise<Guild[]> {
      const { data, error } = await this.supabase
         .from("memberships")
         .select("guilds(*)")
         .eq("user", userId)

      if (error) {
         console.error(error)
         return []
      }

      const result: Guild[] = []

      data.forEach((entry) => {
         // @ts-expect-error typescript has brain damage, entry.guilds is not an array
         const guild: Guild = entry.guilds
         result.push({
            id: guild["id"],
            name: guild["name"],
            created: guild["created"]
         })
      })

      return result
   }

   async getGuild(id: number): Promise<Guild | undefined> {
      const { data, error } = await this.supabase.from("guilds").select().eq("id", id)

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

   async getMembership(guild: number, user: number): Promise<Membership | undefined> {
      const { data, error } = await this.supabase
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

   async getChannel(id: number): Promise<Channel | undefined> {
      const { data, error } = await this.supabase.from("channels").select().eq("id", id)

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

   async getMessage(id: number): Promise<Message | undefined> {
      const { data, error } = await this.supabase.from("channels").select().eq("id", id)

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
}

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
