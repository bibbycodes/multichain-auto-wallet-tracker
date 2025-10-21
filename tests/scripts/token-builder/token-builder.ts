import { AutoTrackerTokenBuilder } from "../../../src/lib/services/token-builder/token-builder"

export const testTokenBuilder = async () => {
    const tokenBuilder = new AutoTrackerTokenBuilder('0xe8852d270294cc9a84fe73d5a434ae85a1c34444')
    const token = await tokenBuilder.getToken()
    console.log(token)
}