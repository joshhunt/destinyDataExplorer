import { Store } from "redux";
import { setSearchResults } from "store/filter";

export type AnyDefinition = Record<string, unknown>;
export type AnyDefinitionTable = Record<string, AnyDefinition>;

declare global {
  interface Window {
    $errors: unknown[];
  }
}

// You can't (???) have indexable properties on a class AND
// have methods, so we have some abstract classes and helpers to
abstract class Indexable {
  [key: string]: AnyDefinition;
}

abstract class IsIndexable {
  asIndexable() {
    return this as unknown as Indexable;
  }

  set(key: string, value: AnyDefinition) {
    this.asIndexable()[key] = value;
  }

  get(key: string): AnyDefinition {
    return this.asIndexable()[key];
  }
}

type PredicateFn = (def: AnyDefinition, hash: string) => boolean;
type MapFn<T = unknown> = (def: AnyDefinition, hash: string) => T;

function makeSearchResults(def: AnyDefinition) {
  const hash = def.hash;
  const type = def.$type;

  return {
    dxId: `${type}:${hash}`,
    type: type,
    key: hash,
  };
}

export class DXCollection extends IsIndexable {
  #reduxStore: Store;

  constructor(store: any, obj: AnyDefinitionTable = {}) {
    super();

    this.#reduxStore = store;

    for (const key in obj) {
      this.set(key, obj[key]);
    }
  }

  show(): void {
    const results = this.map((v) => makeSearchResults(v));
    this.#reduxStore.dispatch(setSearchResults(results));
  }

  map<T>(fn: MapFn<T>): T[] {
    const items = Object.entries(this.asIndexable());
    return items.map(([hash, item]) => fn(item, hash));
  }

  forEach(fn: MapFn): void {
    const items = Object.entries(this.asIndexable());
    items.forEach(([hash, item]) => fn(item, hash));
  }

  filter(predicate: PredicateFn): DXCollection {
    window.$errors = [];
    const results = new DXCollection(this.#reduxStore);

    for (const key in this.asIndexable()) {
      const item = this.get(key);
      let result = false;

      try {
        result = predicate(item, key);
      } catch (error) {
        window.$errors.push(error);
      }

      if (result) {
        results.set(key, item);
      }
    }

    if (window.$errors.length) {
      const firstError = window.$errors[0];
      console.error(
        `There were ${window.$errors.length} items that threw an exception when trying to filter, which have not been included. See all the errors on window.$errors.`
      );
      console.error("First exception:", firstError);
    }

    return results;
  }
}
