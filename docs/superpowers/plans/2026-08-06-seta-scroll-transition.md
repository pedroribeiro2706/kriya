# Unificação da animação da seta de scroll no GSAP — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar a disputa CSS-transition × GSAP na seta de scroll, deixando o GSAP como único dono de `opacity`/`transform` do wrapper.

**Architecture:** Remoção de uma linha de CSS (`transition`) do `.scroll-down-wrapper` no CSS inline do `index.html`. Nenhuma mudança de JS.

**Tech Stack:** HTML/CSS estático + GSAP; verificação via claude-in-chrome.

**Spec:** `docs/superpowers/specs/2026-08-06-seta-scroll-transition-design.md`

## Global Constraints

- Mesma branch da correção do overlap (`ajuste-overlap-texto-hero`); commit separado e atômico.
- NÃO tocar no `@keyframes bounce` do `.scroll-arrow` nem nos tweens GSAP.
- Pilotagem na aba throttled exige `gsap.ticker.tick()` manual e refresh estabilizado em repouso antes de scrollar (protocolo validado em 06/08).

### Task 1: Remover a transition e verificar o fim da saída

**Files:**
- Modify: `index.html` (CSS inline, seletor `.scroll-down-wrapper`, ~linha 310)

**Interfaces:**
- Consumes: máscara do título já corrigida (commit `7130b53`).
- Produces: seta 100% GSAP; UAT único cobre os dois itens.

- [ ] **Step 1: Medir o sintoma ANTES da mudança (se a janela do Chrome estiver utilizável)**

Com a entrada forçada e refresh estabilizado em repouso, ir a p=0.9 da saída e comparar:

```js
const st = ScrollTrigger.getById("hero-exit");
window.scrollTo(0, st.start + 0.9 * (st.end - st.start));
ScrollTrigger.update();
if (st.getTween()) st.getTween().progress(1);
gsap.ticker.tick();
const el = document.querySelector(".scroll-down-wrapper");
({ gsapEscreveu: el.style.opacity, computed: getComputedStyle(el).opacity })
```

Esperado ANTES: `gsapEscreveu` ≈ 0.1 e `computed` defasado (a transition interpolando por conta própria). Obs.: em aba throttled a transition CSS pode se comportar diferente do tempo real — se a medição "antes" não reproduzir a defasagem, registrar e seguir (o sintoma já foi comprovado ao vivo em 27/07).

- [ ] **Step 2: Aplicar a edição (Edit, old → new)**

```css
/* ANTES (dentro de .scroll-down-wrapper) */
        opacity: 0; /* Começa invisível */
        transition: opacity 1s ease-in-out, transform 1s ease-in-out;
        z-index: 4;

/* DEPOIS */
        opacity: 0; /* Começa invisível */
        z-index: 4;
```

- [ ] **Step 3: Verificar DEPOIS da mudança**

Recarregar, repetir o protocolo (entrada forçada + refresh em repouso + p=0.9). Esperado: `gsapEscreveu` == `computed` (≈ 0.1). Repetir em p=1.0: computed 0 e `visibility: hidden` (autoAlpha).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Remove a transition CSS da seta de scroll; GSAP passa a mandar sozinho em opacity/transform"
```

## UAT (gate final, cobre os DOIS itens da branch)

Pedro, na tela real: (1) entrada completa — fade da seta aceitável; (2) saída — textos cortados nas máscaras sem cruzamento + seta sumindo junto; (3) switch off — reversão limpa; (4) se possível, DevTools em 900/1080px de altura. Merge + push só após aprovação.
