class TupleMap<K extends unknown[], V> {
  private root = new Map<unknown, any>();

  set(key: K, value: V): void {
    let current = this.root;

    for (const ki of key) {
      if (!current.has(ki)) {
        current.set(ki, new Map());
      }
      current = current.get(ki);
    }

    current.set(key[key.length - 1], value);
  }

  get(key: K): V | undefined {
    let current = this.root;

    for (const ki of key) {
      if (!current.has(ki)) {
        return undefined;
      }
      current = current.get(ki);
    }

    return current.get(key[key.length - 1]);
  }

  has(key: K): boolean {
    let current = this.root;

    for (const ki of key) {
      if (!current.has(ki)) {
        return false;
      }
      current = current.get(ki);
    }

    return true;
  }

  delete(key: K): boolean {
    let current = this.root;
    let parents: Map<any, any>[] = [];

    for (const ki of key) {
      if (!current.has(ki)) {
        return false;
      }
      parents.push(current);
      current = current.get(ki);
    }

    const result = current.delete(key[key.length - 1]);

    // Clean up empty map chains
    if (result && current.size === 0 && parents.length > 0) {
      for (let i = parents.length - 1; i >= 0; i--) {
        if (current.size === 0) {
          parents[i].delete(key[i]);
          current = parents[i];
        } else {
          break;
        }
      }
    }
    return result;
  }

  clear(): void {
    this.root.clear();
  }
}
