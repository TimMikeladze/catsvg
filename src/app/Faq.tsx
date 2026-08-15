import { FAQ } from '../seo/site';

/**
 * The same questions the prerendered HTML and the FAQPage structured data
 * carry, rendered for people. All three read from one list on purpose: what a
 * crawler is told and what a visitor sees must be the same page.
 */
export function Faq() {
  return (
    <div className="card">
      <h2>Questions</h2>
      <dl className="faq">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt>{item.q}</dt>
            <dd>{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
