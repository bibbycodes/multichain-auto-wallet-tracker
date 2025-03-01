export enum Events {
  Swap = 'Swap',
}

export interface EventData<T = any> {
  type: Events;
  data: T; 
}
