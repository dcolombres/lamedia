# Yo Soy El Rey

Juego de cartas en el navegador: declarás el **Rey**, derrocás, pescás del pozo y el primero en **21** se lleva la corona.

Jugás vos contra una o varias IA. No hay servidor ni build: HTML, CSS y JavaScript.

**Jugar online:** [dcolombres.github.io/lamedia](https://dcolombres.github.io/lamedia/)  
**En local:** abrí [`index.html`](index.html) en el navegador.  
**Reglas completas:** [`instrucciones.md`](instrucciones.md)

---

## Cómo se juega

Baraja francesa de 54 cartas (del 2 al As en cuatro palos, más 2 comodines). De a 2 jugadores se reparte **12** cartas; de a 3 o más, **8**. El resto queda en el pozo.

Quien tenga el **K♥** abre la ronda con esa carta. En las manos siguientes elige el ganador.

### Una mano

1. El de turno tira una carta: es el **Rey** y fija el palo.
2. Cada uno **elige**:
   - **Seguir el palo** — una carta de ese palo para competir; el resto se guarda.
   - **Derrocar** — el mismo número de otro palo. El palo cambia.
   - **Comodín** — gana a cualquier Rey.
   - **Descartar** — otra carta (no compite). Después podés pescar del pozo.
   - **Pasar** — no tirás nada y te guardás la mano.
3. Seguir el palo no es obligatorio. Si tu carta no gana, conviene pasar y guardarla.
4. Gana la más alta del palo vigente (el **K** es la más alta, el **As** la más baja), salvo **la media** o un comodín.

Si el Rey es un comodín y tenés el otro, tenés que tirarlo.

### La media

Si **declarás un 6** como Rey, no gana lo más alto: gana lo más cerca del 6. El propio 6 gana (salvo comodín). El K queda último. Si derrocan, la media se cae y vuelve a ganar la más alta.

### Puntos

| Jugada | Puntos |
|---|---|
| Ganar la mano | +1 |
| Derrocar y ganar | +2 |
| Cerrar (ganar con tu última carta) | esos puntos, **+5**, y **+1** por cada carta que les queda a los demás |

Primero en **21** gana. Empate en 21 o más: ronda extra.

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
| `game.js` | Turnos, IA, marcador y pozo |
| `instrucciones.md` | Reglamento |

---

## Estado

Versión jugable en local, 1 vs IA o mesa de 3 a 6. La regla de **pasar / no seguir el palo de forma obligatoria** está en evaluación: el objetivo es que cada turno sea una decisión, no un descarte forzado.
