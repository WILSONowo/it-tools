import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export { useQueryParam };

const transformers = {
  number: {
    fromQuery: (value: string) => Number(value),
    toQuery: (value: number) => String(value),
  },
  string: {
    fromQuery: (value: string) => value,
    toQuery: (value: string) => value,
  },
  boolean: {
    fromQuery: (value: string) => value.toLowerCase() === 'true',
    toQuery: (value: boolean) => (value ? 'true' : 'false'),
  },
};

/** A value synced with a URL query parameter (omitted from the URL while it equals the default). */
function useQueryParam<T extends string | number | boolean>({ name, defaultValue }: { name: string; defaultValue: T }) {
  const type = typeof defaultValue;
  const transformer = transformers[type as keyof typeof transformers] ?? transformers.string;
  const route = useRoute();
  const router = useRouter();

  return computed<T>({
    get() {
      const raw = route.query[name];
      const value = Array.isArray(raw) ? raw[0] : raw;
      return value == null ? defaultValue : (transformer.fromQuery(value) as T);
    },
    set(value) {
      const query = { ...route.query };
      if (value === defaultValue) {
        delete query[name];
      } else {
        query[name] = transformer.toQuery(value as never);
      }
      router.replace({ query });
    },
  });
}
