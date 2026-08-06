# Correção do overlap dos textos da direita na saída da hero — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar o cruzamento visual entre DESIGNPLINARY e a descrição durante a saída da hero, alinhando as fronteiras das duas máscaras na linha dos 74% da hero.

**Architecture:** Mudança CSS-only no `.hero-title-02-wrapper` (CSS inline do `index.html`): a borda inferior da máscara sobe de `80vh` para `74vh` sem mover o topo — o layout em repouso fica idêntico e o JS não é tocado. Verificação por pilotagem GSAP no navegador (protocolo validado na sessão de 06/08).

**Tech Stack:** HTML/CSS estático + GSAP ScrollTrigger; verificação via claude-in-chrome (`javascript_tool`).

**Spec:** `docs/superpowers/specs/2026-08-06-hero-overlap-texto-direita-design.md`

## Global Constraints

- NÃO alterar nenhum valor da timeline `hero-exit` (os seis `.to()` são intocáveis — lição de 27/07).
- NÃO alterar `.hero-description-wrapper` nem a arquitetura de três triggers.
- Commits atômicos com mensagens em português; push só após UAT aprovado (padrão do projeto).
- A aba automatizada é throttled (`visibilityState: hidden`): toda pilotagem precisa de `gsap.ticker.tick()` manual e `st.getTween().progress(1)` para matar a suavização do scrub.

## Valores de referência (medidos em 06/08, janela 1536×742)

| Grandeza | Antes da mudança |
|---|---|
| `.hero-title-02-wrapper` rect | top 380, bottom 595 |
| `.hero-title-02` rect em repouso (pós-entrada) | top 500, bottom 536 |
| `.hero-description-wrapper` rect | top 550, bottom 632 |
| `.hero-description` rect em repouso | top 559, bottom 634 |
| Faixa do `hero-exit` | scroll 742 → 1187 |

Após a mudança, o esperado: wrapper do título com top **inalterado** (380) e bottom ≈ **549** (74% de 742); todos os demais rects idênticos.

---

### Task 1: Aplicar a mudança de CSS e confirmar layout em repouso intacto

**Files:**
- Modify: `index.html` (bloco `<style>` inline, seletor `.hero-title-02-wrapper`, ~linha 254)

**Interfaces:**
- Consumes: nada (primeira task).
- Produces: máscara do título com borda inferior na linha dos 74%; Task 2 assume esses valores aplicados.

- [ ] **Step 1: Confirmar estado limpo e localizar o seletor**

Run: `git status --short` (esperado: sem modificações em `index.html`) e localizar no `index.html`:

```css
      .hero-title-02-wrapper {
        position: absolute;
        bottom: 20vh; /* Alinhado com "MULTI" */
        left: 33%; /* Ajustado para começar a partir do "I" de "MULTI" */
        width: 950px; /* Ajustado para a largura certa */
        height: 215px; /* Aumentado para não cortar a palavra ao descer */
```

- [ ] **Step 2: Aplicar a edição (Edit, old → new)**

```css
/* ANTES */
        bottom: 20vh; /* Alinhado com "MULTI" */
        ...
        height: 215px; /* Aumentado para não cortar a palavra ao descer */

/* DEPOIS */
        bottom: 26vh; /* Borda inferior da máscara na linha dos 74% (= top da máscara da descrição); topo inalterado */
        ...
        height: calc(215px - 6vh); /* Compensa o bottom para o topo não se mover (100vh - 26vh - height = 80vh - 215px) */
```

(As demais declarações do seletor ficam como estão.)

- [ ] **Step 3: Verificar em repouso via pilotagem**

Recarregar http://localhost:5173/index.html na aba automatizada e rodar no `javascript_tool`:

```js
// Força a entrada e mede o layout em repouso
const heroDesigner = document.querySelector(".hero-designer");
const tls = gsap.globalTimeline.getChildren(true, false, true);
const heroTl = tls.find(tl => tl.paused() && !tl.scrollTrigger &&
  tl.getChildren(true, true, false).some(tw => tw.targets && tw.targets().includes(heroDesigner)));
document.querySelectorAll('[class*="cursor"], [class*="coffee"], [class*="typed"]').forEach(el => el.style.display = "none");
heroTl.progress(1); gsap.ticker.tick();
const r = sel => { const b = document.querySelector(sel).getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom) }; };
({ wrapper: r(".hero-title-02-wrapper"), title02: r(".hero-title-02"), desc: r(".hero-description"), vp: window.innerHeight })
```

