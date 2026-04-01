import type { Metadata } from "next"
import { getLocale, getDictionary } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Devfluent",
}

export default async function DatenschutzPage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const d = t.datenschutz
  const s = d.sections

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{d.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{d.subtitle}</p>

      {/* Section 1 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s1.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s1.p1}</p>
          <address className="not-italic leading-7">
            <strong>devfluent, Inh. Eric Pallad</strong><br />
            Burgstädter Str. 17<br />
            09212 Limbach-Oberfrohna<br />
            Deutschland<br />
            E-Mail: kontakt@devfluent.de
          </address>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s2.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s2.p1}</p>

          <h3 className="font-semibold text-gray-700 mt-4">{s.s2.authHeading}</h3>
          <p>{s.s2.authText}</p>
          <p>{s.s2.authBasis}</p>

          <h3 className="font-semibold text-gray-700 mt-4">{s.s2.usageHeading}</h3>
          <p>{s.s2.usageText}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {s.s2.usageItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{s.s2.usageBasis}</p>

          <h3 className="font-semibold text-gray-700 mt-4">{s.s2.logsHeading}</h3>
          <p>{s.s2.logsText}</p>
          <p>{s.s2.logsBasis}</p>
        </div>
      </section>

      {/* Section 3 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s3.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-2">{s.s3.supabaseHeading}</h3>
          <p>{s.s3.supabaseText}</p>
          <p>
            {s.s3.supabaseMore}{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              supabase.com/privacy
            </a>
          </p>

          <h3 className="font-semibold text-gray-700 mt-4 mb-2">{s.s3.netcupHeading}</h3>
          <p>{s.s3.netcupText}</p>
          <p>
            {s.s3.netcupMore}{" "}
            <a href="https://www.netcup.de/kontakt/datenschutzerklaerung.php" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              netcup.de/kontakt/datenschutzerklaerung.php
            </a>
          </p>

          <h3 className="font-semibold text-gray-700 mt-4 mb-2">{s.s3.githubHeading}</h3>
          <p>{s.s3.githubText}</p>
        </div>
      </section>

      {/* Section 4 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s4.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s4.p1}</p>
          <p>{s.s4.p2}</p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s5.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s5.p1}</p>
        </div>
      </section>

      {/* Section 6 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s6.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s6.p1}</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            {s.s6.rights.map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
          <p>
            {s.s6.contact}{" "}
            <a href="mailto:kontakt@devfluent.de" className="text-indigo-600 hover:underline">
              kontakt@devfluent.de
            </a>
          </p>
          <p>{s.s6.supervisory}</p>
        </div>
      </section>

      {/* Right to Object */}
      <section className="mb-8">
        <div className="border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            {s.objection.heading}
          </h2>
          <div className="text-gray-700 text-sm leading-6 space-y-3">
            <p><strong>{s.objection.p1}</strong></p>
            <p>{s.objection.p2}</p>
            <p>
              {s.objection.p3}{" "}
              <a href="mailto:kontakt@devfluent.de" className="text-indigo-600 hover:underline">
                kontakt@devfluent.de
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s7.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s7.p1}</p>
        </div>
      </section>

      {/* Section 9 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s9.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s9.p1}</p>
        </div>
      </section>

      {/* Section 10 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{s.s10.title}</h2>
        <div className="text-gray-600 text-sm leading-6 space-y-3">
          <p>{s.s10.p1}</p>
        </div>
      </section>
    </article>
  )
}
