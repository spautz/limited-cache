import { describe, it } from 'vitest';

import { LimitedCacheObject } from '../../index.js';

/**
 * This is not a source file or test file.
 * Instead, it ensures that the typeChecks are correct.
 */

let value;

const defaultCache = LimitedCacheObject();

defaultCache.number = 1;
defaultCache.string = 'hello';
defaultCache.array = [];
value = defaultCache.number as number;
value = defaultCache.string as string;
value = defaultCache.array as Array<undefined>;

const numberCache = LimitedCacheObject<number>();

numberCache.number = 1;
value = numberCache.number as number;

// @ts-expect-error Invalid type
numberCache.string = 'hello';
// @ts-expect-error Invalid type
numberCache.array = [];

// @ts-expect-error Invalid type
value = numberCache.string as string;
// @ts-expect-error Invalid type
value = numberCache.array as Array<undefined>;

const primitiveCache = LimitedCacheObject<boolean | number | string>();

primitiveCache.number = 1;
primitiveCache.string = 'hello';
value = primitiveCache.number as number;
value = primitiveCache.string as string;

// @ts-expect-error Invalid type
primitiveCache.array = [];

// @ts-expect-error Invalid type
value = primitiveCache.array as Array<undefined>;

const arrayCache = LimitedCacheObject<Array<undefined>>();

arrayCache.array = [];
value = arrayCache.array as Array<undefined>;

// @ts-expect-error Invalid type
arrayCache.number = 1;
// @ts-expect-error Invalid type
arrayCache.string = 'hello';

// @ts-expect-error Invalid type
value = arrayCache.number as number;
// @ts-expect-error Invalid type
value = arrayCache.string as string;

// Fake test, to make Vitest happy
describe('fake typeCheck test', () => {
  it('does nothing', () => null);
});

// Fake export, to make the linter happy
export { value };
