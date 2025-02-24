export class BaseSingleton {
  // Use WeakMap to store instances
  private static instances: WeakMap<Function, BaseSingleton> = new WeakMap();

  // Private constructor ensures this class cannot be instantiated directly
  protected constructor() {}

  // Static method to retrieve the singleton instance
  public static getInstance<T extends BaseSingleton>(this: new () => T): T {
    if (!BaseSingleton.instances.has(this)) {
      BaseSingleton.instances.set(this, new this());
    }
    return BaseSingleton.instances.get(this) as T;
  }
}
