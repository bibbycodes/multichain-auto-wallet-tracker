import {EventBus} from "../event-bus";
import {Events} from "../event-bus/types";

export class EvmSwapConsumer {
  private eventBus: EventBus
  constructor() {
    this.eventBus = EventBus.getInstance();
  }
  
  async start(): Promise<void> {
    this.eventBus.on(Events.Swap, async (event) => {
      console.log('Received swap event:', event);
    })
  }
  
}
