# Unificação da animação da seta de scroll no GSAP — Design

**Data:** 2026-08-06
**Status:** Aprovado pelo Pedro (item 2 do backlog de 27/07; abordagem prescrita no HANDOFF.md e confirmada em 06/08)
**Pareado com:** correção do overlap dos textos da direita (mesmo ciclo de UAT, mesma branch `ajuste-overlap-texto-hero`)

## Problema

`.scroll-down-wrapper` tem `transition: opacity 1s ease-in-out, transform 1s ease-in-out` no CSS **e** é animada pelo GSAP nas duas pontas: entrada (`.to(scrollDownWrapper, { opacity: 1, y: -10, duration: 1 })`) e saída scrubbed (`.to(".scroll-down-wrapper", { autoAlpha: 0 })`). Os dois sistemas disputam as mesmas propriedades: cada escrita do GSAP vira alvo de uma interpolação CSS de 1s por conta própria. Comprovado ao vivo em 27/07: no fim do pin o GSAP escrevia `opacity: 0.0009` no elemento enquanto o computed seguia em `1`.

## Mudança

Remover a linha `transition: opacity 1s ease-in-out, transform 1s ease-in-out;` do seletor `.scroll-down-wrapper` (CSS inline do `index.html`, ~linha 310). A linha inteira sai porque só lista as duas propriedades em disputa — não há terceira propriedade a preservar.

**O que NÃO muda:** o `@keyframes bounce` do `.scroll-arrow` (elemento filho, sem conflito); os tweens GSAP de entrada e saída; o `translateX(-50%)` de centralização (o GSAP já o preserva ao assumir o transform).

## Efeitos esperados

1. **Saída (o bug):** o `autoAlpha` scrubbed passa a valer imediatamente — a seta some acompanhando o scroll, sem a interpolação paralela de 1s.
2. **Entrada (efeito colateral aceito):** o fade-in vira exatamente o tween GSAP (1s, power2.out), sem a suavização extra do CSS por cima. Percepção pode mudar levemente → **UAT da entrada obrigatório** (motivo do pareamento no mesmo ciclo).
3. **Reversão (switch off):** `heroTimeline.reverse()` também passa a mandar sozinho.

## Verificação

- Pilotagem: no fim da saída (p≈0.9–1.0), o `opacity` computado do wrapper deve igualar o valor escrito pelo GSAP (hoje diverge: GSAP ~0, computed 1).
- UAT do Pedro (tela real): entrada — seta aparece com fade aceitável; saída — seta some junto com os demais elementos; switch off — reversão limpa.
