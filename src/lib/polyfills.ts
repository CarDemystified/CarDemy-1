// Custom polyfills for sandboxed environments to prevent "TypeError: Illegal constructor"
if (typeof window !== 'undefined') {
  const tryConstruct = (ctor: any, ...args: any[]) => {
    try {
      if (!ctor) return false;
      new ctor(...args);
      return true;
    } catch (e: any) {
      // Any error during standard basic construction indicates a broken/illegal constructor in this sandbox
      return false;
    }
  };

  const patchGlobal = (prop: string, customCtor: any) => {
    const targets = [window, globalThis, self].filter(t => typeof t !== 'undefined');
    for (const target of targets) {
      try {
        Object.defineProperty(target, prop, { value: customCtor, configurable: true, writable: true });
      } catch (_) {
        try {
          (target as any)[prop] = customCtor;
        } catch (err) {
          console.warn(`Failed to patch ${prop} on target:`, err);
        }
      }
    }
  };

  // Polyfill Headers if needed
  if (typeof Headers === 'undefined' || !tryConstruct(Headers)) {
    class CustomHeaders {
      private map = new Map<string, string>();
      constructor(init?: any) {
        if (!init) return;
        if (typeof init.forEach === 'function') {
          init.forEach((value: string, key: string) => {
            this.set(key, value);
          });
        } else if (Array.isArray(init)) {
          for (const item of init) {
            if (Array.isArray(item) && item.length >= 2) {
              this.set(String(item[0]), String(item[1]));
            }
          }
        } else if (typeof init === 'object' && init !== null) {
          for (const key of Object.keys(init)) {
            this.set(key, String((init as any)[key]));
          }
        }
      }
      append(name: string, value: string): void {
        const key = name.toLowerCase();
        const existing = this.map.get(key);
        this.map.set(key, existing ? `${existing}, ${value}` : value);
      }
      delete(name: string): void {
        this.map.delete(name.toLowerCase());
      }
      get(name: string): string | null {
        return this.map.get(name.toLowerCase()) ?? null;
      }
      has(name: string): boolean {
        return this.map.has(name.toLowerCase());
      }
      set(name: string, value: string): void {
        this.map.set(name.toLowerCase(), value);
      }
      forEach(callback: (value: string, key: string, parent: any) => void, thisArg?: any): void {
        this.map.forEach((value, key) => {
          callback.call(thisArg, value, key, this);
        });
      }
      entries(): IterableIterator<[string, string]> {
        return this.map.entries();
      }
      keys(): IterableIterator<string> {
        return this.map.keys();
      }
      values(): IterableIterator<string> {
        return this.map.values();
      }
      [Symbol.iterator]() {
        return this.map.entries();
      }
    }
    patchGlobal('Headers', CustomHeaders);
  }

  // Polyfill Request if needed
  if (typeof Request === 'undefined' || !tryConstruct(Request, 'https://example.com')) {
    class CustomRequest {
      url: string;
      method: string = 'GET';
      headers: any;
      body: any = null;
      credentials?: string;
      mode?: string;
      cache?: string;
      redirect?: string;
      referrer?: string;

      constructor(input: any, init?: any) {
        this.url = typeof input === 'string' ? input : (input?.url || '');
        const actualInit = init || (typeof input === 'object' && input !== null ? input : {});

        this.method = actualInit.method || 'GET';
        this.headers = new (window as any).Headers(actualInit.headers);
        this.body = actualInit.body || null;
        this.credentials = actualInit.credentials;
        this.mode = actualInit.mode;
        this.cache = actualInit.cache;
        this.redirect = actualInit.redirect;
        this.referrer = actualInit.referrer;
      }
    }
    patchGlobal('Request', CustomRequest);
  }

  // Polyfill Response if needed
  if (typeof Response === 'undefined' || !tryConstruct(Response)) {
    class CustomResponse {
      _body: any;
      status: number;
      statusText: string;
      headers: any;
      ok: boolean;

      constructor(body?: any, init?: any) {
        this._body = body;
        this.status = init?.status ?? 200;
        this.statusText = init?.statusText ?? 'OK';
        this.headers = new (window as any).Headers(init?.headers);
        this.ok = this.status >= 200 && this.status < 300;
      }
      async json() {
        return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
      }
      async text() {
        return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
      }
    }
    patchGlobal('Response', CustomResponse);
  }

  // Wrap fetch to transparently support CustomHeaders and CustomRequest
  const nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    const customFetch = async (input: any, init?: any) => {
      let url = input;
      let options = init || {};

      // If input is our polyfilled Request
      if (input && typeof input === 'object' && 'url' in input) {
        url = input.url;
        options = {
          method: input.method || 'GET',
          headers: input.headers,
          body: input.body,
          ...options,
        };
      }

      // Convert our custom Headers to a plain object so native fetch doesn't throw type errors
      if (options.headers) {
        if (typeof options.headers.forEach === 'function') {
          const plainHeaders: Record<string, string> = {};
          options.headers.forEach((value: string, key: string) => {
            plainHeaders[key] = value;
          });
          options.headers = plainHeaders;
        } else if (typeof options.headers.entries === 'function') {
          const plainHeaders: Record<string, string> = {};
          for (const [key, value] of options.headers.entries()) {
            plainHeaders[key] = value;
          }
          options.headers = plainHeaders;
        } else if (options.headers instanceof Map) {
          const plainHeaders: Record<string, string> = {};
          options.headers.forEach((value: any, key: any) => {
            plainHeaders[String(key)] = String(value);
          });
          options.headers = plainHeaders;
        }
      }

      return nativeFetch(url, options);
    };

    patchGlobal('fetch', customFetch);
  }
}

export {};
