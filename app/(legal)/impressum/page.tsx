import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum — Devfluent",
}

export default function ImpressumPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Impressum</h1>
      <p className="text-sm text-gray-500 mb-8">Angaben gemäß § 5 TMG</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Anbieter</h2>
        <address className="not-italic text-gray-700 leading-7">
          <strong>devfluent, Inh. Eric Pallad</strong><br />
          Burgstädter Str. 17<br />
          09212 Limbach-Oberfrohna<br />
          Deutschland
        </address>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Kontakt</h2>
        <p className="text-gray-700">
          E-Mail:{" "}
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
          Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
        </h2>
        <address className="not-italic text-gray-700 leading-7">
          Eric Pallad<br />
          Burgstädter Str. 17<br />
          09212 Limbach-Oberfrohna
        </address>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Streitschlichtung (§ 36 VSBG)
        </h2>
        <p className="text-gray-600 text-sm leading-6">
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
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
          Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Haftungsausschluss</h2>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">Haftung für Inhalte</h3>
        <p className="text-gray-600 text-sm leading-6">
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen
          oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">Haftung für Links</h3>
        <p className="text-gray-600 text-sm leading-6">
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
          Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
          Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich.
        </p>

        <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">Urheberrecht</h3>
        <p className="text-gray-600 text-sm leading-6">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
          Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung
          des jeweiligen Autors bzw. Erstellers.
        </p>
      </section>
    </article>
  )
}
