"use client";

import { useI18n } from "@/lib/i18n/context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PrivacyCheckbox() {
  const { t } = useI18n();
  return (
    <p className="text-sm leading-relaxed text-foreground/60">
      {t("privacy_consent")}{" "}
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t("privacy_policy")}
          </button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-4 text-sm text-foreground/70">
            {/* TODO: inserire il testo dell'informativa sulla privacy */}
            <p>
              <div className="privacy-container" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: "var(--foreground)", lineHeight: 1.6, maxWidth: "800px", margin: "0 auto", padding: "20px", textAlign: "left" }}>
    
    <h2 style={{ color: "var(--foreground)", fontSize: "24px", fontWeight: 700, marginBottom: "20px", borderBottom: "2px solid var(--border)", paddingBottom: "10px" }}>Informativa Privacy – Gioco di Raccolta Stamp-Rally Novegro</h2>

    <p style={{ marginBottom: "20px" }}>Ai sensi del Regolamento UE 2016/679 (<strong>&ldquo;GDPR&rdquo;</strong>), ti forniamo in modo semplice e trasparente tutte le informazioni sul trattamento dei dati che inserisci per partecipare al nostro gioco.</p>

    <h3 style={{ color: "var(--foreground)", fontSize: "18px", fontWeight: 600, marginTop: "25px", marginBottom: "10px" }}>1. Chi tratta i tuoi dati (Titolare del Trattamento)</h3>
    <p style={{ marginBottom: "15px" }}>Il titolare del trattamento &egrave; <strong>IllyA </strong>, contattabile all'indirizzo email: <strong>aylli@hotmail.it</strong>.</p>

    <h3 style={{ color: "var(--foreground)", fontSize: "18px", fontWeight: 600, marginTop: "25px", marginBottom: "10px" }}>2. Quali dati raccogliamo e perch&eacute;</h3>
    <p style={{ marginBottom: "10px" }}>Per permetterti di giocare, accumulare punti e gestire la tua sessione, ti chiediamo solo due informazioni:</p>
    <p style={{ marginBottom: "10px", paddingLeft: "15px", borderLeft: "3px solid var(--primary)" }}>&bull; <strong>Nickname:</strong> scelto liberamente da te (ti consigliamo di non usare il tuo vero nome e cognome).</p>
    <p style={{ marginBottom: "10px", paddingLeft: "15px", borderLeft: "3px solid var(--primary)" }}>&bull; <strong>Password:</strong> creata da te per proteggere il tuo accesso al gioco.</p>
    <p style={{ marginBottom: "15px", paddingLeft: "15px", borderLeft: "3px solid var(--primary)" }}>&bull; <strong>Dati tecnici:</strong> il sistema registra temporaneamente il tuo indirizzo IP per motivi di sicurezza e per garantire il corretto funzionamento dell'applicazione.</p>
    <p style={{ marginBottom: "20px" }}>La base giuridica di questo trattamento &egrave; l'<strong>esecuzione di un contratto</strong> (la tua richiesta volontaria di partecipare al gioco).</p>

    <h3 style={{ color: "var(--foreground)", fontSize: "18px", fontWeight: 600, marginTop: "25px", marginBottom: "10px" }}>3. Come proteggiamo i tuoi dati (Sicurezza)</h3>
    <p style={{ marginBottom: "10px" }}>La tua sicurezza &egrave; fondamentale. Applichiamo misure tecniche rigorose:</p>
    <p style={{ marginBottom: "10px" }}>La tua password <strong>non viene mai salvata in chiaro</strong> nel nostro database. Tutte le password vengono protette immediatamente tramite algoritmi di <strong>crittografia e hashing sicuro</strong>.</p>
    <p style={{ marginBottom: "20px" }}>Questo significa che nessuno, compresi gli amministratori del sistema, ha la possibilit&agrave; di leggere la tua password reale.</p>

    <h3 style={{ color: "var(--foreground)", fontSize: "18px", fontWeight: 600, marginTop: "25px", marginBottom: "10px" }}>4. Per quanto tempo conserviamo i dati</h3>
    <p style={{ marginBottom: "20px" }}>I dati raccolti (nickname, punteggi e password hashiate) verranno <strong>eliminati definitivamente entro 7 giorni dal termine dell'evento</strong>. Non verr&agrave; effettuata alcuna copia di backup o conservazione successiva dei dati oltre questo termine.</p>

    <h3 style={{ color: "var(--foreground)", fontSize: "18px", fontWeight: 600, marginTop: "25px", marginBottom: "10px" }}>5. I tuoi diritti</h3>
    <p style={{ marginBottom: "15px" }}>Il GDPR ti garantisce il diritto di chiedere l'accesso ai tuoi dati, la rettifica, la <strong>cancellazione immediata</strong> o la limitazione del trattamento. Per esercitare questi diritti, puoi inviare una email a: <strong>aylli@hotmail.it</strong>.</p>
    <p style={{ marginBottom: "20px" }}>Hai inoltre il diritto di proporre reclamo al <strong>Garante per la protezione dei dati personali</strong> se ritieni che il trattamento violi le disposizioni di legge.</p>

</div>


            </p>
          </div>
        </DialogContent>
      </Dialog>
    </p>
  );
}
