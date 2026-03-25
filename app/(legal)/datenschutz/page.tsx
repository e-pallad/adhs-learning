import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutzerklärung — Devfluent",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="text-gray-600 text-sm leading-6 space-y-3">{children}</div>
    </section>
  )
}

export default function DatenschutzPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
      <p className="text-sm text-gray-500 mb-8">Stand: März 2026</p>

      <Section title="1. Verantwortlicher">
        <p>
          Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
        </p>
        {/* TODO: Echte Angaben eintragen */}
        <address className="not-italic leading-7">
          <strong>[Vor- und Nachname / Firmenname]</strong><br />
          [Straße und Hausnummer]<br />
          [PLZ] [Stadt]<br />
          Deutschland<br />
          E-Mail: [E-Mail-Adresse]
        </address>
      </Section>

      <Section title="2. Erhobene Daten und Zweck der Verarbeitung">
        <p>
          Wir verarbeiten personenbezogene Daten nur, soweit dies für die Bereitstellung
          der Plattform erforderlich ist. Im Einzelnen:
        </p>

        <h3 className="font-semibold text-gray-700 mt-4">a) Registrierung und Authentifizierung</h3>
        <p>
          Zur Nutzung von Devfluent ist ein Konto erforderlich. Dabei wird Ihre
          <strong> E-Mail-Adresse</strong> verarbeitet. Die Authentifizierung erfolgt
          wahlweise über einen Magic Link (E-Mail-OTP), Passwort oder Google OAuth
          (jeweils über Supabase Auth).
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>

        <h3 className="font-semibold text-gray-700 mt-4">b) Nutzungsdaten und Lernfortschritt</h3>
        <p>
          Zur Bereitstellung der Kernfunktionen (Lernverfolgung, XP-System, Streak,
          Achievements) speichern wir:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Lernblock-Fortschritt und Abschlüsse</li>
          <li>Quiz-Ergebnisse</li>
          <li>XP-Punkte, Level und Streak-Zähler</li>
          <li>Freigeschaltete Achievements</li>
          <li>Kurs- und Projekteinträge</li>
          <li>Zeitstempel der letzten Anmeldung (für Streak-Berechnung)</li>
        </ul>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
        </p>

        <h3 className="font-semibold text-gray-700 mt-4">c) Server-Logs</h3>
        <p>
          Beim Abruf der Webanwendung werden durch den Hosting-Anbieter automatisch
          Server-Logfiles gespeichert (IP-Adresse, Zeitstempel, aufgerufene URL,
          HTTP-Status, übertragene Datenmenge). Diese Daten sind für uns nicht
          personenbezogen zugänglich und werden nach 7 Tagen automatisch gelöscht.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an
          Betriebssicherheit).
        </p>
      </Section>

      <Section title="3. Auftragsverarbeiter und Drittdienste">
        <h3 className="font-semibold text-gray-700 mb-2">Supabase</h3>
        <p>
          Wir nutzen <strong>Supabase</strong> (Supabase Inc., 970 Trestle Glen Rd,
          Oakland, CA 94610, USA) als Datenbank- und Authentifizierungsdienstleister.
          Supabase verarbeitet personenbezogene Daten in unserem Auftrag auf Basis
          eines Auftragsverarbeitungsvertrags (DPA) gemäß Art. 28 DSGVO. Die
          Datenbank befindet sich in der Region <strong>eu-west-1 (Irland)</strong>,
          sodass keine Datenübertragung in Drittländer stattfindet.
        </p>
        <p>
          Weitere Informationen: <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            supabase.com/privacy
          </a>
        </p>

        <h3 className="font-semibold text-gray-700 mt-4 mb-2">Google OAuth (optional)</h3>
        <p>
          Wenn Sie sich mit Google anmelden, werden Ihre Google-Kontodaten
          (E-Mail-Adresse, Name) zur Kontoerstellung verwendet. Es gilt die
          Datenschutzerklärung von Google: <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            policies.google.com/privacy
          </a>.
        </p>
      </Section>

      <Section title="4. Cookies und lokale Speicherung">
        <p>
          Die Anwendung verwendet <strong>funktionale Cookies</strong> ausschließlich
          für die Aufrechterhaltung der Anmeldesitzung (Session-Token von Supabase Auth).
          Diese Cookies sind technisch notwendig und erfordern keine gesonderte
          Einwilligung gemäß § 25 Abs. 2 TTDSG.
        </p>
        <p>
          Es werden keine Tracking-Cookies, Werbe-Cookies oder Cookies von
          Drittanbietern zu Analysezwecken gesetzt.
        </p>
      </Section>

      <Section title="5. Speicherdauer">
        <p>
          Personenbezogene Daten werden gespeichert, solange Ihr Konto aktiv ist.
          Nach Löschung Ihres Kontos werden alle zugehörigen Daten innerhalb von
          <strong> 30 Tagen</strong> aus unseren Systemen gelöscht, sofern keine
          gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>
      </Section>

      <Section title="6. Ihre Rechte (Art. 15–22 DSGVO)">
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Auskunft</strong> über die zu Ihrer Person gespeicherten Daten (Art. 15)</li>
          <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16)</li>
          <li><strong>Löschung</strong> Ihrer Daten ("Recht auf Vergessenwerden") (Art. 17)</li>
          <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18)</li>
          <li><strong>Datenübertragbarkeit</strong> in einem maschinenlesbaren Format (Art. 20)</li>
          <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21)</li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte wenden Sie sich bitte per E-Mail an:{" "}
          <a href="mailto:[E-Mail-Adresse]" className="text-indigo-600 hover:underline">
            [E-Mail-Adresse]
          </a>
        </p>
        <p>
          Sie haben zudem das Recht, sich bei einer Datenschutzaufsichtsbehörde zu
          beschweren. Die zuständige Aufsichtsbehörde richtet sich nach Ihrem Wohnsitz
          oder dem Sitz unseres Unternehmens.
        </p>
      </Section>

      <Section title="7. Datensicherheit">
        <p>
          Die Übertragung von Daten zwischen Ihrem Browser und unseren Servern erfolgt
          ausschließlich über <strong>HTTPS</strong> (TLS-Verschlüsselung). Passwörter
          werden niemals im Klartext gespeichert. Datenbankverbindungen sind
          authentifiziert und verschlüsselt.
        </p>
      </Section>

      <Section title="8. Änderungen dieser Datenschutzerklärung">
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen der
          Rechtslage oder der Datenverarbeitungsprozesse anzupassen. Die aktuelle
          Version ist stets unter <strong>/datenschutz</strong> abrufbar. Bei
          wesentlichen Änderungen werden registrierte Nutzer per E-Mail informiert.
        </p>
      </Section>
    </article>
  )
}
