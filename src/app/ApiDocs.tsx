const ROUTES: Array<[string, string]> = [
  ['/cat/mackerel.svg', 'Seeded cat, 400×400.'],
  ['/cat/240/mackerel.svg', 'Square at 240px.'],
  ['/cat/1200x300/mackerel.svg', 'Any width×height up to 2000.'],
  ['/cat/320x320/random.svg', 'A different cat every request (never cached).'],
  ['/cat/400?seed=biscuit', 'Query form — same thing.'],
];

const PARAMS: Array<[string, string]> = [
  ['seed', 'Any string. Same seed always returns the same cat.'],
  ['w, h', 'Size override, 16–2000px.'],
  ['preset', 'anything · minimal · maximal · noir · pastel · feral'],
  ['text', 'Caption pill, e.g. text=1200x300.'],
  ['<trait>', 'Pin one trait: eyes=star, palette=neon, body=loaf, …'],
];

/** Reference for the image endpoint. */
export function ApiDocs() {
  return (
    <div className="card docs">
      <h2>URL API</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">URL</th>
            <th scope="col">What you get</th>
          </tr>
        </thead>
        <tbody>
          {ROUTES.map(([route, what]) => (
            <tr key={route}>
              <td>{route}</td>
              <td>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Query parameters</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Param</th>
            <th scope="col">Effect</th>
          </tr>
        </thead>
        <tbody>
          {PARAMS.map(([param, effect]) => (
            <tr key={param}>
              <td>{param}</td>
              <td>{effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">
        Every seeded response is immutable and cached for a year — the cat is a pure function of its URL.
      </p>
    </div>
  );
}
