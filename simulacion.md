# Simulación de Partida de "Yo soy el Rey"

A continuación se documenta la simulación completa de una partida del juego "Yo soy el Rey" con 4 jugadores, siguiendo las reglas establecidas.

## Configuración Inicial

### Jugadores:

- **Jugador 1 (J1)**
- **Jugador 2 (J2)**
- **Jugador 3 (J3)**
- **Jugador 4 (J4)**

### Cartas Repartidas:

- **J1**: 1 de Copas, 5 de Bastos, 3 de Espadas, 2 de Oros
- **J2**: Rey de Oros, 6 de Bastos, 3 de Copas, 4 de Espadas
- **J3**: 7 de Copas, 6 de Copas, 2 de Bastos, 4 de Oros
- **J4**: 3 de Bastos, 5 de Copas, 2 de Espadas, 4 de Bastos

---

## Desarrollo de la Partida

### Ronda 1 - Rey: Rey de Oros

**Inicia**: J2 (posee el Rey de Oros)

**Jugadas**:
- J2 juega Rey de Oros
- J3 juega 4 de Oros (tiene Oros, juega para ganar)
- J4 no tiene Oros, se descarta con 4 de Bastos
- J1 no tiene Oros, se descarta con 3 de Espadas

**Resultado**:
- Cartas válidas de Oros: Rey (J2) y 4 (J3)
- Gana J2 con el Rey de Oros (carta más alta)
- Nuevo Rey elegido por J2: 6 de Bastos (de su mano)

---

### Ronda 2 - Rey: 6 de Bastos

**Inicia**: J2 (ganador anterior)

**Jugadas**:
- J2 juega 6 de Bastos
- J3 tiene Bastos (2 de Bastos), juega 2 de Bastos
- J4 tiene Bastos (3 y 4 de Bastos), juega 4 de Bastos (su carta más alta)
- J1 tiene Bastos (5 de Bastos), juega 5 de Bastos

**Resultado**:
- Cartas de Bastos jugadas: 6 (J2), 2 (J3), 4 (J4), 5 (J1)
- Gana J2 con el 6 de Bastos (carta más alta)
- Nuevo Rey elegido por J2: 3 de Copas (de su mano)

---

### Ronda 3 - Rey: 3 de Copas

**Inicia**: J2 (ganador anterior)

**Jugadas**:
- J2 juega 3 de Copas
- J3 tiene Copas (7 y 6), juega 7 de Copas (la más alta)
- J4 tiene Copas (5 de Copas), juega 5 de Copas
- J1 tiene Copas (1 de Copas), juega 1 de Copas

**Resultado**:
- Cartas de Copas jugadas: 3 (J2), 7 (J3), 5 (J4), 1 (J1)
- Gana J3 con el 7 de Copas (carta más alta)
- Nuevo Rey elegido por J3: 2 de Bastos (de su mano)

---

### Ronda 4 - Rey: 2 de Bastos

**Inicia**: J3 (ganador anterior)

**Jugadas**:
- J3 juega 2 de Bastos
- J4 tiene Bastos (3 de Bastos), juega 3 de Bastos
- J1 no tiene Bastos (ya jugó su 5 de Bastos), se descarta con 2 de Oros
- J2 no tiene Bastos (ya jugó su 6 de Bastos), se descarta con 4 de Espadas

**Resultado**:
- Cartas válidas de Bastos: 2 (J3) y 3 (J4)
- Gana J4 con el 3 de Bastos (carta más alta)
- Nuevo Rey elegido por J4: 5 de Copas (de su mano)

---

### Ronda 5 - Rey: 5 de Copas

**Inicia**: J4 (ganador anterior)

**Jugadas**:
- J4 juega 5 de Copas
- J1 tiene Copas (1 de Copas), juega 1 de Copas
- J2 tiene Copas (3 de Copas), juega 3 de Copas
- J3 tiene Copas (6 de Copas), juega 6 de Copas

**Resultado**:
- Como el Rey es un 5 de Copas, se aplica la regla especial:
  - Se busca la carta más cercana al 5
  - Distancias: |1-5|=4 (J1), |3-5|=2 (J2), |6-5|=1 (J3)

- Gana J3 con el 6 de Copas (más cercano al 5)
- Nuevo Rey elegido por J3: 4 de Oros (de su mano)

---

### Ronda 6 - Rey: 4 de Oros

**Inicia**: J3 (ganador anterior)

**Jugadas**:
- J3 juega 4 de Oros
- J4 no tiene Oros, se descarta con 2 de Espadas
- J1 no tiene Oros (ya jugó su 2 de Oros), se descarta con 1 de Copas (ya jugada)
- J2 no tiene Oros (ya jugó su Rey de Oros), se descarta con 6 de Bastos (ya jugada)

**Resultado**:
- Única carta válida de Oros: 4 (J3)
- Gana J3 con el 4 de Oros
- Nuevo Rey elegido por J3: 6 de Copas (de su mano)

---

### Ronda 7 - Rey: 6 de Copas

**Inicia**: J3 (ganador anterior)

**Jugadas**:
- J3 juega 6 de Copas
- J4 no tiene Copas (ya jugó su 5 de Copas), se descarta con 3 de Bastos (ya jugada)
- J1 no tiene Copas (ya jugó su 1 de Copas), no tiene cartas para descartar
- J2 tiene Copas (3 de Copas), juega 3 de Copas

**Resultado**:
- Cartas válidas de Copas: 6 (J3) y 3 (J2)
- Como el Rey es un 6 de Copas, se busca la más cercana:
  - |6-6|=0 (J3), |3-6|=3 (J2)

- Gana J3 con el 6 de Copas
- J3 se queda sin cartas y gana la partida

---

## Resumen Final

### Estado final de las manos:
- **J1**: Sin cartas (se descartó todas)
- **J2**: Sin cartas (se descartó todas)
- **J3**: Sin cartas (jugó su última carta)
- **J4**: Sin cartas (se descartó todas)

### Ganador:
- **Jugador 3 (J3)** - Primero en quedarse sin cartas

### Rondas ganadas:
- J2: 2 rondas
- J3: 3 rondas
- J4: 1 ronda

---

## Análisis de la Simulación

La simulación demostró correctamente:

- El mecanismo de identificación del jugador inicial (quien tiene el Rey de Oros)
- Las reglas para determinar el ganador según el tipo de Rey
- El proceso de cambio de Rey después de cada mano
- El sistema de descarte cuando los jugadores no tienen el palo requerido
- La condición de victoria (quedarse sin cartas)

La partida duró 7 rondas, con una duración moderada que permite apreciar las mecánicas del juego sin extenderse demasiado.