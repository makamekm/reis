export type Jsonable = {
  [name: string]: string | number | boolean | Jsonable | string[] | number[] | boolean[] | Jsonable[]
}

declare global {
  interface Array<T> {
    replace(newArr: Array<T>): void;
  }
}

export interface IModel {
  toJson(): Jsonable
  init?(): Promise<void>
}

let models: { [name: string]: new (initialState?: Jsonable) => IModel } = {};

export async function getStores(initialStates: { [name: string]: Jsonable } = {}): Promise<{ [name: string]: IModel }> {
  const result: { [name: string]: IModel } = {};
  const resolvers: any[] = [];

  for (const name in models) {
    result[name] = new models[name](initialStates[name]);
    if (result[name].init) resolvers.push(result[name].init());
  }

  await Promise.all(resolvers);

  return result;
}

export function clearModels() {
  models = {};
}

export function model<T extends IModel = T>(name: string): (target: new (initialState?: Jsonable) => T) => new (initialState?: Jsonable) => T {
  return (target) => {
    models[name] = target;
    return target;
  }
}

export function serialize(stores: { [name: string]: IModel }): { [name: string]: Jsonable } {
  const result: { [name: string]: Jsonable } = {};

  for (const name in stores) {
    result[name] = stores[name].toJson();
  }

  return result;
}