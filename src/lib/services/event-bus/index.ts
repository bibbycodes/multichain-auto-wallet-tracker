import {filter, Subject} from 'rxjs';
import { Events, EventData } from './types';
import {Singleton} from "../util/singleton";

export class EventBus extends Singleton {
  constructor() {
    super();
  }
  private subject = new Subject<EventData>();

  public emit(event: EventData): void {
    this.subject.next(event);
  }

  public on(eventType: Events, listener: (data: EventData) => void): void {
    this.subject
      .asObservable()
      .pipe(filter((event) => event.type === eventType))
      .subscribe(listener);
  }
}
