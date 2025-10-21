import { TelegramMessageFormatter } from "../../../src/lib/services/telegram-message-formatter/telegram-message-formatter"
import { BaseContext } from "../../../src/lib/services/token-context/base-context"
import baseContextJson from '../../fixtures/context/base-context.json'

export const testMessageFormatter = async (tokenAddress: string) => {
    const baseContext = BaseContext.fromJson(JSON.stringify(baseContextJson))
    const messageFormatter = new TelegramMessageFormatter(await baseContext.toObject())
    return messageFormatter.getAlertMessage()
}

testMessageFormatter('0x0A43fC31a73013089DF59194872Ecae4cAe14444').then(console.log)