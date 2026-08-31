# Yo Soy El Rey

Juego de cartas en el navegador: declarás el **Rey**, derrocás, pescás del pozo y el primero en **40** se lleva la corona.

Jugás solo o en mesa de varios. No hay servidor ni build: HTML, CSS y JavaScript.

**Jugar online:** [dcolombres.github.io/lamedia](https://dcolombres.github.io/lamedia/)  
**En local:** abrí [`index.html`](index.html) en el navegador.  
**Reglamento en PDF:** [`Yo Soy El Rey - Reglamento.pdf`](Yo%20Soy%20El%20Rey%20-%20Reglamento.pdf)  
**Reglamento completo (reglas, ejemplos y consejos):** [`reglamento.md`](reglamento.md)  
**Solo reglas:** [`instrucciones.md`](instrucciones.md)  
**Solo consejos:** [`consejos.md`](consejos.md)

---

## Cómo se juega

Baraja francesa de 54 cartas (del 2 al As en cuatro palos, más 2 comodines). De a 2 jugadores se reparte **12** cartas; de a 3 o más, **8**. El resto queda en el pozo.

Quien tenga el **K♥** abre la ronda con esa carta. En las manos siguientes elige el ganador.

### Una mano

1. El de turno tira una carta: es el **Rey** y fija el palo.
2. Los turnos siguen: podés **tirar otra del palo** para ir ganando.
3. **Pasar** o **descartar** cierra la mano. Gana quien iba arriba. Si descartás, podés pescar del pozo.
4. **Derrocar** o **comodín** también se pueden. Gana la más alta del palo (el **K** es la más alta), salvo **la media** o un comodín.

Si el Rey es un comodín y tenés el otro, tenés que tirarlo.

### La media

Si **declarás un 6** como Rey, ese 6 ya es el centro y **gana la mano**. No hay que acercarse después: el 7, el 5 o el K del mismo palo pierden. Solo te la sacan un **comodín** u **otro 6** que derroque (ahí se cae la media y gana la más alta del palo nuevo).

Si el **pozo se acaba**, no se mezcla de nuevo en esa ronda: se sigue con las cartas de la mano. Descartar cierra, pero no pescás. Recién al **cerrar la ronda** se vuelve a repartir.

### Puntos

| Jugada | Puntos |
|---|---|
| Ganar la mano | +1 |
| Derrocar y ganar | +2 |
| Cerrar (ganar con tu última carta) | esos puntos, **+3**, y **+1** por carta ajena (**máx. +4**) |

Primero en **40** gana. Empate en 40 o más: ronda extra.

---

## Cómo correrlo

No hace falta instalar nada.

```bash
# cloná el repo y abrí el juego
git clone https://github.com/dcolombres/lamedia.git
cd lamedia
```

Después abrí `index.html` (doble clic, o “Open with Live Server” en el editor). `play.html` es la misma mesa.

La mesa se publica con GitHub Pages: [dcolombres.github.io/lamedia](https://dcolombres.github.io/lamedia/). Cada push a `main` vuelve a publicar.

La primera vez hay que activar Pages (GitHub no lo deja hacer al workflow): [Settings → Pages](https://github.com/dcolombres/lamedia/settings/pages) → **Source: GitHub Actions**. Después reejecutá el workflow en [Actions](https://github.com/dcolombres/lamedia/actions).

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` / `play.html` | Mesa, menú, reglas en pantalla y tutorial |
| `styles.css` | Estilo de la mesa |
| `game.js` | Turnos, mesa, marcador y pozo |
| `Yo Soy El Rey - Reglamento.pdf` | Reglamento impreso (A4, portada y ejemplos) |
| `reglamento.md` | Reglamento completo: reglas, ejemplos y consejos |
| `tools/build-reglamento-pdf.py` | Regenera el PDF desde `reglamento.md` |
| `instrucciones.md` | Solo reglas |
| `consejos.md` | Solo cómo pensar cada jugada |

---

## Estado

Versión jugable en local, solo o mesa de 3 a 6. En cada mano se puede **seguir tirando del palo**; **pasar** o **descartar** cierra y gana quien iba arriba.
