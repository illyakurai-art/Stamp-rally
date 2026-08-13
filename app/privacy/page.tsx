import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 py-8 md:py-16">
      <div className="w-full max-w-2xl">
        <div className="rounded-xl border border-foreground/10 bg-background p-8 shadow-lg">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground/50">
              Stamp Rally
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Informativa Privacy
            </h1>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
            <h2 className="text-xl font-bold text-foreground" style={{ borderBottom: "2px solid var(--border)", paddingBottom: "10px" }}>
              Informativa Privacy – Gioco di Raccolta Stamp-Rally Novegro
            </h2>

            <p>
              Ai sensi del Regolamento UE 2016/679 (<strong>&ldquo;GDPR&rdquo;</strong>), ti forniamo in modo semplice e trasparente tutte le informazioni sul trattamento dei dati che inserisci per partecipare al nostro gioco.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">1. Chi tratta i tuoi dati (Titolare del Trattamento)</h3>
            <p>
              Il titolare del trattamento è <strong>IllyA</strong>, contattabile all&apos;indirizzo email: <strong>aylli@hotmail.it</strong>.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">2. Quali dati raccogliamo e perché</h3>
            <p>Per permetterti di giocare, accumulare punti e gestire la tua sessione, ti chiediamo solo due informazioni:</p>
            <p className="pl-4 border-l-[3px] border-foreground/20">
              • <strong>Nickname:</strong> scelto liberamente da te (ti consigliamo di non usare il tuo vero nome e cognome).
            </p>
            <p className="pl-4 border-l-[3px] border-foreground/20">
              • <strong>Password:</strong> creata da te per proteggere il tuo accesso al gioco.
            </p>
            <p className="pl-4 border-l-[3px] border-foreground/20">
              • <strong>Dati tecnici:</strong> il sistema registra temporaneamente il tuo indirizzo IP per motivi di sicurezza e per garantire il corretto funzionamento dell&apos;applicazione.
            </p>
            <p>
              La base giuridica di questo trattamento è l&apos;<strong>esecuzione di un contratto</strong> (la tua richiesta volontaria di partecipare al gioco).
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">3. Come proteggiamo i tuoi dati (Sicurezza)</h3>
            <p>La tua sicurezza è fondamentale. Applichiamo misure tecniche rigorose:</p>
            <p>
              La tua password <strong>non viene mai salvata in chiaro</strong> nel nostro database. Tutte le password vengono protette immediatamente tramite algoritmi di <strong>crittografia e hashing sicuro</strong>.
            </p>
            <p>Questo significa che nessuno, compresi gli amministratori del sistema, ha la possibilità di leggere la tua password reale.</p>

            <h3 className="text-lg font-semibold text-foreground mt-6">4. Per quanto tempo conserviamo i dati</h3>
            <p>
              I dati raccolti (nickname, punteggi e password hashate) verranno <strong>eliminati definitivamente entro 7 giorni dal termine dell&apos;evento</strong>. Non verrà effettuata alcuna copia di backup o conservazione successiva dei dati oltre questo termine.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">5. I tuoi diritti</h3>
            <p>
              Il GDPR ti garantisce il diritto di chiedere l&apos;accesso ai tuoi dati, la rettifica, la <strong>cancellazione immediata</strong> o la limitazione del trattamento. Per esercitare questi diritti, puoi inviare una email a: <strong>aylli@hotmail.it</strong>.
            </p>
            <p>
              Hai inoltre il diritto di proporre reclamo al <strong>Garante per la protezione dei dati personali</strong> se ritieni che il trattamento violi le disposizioni di legge.
            </p>
          </div>

          <Link
            href="/auth/sign-up"
            className="mt-8 inline-block w-full rounded-xl bg-foreground py-3 text-center text-sm font-semibold text-background transition-opacity hover:opacity-90"
            style={{ boxShadow: "6px 6px 0 rgba(0, 0, 0, 0.25)" }}
          >
            Torna indietro
          </Link>
        </div>
      </div>
    </div>
  );
}