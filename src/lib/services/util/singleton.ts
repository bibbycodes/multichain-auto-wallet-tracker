export class Singleton {
  private static instances: WeakMap<Function, Singleton> = new WeakMap();

  // Private constructor ensures this class cannot be instantiated directly
  protected constructor() {}

  // Static method to retrieve the singleton instance with optional parameters
  public static getInstance<T extends Singleton>(this: new (params?: any) => T, params?: any): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, new this(params));
    }
    return Singleton.instances.get(this) as T;
  }
}