Esperado (janela 742): `wrapper.top` = 380 (**igual a antes** — critério central), `wrapper.bottom` ≈ 549, `title02` = 500→536 (inalterado), `desc` = 559→634 (inalterado). Tirar screenshot da coluna direita em repouso (zoom região [950, 350, 1500, 680]) — glifo DESIGNPLINARY íntegro, sem corte visível na base.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Alinha a máscara do título DESIGNPLINARY à linha dos 74% para a saída não cruzar com a descrição"
```

---

### Task 2: Verificar a saída pilotada e calibrar se necessário

**Files:**
- Modify (somente se a calibração exigir): `index.html` (mesmo seletor)

**Interfaces:**
- Consumes: máscara aplicada pela Task 1.
- Produces: verificação documentável (rects + screenshots) para o UAT do Pedro.

- [ ] **Step 1: Medir os pontos críticos da saída (10/20/30%)**

Para cada `p` em `[0.1, 0.2, 0.3]`, rodar no `javascript_tool` (mesma aba, entrada já forçada):

```js
const st = ScrollTrigger.getById("hero-exit");
const p = 0.2; // repetir com 0.1 e 0.3
window.scrollTo(0, st.start + p * (st.end - st.start));
ScrollTrigger.update();
if (st.getTween()) st.getTween().progress(1);
gsap.ticker.tick();
const vis = (sel, wrapSel) => {
  const b = document.querySelector(sel).getBoundingClientRect();
  const w = document.querySelector(wrapSel).getBoundingClientRect();
  return { visTop: Math.round(Math.max(b.top, w.top)), visBottom: Math.round(Math.min(b.bottom, w.bottom)) };
};
const t = vis(".hero-title-02", ".hero-title-02-wrapper");
const d = vis(".hero-description", ".hero-description-wrapper");
({ p, title: t, desc: d, cruzamento: Math.min(t.visBottom, d.visBottom) - Math.max(t.visTop, d.visTop) })
```

Critério de aprovação: `cruzamento <= 0` (faixas visíveis disjuntas) nos três pontos. Tirar zoom da região [950, 420, 1500, 680] em p=0.2 (o ponto do screenshot do bug) para comparação antes/depois.

- [ ] **Step 2: Verificar que a entrada não é cortada pela máscara nova**

Recarregar a página (estado zero), rodar só o trecho de localizar `heroTl` do Task 1 Step 3, mas parar a entrada no meio da descida do título: `heroTl.progress(0.8); gsap.ticker.tick();` e tirar screenshot da coluna direita. Repetir com `progress(0.9)` e `progress(1)`. Critério: DESIGNPLINARY nunca aparece cortado na base durante a descida final.

- [ ] **Step 3 (condicional): Calibrar se o glifo raspar em repouso**

Se o screenshot em repouso (Task 1 Step 3 ou Step 2 acima) mostrar a base do glifo cortada, aplicar o fallback do spec — fronteira nos 75%:

```css
bottom: 25vh; /* fallback de calibração: fronteira nos 75%, 1-2px de faixa compartilhada aceitos */
height: calc(215px - 5vh);
```

Repetir Task 2 Steps 1–2 após o ajuste. Se o fallback for usado, commitar: `git commit -am "Calibra a fronteira da máscara do título para 75%"`.

- [ ] **Step 4: Registrar limitação de viewport única**

A pilotagem roda só na altura real da janela do Chrome (742px) — `resize_window` da extensão não altera a viewport de verdade (verificado em 27/07). A conferência em outras alturas fica explicitamente para o UAT do Pedro (DevTools responsive mode). Anotar isso na mensagem de handoff do UAT.

---

## UAT (fora do plano, gate final)

Pedro testa na tela real (aba em foco): entrada completa → scroll pela saída → conferir que a descrição some cortada na linha da máscara sem tocar o DESIGNPLINARY, e que o título some descendo sem aparecer sob a descrição. Se possível, repetir com DevTools em 900px e 1080px de altura. Push para `origin main` (deploy automático Vercel) somente após aprovação.
