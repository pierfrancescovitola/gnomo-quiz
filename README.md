# Quanto conosci il tuo fidanzato? ♡

Un piccolo quiz romantico (e assolutamente imparziale) per Gnomo.
Sito statico in HTML, CSS e JavaScript puro: niente framework, backend, tracciamento o servizi esterni.

## Struttura

```
index.html        tutte le schermate del quiz
style.css         palette, layout, animazioni (rispetta "riduci movimento")
script.js         logica del quiz e interazioni
assets/
  bunny.png       coniglietto ritagliato, sfondo trasparente (usato dal sito)
  (bunny.jpg nella cartella principale è l'originale: il sito non lo usa)
.nojekyll         serve a GitHub Pages per pubblicare i file così come sono
```

Le espressioni del coniglietto (triste con le lacrime, felice con i saltelli e i cuoricini)
sono disegnate in SVG sopra l'illustrazione originale e animate in CSS, quindi il passaggio
tra uno stato e l'altro è istantaneo e c'è una sola immagine da caricare.

## Provarlo in locale

Basta aprire `index.html` con un doppio clic.

Per provarlo dal telefono sulla stessa rete Wi-Fi, avvia un piccolo server dalla cartella del progetto:

```bash
# con Node
npx serve .
# oppure con Python
python -m http.server 8000
```

e apri dal telefono `http://<IP-del-computer>:8000`.

## Pubblicarlo con GitHub Pages

1. Crea un nuovo repository su GitHub (anche privato va bene con un piano che supporta Pages; altrimenti pubblico).
2. Carica i file del progetto:
   ```bash
   git init
   git add .
   git commit -m "Quiz per Gnomo"
   git branch -M main
   git remote add origin https://github.com/<tuo-utente>/<nome-repo>.git
   git push -u origin main
   ```
   (oppure trascina i file con "Add file → Upload files" dal sito di GitHub).
3. Nel repository vai su **Settings → Pages**.
4. In **Build and deployment** scegli **Source: Deploy from a branch**, poi branch **main** e cartella **/ (root)**, e salva.
5. Dopo un minuto circa il sito sarà su `https://<tuo-utente>.github.io/<nome-repo>/`.

Tutti i percorsi sono relativi, quindi funziona anche dentro una sottocartella.

## Personalizzare

- Testi: direttamente in `index.html` (domande, certificato) e in `script.js` (messaggi di feedback).
- Colori: variabili in cima a `style.css`.
- Quanto cresce "Da impazzire": costante `MAX_GROW` in `script.js` e limiti in `.btn--grow` in `style.css`.
- Quanto cresce il "Sì": costanti `YES_STEP` e `YES_MAX` in `script.js`.
