import { User, SelfUser } from "./types.d.ts"

export function strip(user: SelfUser): User {
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
}
