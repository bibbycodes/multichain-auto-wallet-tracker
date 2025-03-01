import {Singleton} from "../services/util/singleton";
import {TelegramClient as GramJsClient} from "telegram";
import {StringSession} from "telegram/sessions";
import {env} from "../services/util/env/env";
import * as input from "input";


export class TelegramListener extends Singleton {
  private isConnected: boolean = false

  constructor(
    private gramJsClient: GramJsClient = new GramJsClient(
      new StringSession(env.telegram.sessionString),
      env.telegram.apiId,
      env.telegram.apiHash, {
        connectionRetries: 5,
      }),
  ) {
    super()
  }

  async connect() {
    if (!this.isConnected) {
      await this.gramJsClient.connect();
      this.isConnected = true
    }
  }

  async listenForMessages() {
    await this.connect()
    this.gramJsClient.addEventHandler((update) => {
      console.log("Received update")
      console.info(JSON.stringify(update))
    })
  }

  async getSessionString() {
    await this.gramJsClient.start({
      phoneNumber: await input.text('Please enter the phone number'),
      phoneCode: async () => await input.text('Please enter the code you received: '),
      onError: (err) => console.error(err),
    });

    const sessionString = this.gramJsClient.session.save();
    console.info("You should now be connected.");
    console.info(this.gramJsClient.session.save());
    await this.gramJsClient.sendMessage("me", {message: sessionString as unknown as string});
    await this.gramJsClient.disconnect();
  }
}

TelegramListener.getInstance().getSessionString()
