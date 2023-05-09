import { useState } from 'react';
import { LimitedCache } from 'limited-cache';

const limitedCache = LimitedCache({
  maxCacheSize: 5,
  maxCacheTime: 30000,
  warnIfItemPurgedBeforeTime: 0,
});
limitedCache.set('Key 1', 'Item 1');
limitedCache.set('Key 2', 'Item 2');
limitedCache.set('Key 3', 'Item 3');

function App() {
  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const allCachedItems = limitedCache.getAll();

  return (
    <>
      <form
        onSubmit={(e) => {
          if (keyInput && valueInput) {
            limitedCache.set(keyInput, valueInput);
            setKeyInput('');
            setValueInput('');
          }
          e.preventDefault();
        }}
      >
        <fieldset>
          <label>
            Key
            <input
              type="text"
              name="key"
              placeholder="Key"
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                e.preventDefault();
              }}
            />
          </label>
          <label>
            Value
            <input
              type="text"
              name="value"
              placeholder="Value"
              value={valueInput}
              onChange={(e) => {
                setValueInput(e.target.value);
                e.preventDefault();
              }}
            />
          </label>
          <button type="submit">Add</button>
        </fieldset>
      </form>
      <h1>LimitedCache Contents</h1>
      <p>
        This limited-cache has very low limits: only the five most recent items are retained, and
        only for 30 seconds.
      </p>
      <ul>
        {Object.keys(allCachedItems).map((cachedKey) => (
          <li key={cachedKey}>
            {cachedKey}: {allCachedItems[cachedKey]}
          </li>
        ))}
      </ul>
      <h2>Raw CacheMeta Data</h2>
      <pre>{JSON.stringify(limitedCache.getCacheMeta(), null, 2)}</pre>
    </>
  );
}

export default App;
export { App };
