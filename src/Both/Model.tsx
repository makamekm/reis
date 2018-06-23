export type Jsonable = {
  [name: string]: string | number | boolean | Jsonable
}

export interface IModel {
  constructor(initialState?: Jsonable)
  toJson(): Jsonable
}

let models: { [name: string]: new (initialState?: Jsonable) => IModel } = {};

export function getStores(initialStates: { [name: string]: Jsonable } = {}): { [name: string]: IModel } {
  const result: { [name: string]: IModel } = {};

  for (const name in models) {
    result[name] = new models[name](initialStates[name]);
  }

  return result;
}

export function clearModels() {
  models = {};
}

export function model<T>(name: string): (target: (new () => IModel) & T) => T {
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