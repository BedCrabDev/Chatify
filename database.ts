import { Guild, File, User, Membership, Channel, Message, SelfUser, toType } from "./types.ts"
import { load } from "https://deno.land/std@0.190.0/dotenv/mod.ts"
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.24.0"

// fetch env
const env = await load()

export class Database {
   constructor(private supabase: SupabaseClient) {}

   /**
    * Authenthicates a user
    * @param id The user's ID
    * @param key The user's key
    * @returns SelfUser if the user exists and id/key are correct, undefined if not
    */
   async authenticate(id: number, key: string): Promise<toType<typeof SelfUser> | undefined> {
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

   /**
    * Gets a user by their ID.
    * @param id The user's ID
    * @returns User if the user exists, undefined if not
    */
   async getUser(id: number): Promise<toType<typeof User> | undefined> {
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

   /**
    * Gets a File's url.
    * @param file The File
    * @returns A string URL
    */
   getFileURL(file: toType<typeof File>): string {
      return this.supabase.storage
         .from("user_data")
         .getPublicUrl(file.userId + "/" + file.fileName, {
            transform: {
               width: file.width,
               height: file.height
            }
         }).data.publicUrl
   }

   /**
    * Gets a list of guilds a user can access.
    * @param userId The user's ID
    * @returns A list of guilds, undefined if an error occurs or a user is in no guilds
    */
   async getGuildList(userId: number): Promise<toType<typeof Guild>[]> {
      const { data, error } = await this.supabase
         .from("memberships")
         .select("guilds(*)")
         .eq("user", userId)

      if (error) {
         console.error(error)
         return []
      }

      const result: toType<typeof Guild>[] = []

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

   /**
    * Gets a guild by its ID.
    * @param id The guild's ID
    * @returns Guild if the guild exists, undefined if not
    */
   async getGuild(id: number): Promise<toType<typeof Guild> | undefined> {
      const { data, error } = await this.supabase.from("guilds").select().eq("id", id)

      if (error) {
         console.error(error)
         return undefined
      }

      if (!data[0]) return undefined

      const result = data[0]

      const guild: toType<typeof Guild> = {
         id: id,
         name: result["name"],
         created: result["created_at"]
      }

      const icon: toType<typeof File> | undefined = createFile(result.icon)
      if (icon) guild.icon = icon

      return guild
   }

   /**
    * Gets a membership object for a user and a guild.
    * @param guild The guild's id
    * @param user The user's id
    * @returns Membership if it exists, undefined if not
    */
   async getMembership(
      guild: number,
      user: number
   ): Promise<toType<typeof Membership> | undefined> {
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

   /**
    * Gets a channel by its ID.
    * @param id The channel's id
    * @returns Channel if the channel exists, or undefined if not
    */
   async getChannel(id: number): Promise<toType<typeof Channel> | undefined> {
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

   /**
    * Gets a message by its ID.
    * @param id The message's id
    * @returns Message if the message exists, or undefined if not
    */
   async getMessage(id: number): Promise<toType<typeof Message> | undefined> {
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

export const DatabaseInstance = new Database(
   createClient(env["SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE"], {
      auth: {
         // to disable a warning
         persistSession: false
      }
   })
)

///
///
/// UTILS
///
///

// deno-lint-ignore no-explicit-any
function createFile(jsonb: any | undefined): toType<typeof File> | undefined {
   if (!jsonb) {
      return undefined
   }

   if (!jsonb.userId || !jsonb.fileName) {
      return undefined
   }

   if (typeof jsonb.userId == "string" || typeof jsonb.fileName == "string") {
      return undefined
   }

   const file: toType<typeof File> = {
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
function createFileBulk(jsonb: any | undefined): toType<typeof File>[] {
   if (!jsonb) {
      return []
   }

   // deno-lint-ignore no-explicit-any
   const anyArray = jsonb as any[]
   const fileArray: toType<typeof File>[] = []

   anyArray.forEach((anyElem) => {
      const fileElem = createFile(anyElem)
      if (fileElem) fileArray.push(fileElem)
   })

   return fileArray
}
