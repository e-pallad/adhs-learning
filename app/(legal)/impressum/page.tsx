import type { Metadata } from "next"
import { getLocale, getDictionary } from "@/lib/i18n"

export const metadata: Metadata = {
  title: "Impressum — Devfluent",
}

export default async function ImpressumPage() {
  const locale = await getLocale()
  const t = await getDictionary(locale)
  const i = t.impressum

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{i.title}</h1>
      <p className="text-sm text-gray-500 mb-8">{i.subtitle}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{i.provider.heading}</h2>
        <address className="not-italic text-gray-700 leading-7">
          <strong>devfluent, Inh. Eric Pallad</strong><br />
          Burgstädter Str. 17<br />
          09212 Limbach-Oberfrohna<br />
          Deutschland
        </address>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{i.contact.heading}</h2>
        <p className="text-gray-700">
          {i.contact.emailLabel}:{" "}
          <a
            href="mailto:kontakt@devfluent.de"
            className="text-indigo-600 hover:underline"
          >
            kontakt@devfluent.de
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          {i.responsible.heading}
        </h2>
        <address className="not-italic text-gray-700 leading-7">
          Eric Pallad<br />
          Burgstädter Str. 17<br />
          09212 Limbach-Oberfrohna
        </address>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          {i.dispute.heading}
        </h2>
        <p className="text-gray-600 text-sm leading-6">
          {i.dispute.odrText}{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p className="text-gray-600 text-sm leading-6 mt-2">
          {i.dispute.noParticipation}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{i.liability.heading}</h2>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{i.liability.contentHeading}</h3>
        <p className="text-gray-600 text-sm leading-6">
          {i.liability.contentText}
        </p>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{i.liability.linksHeading}</h3>
        <p className="text-gray-600 text-sm leading-6">
          {i.liability.linksText}
        </p>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">{i.liability.copyrightHeading}</h3>
        <p className="text-gray-600 text-sm leading-6">
          {i.liability.copyrightText}
        </p>
      </section>
    </article>
  )
}
