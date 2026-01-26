======= Flusso Dei Dati ========

#Paziente:
	-Registrare account
	-Login account
	-Prenotazione delle visite
	-Conferma o Rifiuta visite di controllo prescritte dal dottore o riprogrammazioni
	-Visualizza storico appuntamenti (Scegliendo reparto e dottore)
	-Visualizza Referto per ogni appuntamento (Se appuntamento è stato confermato e completato)

#Dottore:
	-Login account
	-Conferma, Annulla, Completa, Riprogramma appuntamenti dei pazienti
	-Compila il referto (Automaticamente appuntamento Completato)
	-Riprogramma visite di controllo per rivedere il Paziente
	-Modifica le proprie disponibilità.
	-Visualizza lo storico delle proprie visite effettuate
	-Visualizza i referti compilati delle proprie visite effettuate

#Admin:
	-Login account
	-Crea account Admin
	-Conferma, Annulla e Completa appuntamenti dei Pazienti
	-Crea Reparti e account di dominio dei Dottori
	-Visualizza lo storico di tutti gli appuntamenti della clinica

======= Account per test ========

#Paziente: Si può creare in autonomia un account per testare l'app lato Paziente

#Dottore:
	-Email: doc2@doc.it | Password: 12345678 (Dr. Mario Neri)
	-Email: doc3@doc.it | Password: 12345678 (Dr. Mario Verdi)
	-Email: doc4@doc.it | Password: 12345678 (Dr. Ferrelli Antonio)
	-Email: doc5@doc.it | Password: 12345678 (Dr. Hassan Anafi)
	-Email: doc6@doc.it | Password: 12345678 (Dr.ssa Gioi Manila)
	-Email: doc7@doc.it | Password: 12345678 (Dr. Orru Giuseppe)
	-Si può creare Dottore in autonomia dalla sezione Admin

#Admin:
	-Email: superadmin@admin.it | Password: 12345678
	-Si può creare nuovo utente admin da questa sezione


======= Informazioni Utili ========

-Quando si aggiunge il dottore non presenta campi nome e cognome ma uno solo si richiede di compilarlo in questo modo [Dr./Dr.ssa (Nome) (Cognome)].
-Fare attenzione a come si compilano i campi perché al momento non esistono controlli molto stretti.
-Per vedere gli stati al momento basta fare il refresh della Pagina (es. Paziente prenota appuntamento, non apparirà in appuntamenti a meno che non si faccia il refresh della pagina).

======= Accessibilità ========
L'app è funzionante e accessibile al sito:
- mymed-app.it
È possibile provarlo in locale scaricando l'intera repository e configurando un server in locale MongoDB (Vedi Documentazione originale).
Nella repository è presente un backup del database usato per i test.
