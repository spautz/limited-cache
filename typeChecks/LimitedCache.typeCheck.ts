import { LimitedCache } from '../src';

/**
 * This is not a source file or test file.
 * Instead, it ensures that the typeChecks are correct.
 */

let value;

const defaultCache = LimitedCache();

defaultCache.set('number', 1);
defaultCache.set('string', 'hello');
defaultCache.set('array', []);
value = defaultCache.get('number') as number;
value = defaultCache.get('string') as string;
value = defaultCache.get('array') as Array<undefined>;

const numberCache = LimitedCache<number>();

numberCache.set('number', 1);
value = numberCache.get('number') as number;

// @ts-expect-error Invalid type
numberCache.set('string', 'hello');
// @ts-expect-error Invalid type
numberCache.set('array', []);

// @ts-expect-error Invalid type
value = numberCache.get('string') as string;
// @ts-expect-error Invalid type
value = numberCache.get('array') as Array<undefined>;

const primitiveCache = LimitedCache<boolean | number | string>();

primitiveCache.set('number', 1);
primitiveCache.set('string', 'hello');
value = primitiveCache.get('number') as number;
value = primitiveCache.get('string') as string;

// @ts-expect-error Invalid type
primitiveCache.set('array', []);

// @ts-expect-error Invalid type
value = primitiveCache.get('array') as Array<undefined>;

const arrayCache = LimitedCache<Array<undefined>>();

arrayCache.set('array', []);
value = arrayCache.get('array') as Array<undefined>;

// @ts-expect-error Invalid type
arrayCache.set('number', 1);
// @ts-expect-error Invalid type
arrayCache.set('string', 'hello');

// @ts-expect-error Invalid type
value = arrayCache.get('number') as number;
// @ts-expect-error Invalid type
value = arrayCache.get('string') as string;

// Fake export, to make the linter happy
export { value };
