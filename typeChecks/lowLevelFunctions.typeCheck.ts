import { lowLevelInit, lowLevelGetOne, lowLevelSet } from '../src';

/**
 * This is not a source file or test file.
 * Instead, it ensures that the typeChecks are correct.
 */

let value;

const defaultCacheMeta = lowLevelInit();

lowLevelSet(defaultCacheMeta, 'number', 1);
lowLevelSet(defaultCacheMeta, 'string', 'hello');
lowLevelSet(defaultCacheMeta, 'array', []);
value = lowLevelGetOne(defaultCacheMeta, 'number') as number;
value = lowLevelGetOne(defaultCacheMeta, 'string') as string;
value = lowLevelGetOne(defaultCacheMeta, 'array') as Array<undefined>;

const numberCacheMeta = lowLevelInit<number>();

lowLevelSet(numberCacheMeta, 'number', 1);
value = lowLevelGetOne(numberCacheMeta, 'number') as number;

// @ts-expect-error Invalid type
lowLevelSet(numberCacheMeta, 'string', 'hello');
// @ts-expect-error Invalid type
lowLevelSet(numberCacheMeta, 'array', []);

// @ts-expect-error Invalid type
value = lowLevelGetOne(numberCacheMeta, 'string') as string;
// @ts-expect-error Invalid type
value = lowLevelGetOne(numberCacheMeta, 'array') as Array<undefined>;

const primitiveCacheMeta = lowLevelInit<boolean | number | string>();

lowLevelSet(primitiveCacheMeta, 'number', 1);
lowLevelSet(primitiveCacheMeta, 'string', 'hello');
value = lowLevelGetOne(primitiveCacheMeta, 'number') as number;
value = lowLevelGetOne(primitiveCacheMeta, 'string') as string;

// @ts-expect-error Invalid type
lowLevelSet(primitiveCacheMeta, 'array', []);

// @ts-expect-error Invalid type
value = lowLevelGetOne(primitiveCacheMeta, 'array') as Array<undefined>;

const arrayCacheMeta = lowLevelInit<Array<undefined>>();

lowLevelSet(arrayCacheMeta, 'array', []);
value = lowLevelGetOne(arrayCacheMeta, 'array') as Array<undefined>;

// @ts-expect-error Invalid type
lowLevelSet(arrayCacheMeta, 'number', 1);
// @ts-expect-error Invalid type
lowLevelSet(arrayCacheMeta, 'string', 'hello');

// @ts-expect-error Invalid type
value = lowLevelGetOne(arrayCacheMeta, 'number') as number;
// @ts-expect-error Invalid type
value = lowLevelGetOne(arrayCacheMeta, 'string') as string;

// Fake export, to make the linter happy
export { value };
