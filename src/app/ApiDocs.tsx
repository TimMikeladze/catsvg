import { PARAMS, ROUTES, SNIPPETS } from '../seo/site';

/** Reference for the image endpoint. */
export function ApiDocs() {
  return (
    <div className="card docs">
      <h2>Use it anywhere</h2>
      <ul className="snippet-list">
        {SNIPPETS.map((s) => (
          <li key={s.label}>
            <span className="snippet-label">{s.label}</span>
            <code className="mono">{s.code}</code>
          </li>
        ))}
      </ul>

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
