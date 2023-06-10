import { User, SelfUser } from "./types.d.ts"

export function strip(user: SelfUser): User {
   return {
      id: user.id,
      displayName: user.displayName,
      handle: user.handle,
      created: user.created
   }
}
