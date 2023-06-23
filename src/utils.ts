import { User, SelfUser, toType } from "./types.ts"

/**
 * Turns a SelfUser object into a User object
 * @param user The SelfUser object
 * @returns A new User object
 */
export function strip(user: toType<typeof SelfUser>): toType<typeof User> {
   return {
      id: user.id,
      displayName: user.displayName,
      handle: user.handle,
      created: user.created
   }
}

export class Arguments {
   constructor(private args: unknown[]) {}

   getString(index: number): string | undefined {
      if (!this.args[index]) return undefined
      const value = this.args[index]

      if (typeof value == "number") {
         return `${value}`
      } else if (typeof value == "string") {
         return value
      } else {
         return undefined
      }
   }

   getNumber(index: number): number | undefined {
      if (!this.args[index]) return undefined
      const value = this.args[index]

      if (typeof value == "string") {
         const numberValue = Number(value)
         if (isNaN(numberValue)) return undefined
         return numberValue
      } else if (typeof value == "number") {
         return value
      } else {
         return undefined
      }
   }

   getObject(index: number): Record<string, unknown> | undefined {
      if (!this.args[index]) return undefined
      const value = this.args[index]

      if (typeof value == "object" && value != null) {
         return value as Record<string, unknown>
      } else {
         return undefined
      }
   }

   getRecord(index: number): unknown[] | undefined {
      if (!this.args[index]) return undefined
      const value = this.args[index]

      if (Array.isArray(value)) {
         return value
      } else {
         return undefined
      }
   }
}
