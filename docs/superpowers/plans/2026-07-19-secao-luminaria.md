# Seção da Luminária — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir (no desktop) a seção do acordeon "O que podemos fazer por você, hoje?" do `index.html` pela seção animada da luminária definida na spec `docs/superpowers/specs/2026-07-19-secao-luminaria-design.md`.

**Architecture:** Nova `<section id="luminaria" class="lum-section">` inserida antes da seção `#service` (que permanece no DOM como versão mobile). Um ScrollTrigger master (pin + scrub, timeline com duração virtual de 100 unidades) conduz entrada da luminária, Title Switcher e saída; uma timeline separada `lightOn` (flicker) é disparada por callback no `onUpdate`. CSS em arquivo próprio `css/luminaria.css`; JS dentro do `<script>` inline existente, dentro de `gsap.matchMedia("(min-width: 992px)")`.

**Tech Stack:** GSAP 3.12.7 + ScrollTrigger (CDN, já carregados), CSS `clip-path: polygon()`, export Webflow existente (jQuery + webflow.js), Vite dev server.

## Global Constraints

- Idioma do conteúdo e dos commits: português.
- Verde Kriya: `#7ed957` (verificado no switch da hero, `index.html:1525`). Fundo escuro: `#000` via var CSS `--lum-bg` (calibrável).
- Todas as classes novas usam prefixo `lum-` (evita colisão com a cascata Webflow).
- Breakpoint de corte: luminária em `(min-width: 992px)`; acordeon `#service` em `(max-width: 991px)` (breakpoints Webflow: 991/767/479).
- **Não tocar em `portfolio.html`** (versão de referência preservada). Trabalho é só no `index.html` + `css/luminaria.css`.
- GSAP continua via CDN 3.12.7 — a migração para npm é melhoria futura fora deste plano.
- `markers: true` permitido durante desenvolvimento; **removido no commit final** (Task 7).
- Projeto sem framework de testes: cada task termina com verificação manual no navegador (`npm run dev` → http://localhost:5173/index.html) com critérios explícitos + console sem erros novos.
- Os dois `clip-path` do facho (aceso e tela cheia) devem ter o **mesmo número de vértices (5)** — obrigatório para o GSAP interpolar.
- Sequência de criação dos ScrollTriggers no script: hero (já existe) → saída da hero → master da luminária (ordem top-to-bottom da página; requisito do ScrollTrigger para refresh correto).
- Executor deve ter lido: a spec, `.claude/skills/gsap/references/gsap-scrolltrigger.md`, e o mockup `references/secao-luminaria-01.png`.

## Estrutura de arquivos

- **Modify:** `index.html` — inserir a seção antes da linha 510 (`<section id="service">`); adicionar `<link>` do CSS no `<head>`; adicionar bloco JS no `<script>` inline (após a linha ~1611, antes do fechamento do `load`).
- **Create:** `css/luminaria.css` — todo o layout/estados da seção nova + alternância desktop/mobile.
- Conteúdo textual: copiado dos elementos existentes do próprio `index.html` (acordeon, linhas 510–893) — fonte exata indicada em cada step.

## Interfaces globais (nomes canônicos usados em todas as tasks)

- Classes: `.lum-section`, `.lum-heading-wrap`, `.lum-heading`, `.lum-heading-sub`, `.lum-beam`, `.lum-beam-inner`, `.lum-titles`, `.lum-title`, `.lum-texts`, `.lum-text`, `.lum-rig`.
- Vars CSS (definidas em `.lum-section`): `--lum-bg`, `--lum-green`, `--lum-title-idle`, `--lum-text-ink`, `--lum-clip-on`, `--lum-clip-full`.
- JS (escopo do `mm.add`): `lumMaster` (timeline master scrubbed), `lightOn` (timeline do flicker, paused), `isLit` (boolean), `stepY` (função — distância entre títulos), `LUM_CLIP_FULL` (string de polygon; o estado aceso vive só no CSS via `--lum-clip-on`).
- Pontos do master (duração virtual 100): entrada 0–15 | disparo da luz em progress 0.15 | respiro 15–20 | switcher 20–75 (trocas em 38, 57, 75) | leitura do 4º título 75–85 | saída 85–100.

---

### Task 1: Markup da seção da luminária

**Files:**
- Modify: `index.html:509` (inserir antes de `<section id="service">`, linha 510)

**Interfaces:**
- Produces: todo o DOM listado em "Interfaces globais". A ordem dos títulos e das listas é a MESMA (índice i do título ↔ índice i da lista).

- [ ] **Step 1: Inserir o markup da seção**

Inserir imediatamente antes da linha `<section id="service" class="section-services">` (linha 510):

```html
<!-- ============ SEÇÃO DA LUMINÁRIA (versão desktop da seção services) ============ -->
<section id="luminaria" class="lum-section" aria-label="O que podemos fazer por você, hoje?">
    <div class="lum-heading-wrap">
        <h2 class="lum-heading">O que podemos <span class="lum-heading-accent">fazer por você</span>, hoje?</h2>
        <p class="lum-heading-sub">Somos contadores de histórias visuais, criando experiências que conectam profundamente e estimulam a criatividade.</p>
    </div>
    <div class="lum-beam">
        <div class="lum-beam-inner">
            <div class="lum-titles">
                <h3 class="lum-title is-active">ui/ux design (web e app)</h3>
                <h3 class="lum-title">graphic design</h3>
                <h3 class="lum-title">motion graphics</h3>
                <h3 class="lum-title">branding</h3>
            </div>
            <div class="lum-texts">
                <ul class="lum-text is-active"><!-- frases do item 1 (ver Step 2) --></ul>
                <ul class="lum-text"><!-- frases do item 2 --></ul>
                <ul class="lum-text"><!-- frases do item 3 --></ul>
                <ul class="lum-text"><!-- frases do item 4 --></ul>
            </div>
        </div>
    </div>
    <div class="lum-rig"><img src="assets/luminaria.png" alt="" aria-hidden="true"></div>
</section>
```

- [ ] **Step 2: Preencher as 4 listas com o conteúdo real do acordeon**

Fonte: os `<div class="paragraph-text color-grey">` dentro de cada `accordion-content` da seção `#service` (o mesmo arquivo). Localização dos 4 itens: `accordion-title` nas linhas 540 (`1. ui/ux design (web e app)`), 676 (`2. Graphic Design`), 756 (`3. Motion Graphics`), 823 (`4. Branding`) — copiar cada frase para um `<li>` da `<ul class="lum-text">` correspondente, na mesma ordem, sem os SVGs. Exemplo com o item 1 (frases das linhas 555, 568, 581, 594, 608, 622, 636, 650):

```html
<ul class="lum-text is-active">
    <li>Wireframing e prototipagem</li>
    <li>Teste de usabilidade e análise de feedback do usuário</li>
    <li>Design de interface de usuário para aplicativos web e móveis</li>
    <li>Design de interação e microanimações</li>
    <li>Websites responsivos</li>
    <li>Design e otimização de landing pages para campanhas de marketing digital</li>
    <li>Manutenção e atualização de websites</li>
    <li>Desenvolvimento de aplicativos baseados em IA</li>
</ul>
```

Repetir o mesmo processo para os itens 2, 3 e 4 (extrair as frases reais de cada `accordion-content` — não inventar texto).

- [ ] **Step 3: Verificar no navegador**

Run: `npm run dev` → abrir http://localhost:5173/index.html
Expected: a página carrega sem erro novo no console; entre a hero e o acordeon aparece um bloco de texto sem estilo (a seção nova, ainda sem CSS). O acordeon continua funcionando.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Adiciona markup da seção da luminária (conteúdo do acordeon)"
```

---

### Task 2: CSS da seção + alternância desktop/mobile

**Files:**
- Create: `css/luminaria.css`
- Modify: `index.html` `<head>` (adicionar `<link>` logo após o link do `css/portfolio.css`)

**Interfaces:**
- Consumes: DOM da Task 1.
- Produces: estados iniciais que o JS assume — `.lum-rig` fora da tela (`translateX(110%)` via CSS), `.lum-beam` invisível (`opacity: 0`), vars `--lum-clip-on`/`--lum-clip-full`; alternância `#service` ↔ `.lum-section` por media query.

- [ ] **Step 1: Criar `css/luminaria.css`**

```css
/* ============ SEÇÃO DA LUMINÁRIA ============ */
.lum-section {
    --lum-bg: #000;
    --lum-green: #7ed957;
    --lum-title-idle: #c9c9c9;
    --lum-text-ink: #303030;
    /* Os dois polígonos têm 5 vértices — obrigatório para o GSAP interpolar */
    --lum-clip-on: polygon(62% 10%, 78% 24%, 42% 100%, 0% 100%, 0% 58%);
    --lum-clip-full: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%);
    position: relative;
    height: 100vh;
    overflow: hidden;
    background: var(--lum-bg);
}

/* Título da seção — fora do facho, branco sobre preto (mockup) */
.lum-heading-wrap {
    position: absolute;
    top: 8vh;
    left: 6vw;
    max-width: 34rem;
    z-index: 2;
    opacity: 0; /* revelado pela timeline lightOn */
}
.lum-heading {
    margin: 0;
    color: #fff;
    text-transform: uppercase;
    font-size: 3.4rem;
    line-height: 1.05;
}
.lum-heading-accent { color: var(--lum-green); }
.lum-heading-sub {
    margin-top: 1.2rem;
    color: #fff;
    font-size: 1.05rem;
    line-height: 1.5;
}

/* Facho de luz — máscara de visibilidade do conteúdo */
.lum-beam {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: #fff;
    clip-path: var(--lum-clip-on);
    opacity: 0; /* apagado até a lightOn tocar */
}
.lum-beam-inner {
    position: absolute;
    inset: 0;
}

/* Coluna de títulos — desliza verticalmente (JS anima o container) */
.lum-titles {
    position: absolute;
    left: 6vw;
    top: 55vh; /* 1º título alinhado à zona ativa (centro do facho) */
    z-index: 1;
}
.lum-title {
    margin: 0 0 2.6rem;
    color: var(--lum-title-idle);
    text-transform: uppercase;
    font-size: 2.6rem;
    line-height: 1;
    white-space: nowrap;
}
.lum-title.is-active { color: var(--lum-green); }

/* Coluna de textos — blocos empilhados na mesma posição, crossfade */
.lum-texts {
    position: absolute;
    left: 34vw;
    top: 48vh;
    width: 30vw;
}
.lum-text {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--lum-text-ink);
    font-size: 1rem;
    line-height: 1.6;
    opacity: 0;
    visibility: hidden;
}
.lum-text.is-active { opacity: 1; visibility: visible; }
.lum-text li { margin-bottom: 0.35rem; }

/* Luminária — slot substituível (futuro: SVG articulado no lugar do PNG) */
.lum-rig {
    position: absolute;
    top: 0;
    right: 0;
    height: 100vh;
    z-index: 3;
    transform: translateX(110%); /* estado inicial: fora da tela */
    pointer-events: none;
}
.lum-rig img {
    height: 100%;
    width: auto;
    display: block;
}

/* Alternância desktop/mobile: luminária é experiência desktop */
@media screen and (max-width: 991px) {
    .lum-section { display: none; }
}
@media screen and (min-width: 992px) {
    #service { display: none; }
}
```

- [ ] **Step 2: Linkar o CSS no `<head>` do `index.html`**

Logo após o `<link>` existente do `css/portfolio.css`, adicionar:

```html
<link href="css/luminaria.css" rel="stylesheet" type="text/css">
```

- [ ] **Step 3: Ajustar a tipografia dos títulos à display face do site**

No navegador (DevTools), inspecionar a `font-family` computada do `.hero-title-01` (a display face do site Webflow) e replicá-la explicitamente em `.lum-heading` e `.lum-title` no `css/luminaria.css` (adicionar a declaração `font-family` com o valor computado real — não escolher fonte nova).

- [ ] **Step 4: Verificar no navegador**

Expected (desktop ≥992px): a seção aparece toda preta (facho invisível), sem a luminária (fora da tela), acordeon oculto; ao estreitar a janela para ≤991px, o acordeon reaparece e a seção preta some. Console sem erros novos.

Para verificar o facho visualmente nesta task (só durante a inspeção): no DevTools, forçar `opacity: 1` em `.lum-beam` — o trapézio branco deve aparecer com os títulos cinza (1º verde) e a primeira lista visível. Reverter a alteração do DevTools.

- [ ] **Step 5: Commit**

```bash
git add css/luminaria.css index.html
git commit -m "Adiciona CSS da seção da luminária com alternância desktop/mobile"
```

---

### Task 3: Pin da seção + entrada da luminária + saída dos títulos da hero

**Files:**
- Modify: `index.html` — dentro do `<script>` inline, após o bloco `heroTimeline.eventCallback(...)` (linha ~1611), antes do `});` que fecha o `window.addEventListener("load", ...)`

**Interfaces:**
- Consumes: DOM (Task 1) e estados iniciais CSS (Task 2).
- Produces: `mm` (gsap.matchMedia), `lumMaster` (timeline master, duração virtual 100, com ScrollTrigger id `"lum"`), e o ScrollTrigger da saída da hero. Tasks 4–6 adicionam tweens a `lumMaster` e usam o `onUpdate` declarado aqui.

- [ ] **Step 1: Adicionar o bloco base da luminária**

```javascript
// ################################## SEÇÃO DA LUMINÁRIA ######################################

const mm = gsap.matchMedia();

mm.add("(min-width: 992px)", () => {

    // --- Saída animada dos títulos da hero (enquanto a seção da luminária sobe) ---
    // Direções conforme main-bkp-03.js: "PEDRO RIBEIRO" desce, "MULTI" sobe,
    // "DESIGNPLINARY" desce, descrição sobe, switch e seta somem em fade.
    gsap.timeline({
        scrollTrigger: {
            trigger: ".lum-section",
            start: "top bottom",
            end: "top top",
            scrub: 1,
            id: "hero-exit",
            markers: true // DEV — remover na Task 7
        },
        defaults: { ease: "none" }
    })
        .to(".hero-designer", { y: 220, autoAlpha: 0 }, 0)
        .to(".hero-title-01", { y: -220, autoAlpha: 0 }, 0)
        .to(".hero-title-02", { y: "+=220", autoAlpha: 0 }, 0)
        .to(".hero-description", { y: -180, autoAlpha: 0 }, 0)
        .to("#switch-btn", { autoAlpha: 0 }, 0)
        .to(".scroll-down-wrapper", { autoAlpha: 0 }, 0);

    // --- Master timeline da seção (duração virtual 100; fases da spec) ---
    let isLit = false; // Task 4 usa

    const lumMaster = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: ".lum-section",
            start: "top top",
            end: "+=4000",
            pin: true,
            scrub: 1,
            id: "lum",
            markers: true, // DEV — remover na Task 7
            onUpdate: (self) => {
                // Task 4 preenche: disparo/reversão da lightOn em progress 0.15
            }
        }
    });

    // Fase 1 (0–15): luminária entra da direita, apagada
    lumMaster.to(".lum-rig", { x: 0, duration: 15 }, 0);

    // Garante duração total 100 desde já (fases seguintes ocupam 20–100)
    lumMaster.set({}, {}, 100);

    return () => { /* cleanup automático do matchMedia (kill dos triggers do contexto) */ };
});
```

- [ ] **Step 2: Verificar no navegador**

Expected (desktop): ligar o switch, rolar o vídeo do café até o fim e continuar rolando — os títulos da hero saem animados (fade + direções) enquanto a seção preta sobe; a seção pina no topo e, rolando, a luminária desliza da direita até parar na posição (ainda tudo escuro, facho invisível). Rolando para trás, tudo reverte. Markers `hero-exit` e `lum` visíveis. Console sem erros.

Nota de verificação: entre a hero e a seção existe a `<section class="avator-sticky">` (linhas 453–484). Se ela criar um vão visual estranho na transição, anotar para calibração na Task 7 (não "consertar" agora).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Adiciona pin da seção da luminária, entrada scrubbed e saída da hero"
```

---

### Task 4: Flicker — a luz liga (timeline disparada)

**Files:**
- Modify: `index.html` — dentro do bloco `mm.add` da Task 3

**Interfaces:**
- Consumes: `lumMaster`, `isLit` (Task 3); `.lum-beam` e `.lum-heading-wrap` com opacity 0 inicial (Task 2).
- Produces: `lightOn` (timeline paused). O `onUpdate` do `lumMaster` fica completo.

- [ ] **Step 1: Adicionar a timeline `lightOn` (antes do `lumMaster`)**

```javascript
    // --- Luz liga: flicker de lâmpada + revelação (disparada, não scrubbed) ---
    const lightOn = gsap.timeline({ paused: true });
    lightOn
        .fromTo(".lum-beam", { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "none" })
        .to(".lum-beam", { opacity: 0.15, duration: 0.06, ease: "none" })
        .to(".lum-beam", { opacity: 1, duration: 0.05, ease: "none" })
        .to(".lum-beam", { opacity: 0.4, duration: 0.07, ease: "none" })
        .to(".lum-beam", { opacity: 1, duration: 0.12, ease: "none" })
        .fromTo(".lum-heading-wrap",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.05");
```

- [ ] **Step 2: Preencher o `onUpdate` do `lumMaster`**

Substituir o corpo do `onUpdate` declarado na Task 3 por:

```javascript
            onUpdate: (self) => {
                if (self.progress >= 0.15 && !isLit) {
                    isLit = true;
                    lightOn.timeScale(1).play();
                } else if (self.progress < 0.15 && isLit) {
                    isLit = false;
                    lightOn.timeScale(3).reverse(); // apaga rápido, sem drama de flicker
                }
            }
```

- [ ] **Step 3: Verificar no navegador**

Expected: ao rolar até a luminária encaixar (~15% do pin), a luz pisca e acende — facho branco revela títulos (1º verde) e primeira lista; o título da seção surge com fade+subida. Rolando para trás do ponto, tudo apaga rapidamente. Repetir ida/volta 3× — sem estados presos (facho meio-aceso).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Adiciona flicker de ligar a luz e revelação do conteúdo"
```

---

### Task 5: Title Switcher (scrub 20–85)

**Files:**
- Modify: `index.html` — dentro do bloco `mm.add`, após os tweens da Task 3 no `lumMaster`

**Interfaces:**
- Consumes: `lumMaster`; `.lum-titles`/`.lum-title` e `.lum-texts`/`.lum-text` (Tasks 1–2).
- Produces: fases 20–85 do `lumMaster` preenchidas. Pontos de troca canônicos: 38, 57, 75.

- [ ] **Step 1: Adicionar o switcher ao `lumMaster`**

Inserir após `lumMaster.to(".lum-rig", ...)` e antes do `lumMaster.set({}, {}, 100)`:

```javascript
    // Fase 2 (20–75): títulos rolam continuamente; 75–85: leitura do 4º título
    const lumTitles = gsap.utils.toArray(".lum-title");
    const lumTexts = gsap.utils.toArray(".lum-text");
    // Distância entre títulos consecutivos, medida no layout real (função = recalcula no refresh)
    const stepY = () => lumTitles[1].offsetTop - lumTitles[0].offsetTop;

    lumMaster.to(".lum-titles", { y: () => -3 * stepY(), duration: 55 }, 20);

    // Trocas de título ativo nos pontos em que cada título cruza a zona ativa
    const switchPoints = [38, 57, 75]; // título 2, 3 e 4
    switchPoints.forEach((t, i) => {
        lumMaster
            .to(lumTitles[i],     { color: "#c9c9c9", duration: 2 }, t)
            .to(lumTitles[i + 1], { color: "#7ed957", duration: 2 }, t)
            .to(lumTexts[i],      { autoAlpha: 0, duration: 3 }, t)
            .to(lumTexts[i + 1],  { autoAlpha: 1, duration: 3 }, t + 1);
    });
```

- [ ] **Step 2: Verificar no navegador**

Expected: com a luz acesa, rolar conduz a coluna de títulos para cima continuamente; ao cruzar a zona ativa cada título fica verde (o anterior volta a cinza) e a lista da direita troca em crossfade; o 4º título (branding) fica verde e legível por um trecho de scroll (75–85) antes da saída. Reverter o scroll inverte cores e listas corretamente. O título "branding" deve estar dentro do facho na zona ativa — se a coluna escapar do trapézio, anotar ajuste de `--lum-clip-on`/`top` para a Task 7.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Adiciona Title Switcher com troca de cor e crossfade de textos"
```

---

### Task 6: Saída — facho engole a tela (85–100)

**Files:**
- Modify: `index.html` — dentro do bloco `mm.add`, após os tweens da Task 5

**Interfaces:**
- Consumes: `lumMaster` (Task 3); `stepY()` (Task 5); var `--lum-clip-on` com 5 vértices (Task 2 — o polygon de destino aqui também tem 5).
- Produces: fase 85–100 do `lumMaster`; fim da seção em tela branca e unpin.

- [ ] **Step 1: Adicionar a saída ao `lumMaster`**

Inserir após o bloco da Task 5, antes do `lumMaster.set({}, {}, 100)`:

```javascript
    // Fase 3 (85–100): conteúdo sai, facho abre até a tela branca, luminária sai
    const LUM_CLIP_FULL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)";

    lumMaster
        .to(".lum-titles",       { autoAlpha: 0, y: () => -3 * stepY() - 80, duration: 8 }, 85)
        .to(".lum-texts",        { autoAlpha: 0, duration: 8 }, 85)
        .to(".lum-heading-wrap", { autoAlpha: 0, y: -30, duration: 8 }, 85)
        .to(".lum-beam",         { clipPath: LUM_CLIP_FULL, duration: 15 }, 85)
        .to(".lum-rig",          { x: "110%", duration: 12 }, 87);
```

- [ ] **Step 2: Verificar no navegador**

Expected: após a leitura do 4º título, o conteúdo some, o trapézio se expande até a tela ficar 100% branca enquanto a luminária desliza para fora pela direita; o pin solta e a seção "A gente" entra com suas animações atuais, sobre fundo claro — transição contínua do branco. Reverter recompõe o facho e o conteúdo. Percorrer a página inteira (hero → footer) sem erro de console.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Adiciona saída da seção: facho expande até tela branca"
```

---

### Task 7: Polimento, remoção de markers e verificação completa

**Files:**
- Modify: `index.html`, `css/luminaria.css` (calibrações anotadas nas tasks anteriores)

**Interfaces:**
- Consumes: tudo das Tasks 1–6.
- Produces: versão pronta para a UAT do Pedro.

- [ ] **Step 1: Resolver as anotações de calibração acumuladas**

Aplicar os ajustes anotados nas verificações anteriores (posições do clip-path, `top` das colunas, vão do `.avator-sticky`, distância `end: "+=4000"`). Somente valores em CSS vars e nos números do plano — sem mudança estrutural.

- [ ] **Step 2: Remover os markers de desenvolvimento**

Remover `markers: true` dos ScrollTriggers `hero-exit` e `lum` (as duas ocorrências marcadas com `// DEV`).

- [ ] **Step 3: Verificação completa (checklist)**

No desktop (≥992px), percorrer 3 ciclos completos de ida e volta:
- Hero → vídeo do café → saída dos títulos → pin escuro → entrada da luminária → flicker/liga → 4 trocas do switcher → facho engole a tela → "A gente" entra.
- Reversão total até a hero sem estados presos.
- Redimensionar a janela no meio da seção (ScrollTrigger.refresh automático) — facho e luminária permanecem alinhados.
- Em ≤991px: acordeon visível e funcional; seção da luminária ausente; nenhum ScrollTrigger da luminária criado (matchMedia).
- Console: zero erros.

- [ ] **Step 4: Commit e push**

```bash
git add index.html css/luminaria.css
git commit -m "Calibra a seção da luminária e remove markers de desenvolvimento"
git push origin main
```

- [ ] **Step 5: Sinalizar UAT**

Avisar o Pedro: seção pronta para avaliação visual em http://localhost:5173/index.html — a calibração fina (tons, velocidades, shape do facho) é feita com ele ao vivo.
