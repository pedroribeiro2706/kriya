# Saída dos textos da hero com a tela pinada — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a saída dos textos da hero acontecer com a tela imóvel — o scroll dirige a animação sem rolar a página — e só depois liberar a rolagem para a seção da luminária.

**Architecture:** O ScrollTrigger único que hoje prende a hero *e* roda o vídeo é dividido em três triggers com uma responsabilidade cada: `heroPin` (só prende), `heroVideo` (só o vídeo) e `heroExit` (só a saída dos textos). O pin é estendido para cobrir também a fase de saída, condicionalmente a `≥992px`. A animação interna dos textos não muda em nenhum valor.

**Tech Stack:** HTML estático, GSAP 3.12.7 + ScrollTrigger (CDN), Vite dev server (`npm run dev`, porta 5173), verificação via extensão claude-in-chrome.

**Spec:** `docs/superpowers/specs/2026-07-27-hero-saida-pin-design.md`
**Ponto de retorno:** tag `hero-pin-baseline` → commit `d61a2f0`

## Global Constraints

- Arquivo único a modificar: `index.html` (script GSAP inline, linhas ~1649–1716). Nenhum outro arquivo do site muda.
- Idioma dos comentários de código e das mensagens de commit: português.
- **Não alterar nenhum valor da timeline de saída:** `.hero-designer` `y:220`, `.hero-title-01` `y:-220`, `.hero-title-02` `y:"+=220"`, `.hero-description` `y:-180`, `autoAlpha:0` em todos, `#switch-btn` e `.scroll-down-wrapper` em `autoAlpha:0`, `defaults: { ease: "none" }`.
- **Não alterar a timeline de entrada** (`heroTimeline`, linhas 1479–1495) nem o disparo pelo switch.
- **Preservar o guard `isFinite(heroVideo.duration)`** no `onUpdate` do vídeo — ele corrige o bug crítico de 20/07 (exceção não capturada impedia a criação de todos os ScrollTriggers da luminária).
- **Preservar `scrub: 3` no trigger do vídeo**, literalmente, seja qual for seu efeito real — a suavidade do vídeo é item de backlog e não pode ser alterada de carona nesta mudança.
- **Não tocar em `lumMaster`** (linhas 1736–1808) nem em `css/luminaria.css`.
- Abaixo de 992px o comportamento deve ficar idêntico ao de `hero-pin-baseline`.
- Cada task termina em commit próprio, com o site funcionando.

---

### Task 1: Separar o pin do vídeo em dois triggers (refactor sem mudança de comportamento)

Esta task não muda nada do que o usuário vê. Ela apenas divide o trigger atual em dois, para que a Task 2 possa estender o pin sem mexer no vídeo. Ao final, o site deve se comportar exatamente como em `hero-pin-baseline`.

**Files:**
- Modify: `index.html:1655-1690` (bloco "SCROLL TRIGGER DO VIDEO DO CAFÉ" e o `eventCallback` que habilita os triggers)

**Interfaces:**
- Produces: `heroPinST` (instância ScrollTrigger, id `"hero-pin"`), `heroVideoST` (id `"hero-video"`), `vh()` (função, retorna `window.innerHeight`), `heroTriggers` (array com as instâncias a habilitar/desabilitar juntas). A Task 2 consome `heroPinST` e `vh()`.

- [ ] **Step 1: Substituir o bloco do trigger do vídeo**

Localizar em `index.html` o trecho que hoje começa em `// Cria a instância ScrollTrigger para rodar o video com o scroll` e termina no fechamento `});` do `heroScrollTrigger` (linhas 1655–1678). Substituir por:

```javascript
                // Altura da viewport, lida no momento do cálculo (recalcula no refresh)
                const vh = () => window.innerHeight;

                // --- Trigger 1: SÓ prende a hero na tela ---
                // Sem scrub e sem animação: a única função é imobilizar a seção.
                // refreshPriority: 1 garante que este trigger recalcule ANTES dos
                // outros dois, que derivam suas posições de .start/.end daqui.
                const heroPinST = ScrollTrigger.create({
                    trigger: "#hero",
                    start: "top top",
                    end: () => "+=" + vh(),
                    pin: true,
                    invalidateOnRefresh: true,
                    refreshPriority: 1,
                    id: "hero-pin"
                });

                // --- Trigger 2: SÓ o vídeo ---
                // Mesma faixa de scroll de antes (uma viewport) e mesmo scrub.
                // O `|| 0` protege a primeira avaliação: os triggers nascem
                // desabilitados (ver adiante) e heroPinST.start pode ainda não ter
                // sido calculado — sem a guarda, o valor viraria NaN. O
                // ScrollTrigger.refresh() disparado quando a entrada termina
                // recalcula tudo com os valores definitivos.
                const heroVideoST = ScrollTrigger.create({
                    trigger: "#hero",
                    start: () => heroPinST.start || 0,
                    end: () => (heroPinST.start || 0) + vh(),
                    scrub: 3,
                    invalidateOnRefresh: true,
                    id: "hero-video",
                    onUpdate: (self) => {
                        let progress = self.progress; // varia de 0 a 1
                        // Atualiza o currentTime do vídeo conforme o progresso
                        // Guard: o evento 'load' da window não espera o <video> carregar
                        // metadata, então duration pode chegar NaN na primeira atualização.
                        if (isFinite(heroVideo.duration)) {
                            let newTime = heroVideo.duration * progress;
                            heroVideo.currentTime = newTime;
                        }

                        // 🔥 Quando o vídeo atingir 95% do progresso, libera a rolagem
                        if (progress >= 0.95) {
                            console.log("✅ Scroll liberado!");
                        }
                    }
                });

                // Os triggers da hero são habilitados juntos, só depois da entrada
                const heroTriggers = [heroPinST, heroVideoST];
```

- [ ] **Step 2: Trocar o disable e o enable para agirem sobre os dois triggers**

Substituir o trecho que hoje é:

```javascript
                // Desative o gatilho de rolagem até que a timeline da animação inicial da Hero section termine.
                heroScrollTrigger.disable();
```

por:

```javascript
                // Desative os gatilhos até que a timeline da animação inicial da Hero termine.
                heroTriggers.forEach(st => st.disable());
```

E dentro do `heroTimeline.eventCallback("onComplete", ...)`, substituir `heroScrollTrigger.enable();` por:

```javascript
                    heroTriggers.forEach(st => st.enable());
```

Manter as duas linhas seguintes (`document.body.style.overflow = '';` e `ScrollTrigger.refresh();`) exatamente como estão e nessa ordem.

- [ ] **Step 3: Confirmar que não sobrou referência ao nome antigo**

Run: `grep -n "heroScrollTrigger" index.html`
Expected: nenhuma linha. Se aparecer alguma, atualizar para o nome novo correspondente.

- [ ] **Step 4: Verificar no navegador que nada mudou**

Com `npm run dev` rodando, abrir `http://localhost:5173/index.html`, clicar no switch, esperar a entrada terminar e rodar no console:

```javascript
ScrollTrigger.getAll().map(t => ({id: t.vars.id, start: Math.round(t.start), end: Math.round(t.end), pin: !!t.vars.pin}))
```

Expected: existem `hero-pin` (com `pin: true`, `start: 0`, `end ≈ innerHeight`) e `hero-video` (`pin: false`, mesma faixa), além de `hero-exit` e `lum`. Nenhum erro no console.

Depois, rolar a página manualmente e confirmar os três fatos: o vídeo avança e retrocede com o scroll no mesmo ritmo de antes, a hero fica presa por uma viewport, e a luminária entra normalmente.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Separa o pin da hero do trigger do video (sem mudanca de comportamento)"
```

---

### Task 2: Estender o pin e ancorar a saída dos textos nele

Aqui está a mudança que o usuário vê: o pin passa a cobrir também a fase de saída, e a timeline de saída deixa de ser dirigida pela subida da `.lum-section`.

**Files:**
- Modify: `index.html` — a constante nova junto de `vh()` (Task 1), o `end` de `heroPinST` (Task 1), e o bloco da timeline de saída (linhas ~1701–1716 do original, dentro de `mm.add("(min-width: 992px)")`)

**Interfaces:**
- Consumes: `heroPinST`, `vh()`, `heroTriggers` (Task 1)
- Produces: `heroExitST` (instância ScrollTrigger, id `"hero-exit"`) — o id é o mesmo de hoje, para não quebrar depuração já documentada

- [ ] **Step 1: Declarar os parâmetros calibráveis**

Logo abaixo da linha `const vh = () => window.innerHeight;` criada na Task 1, acrescentar:

```javascript
                // Quanto scroll a saída dos textos consome, em alturas de viewport.
                // Calibrável: aumentar deixa a saída mais lenta em relação ao scroll.
                const HERO_EXIT_VH = 0.6;

                // A saída dos textos só existe no desktop (a timeline vive dentro do
                // matchMedia de 992px). Abaixo disso o pin continua com uma viewport,
                // exatamente como antes.
                const heroExitAtiva = () => window.matchMedia("(min-width: 992px)").matches;
```

- [ ] **Step 2: Estender o `end` do pin, condicionalmente**

Em `heroPinST`, trocar a linha:

```javascript
                    end: () => "+=" + vh(),
```

por:

```javascript
                    end: () => "+=" + (vh() * (heroExitAtiva() ? 1 + HERO_EXIT_VH : 1)),
```

O `end` do `heroVideoST` **não muda**: ele continua sendo `(heroPinST.start || 0) + vh()`, ou seja, o vídeo segue ocupando a primeira viewport de scroll e terminando no mesmo ponto de hoje.

- [ ] **Step 3: Reancorar a timeline de saída no pin**

Substituir o bloco que hoje cria a timeline de saída (começa no comentário `// --- Saída animada dos títulos da hero ...` e termina em `.to(".scroll-down-wrapper", { autoAlpha: 0 }, 0);`) por:

```javascript
                    // --- Saída animada dos títulos da hero (com a tela pinada) ---
                    // Direções conforme main-bkp-03.js: "NÓS SOMOS" desce, "MULTI" sobe,
                    // "DESIGNPLINARY" desce, descrição sobe, switch e seta somem em fade.
                    // A faixa de scroll começa onde o vídeo termina e vai até o fim do
                    // pin — por isso a tela fica imóvel durante toda a animação.
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: "#hero",
                            start: () => (heroPinST.start || 0) + vh(),
                            end: () => heroPinST.end || (vh() * (1 + HERO_EXIT_VH)),
                            scrub: 1,
                            invalidateOnRefresh: true,
                            id: "hero-exit"
                        },
                        defaults: { ease: "none" }
                    })
                        .to(".hero-designer", { y: 220, autoAlpha: 0 }, 0)
                        .to(".hero-title-01", { y: -220, autoAlpha: 0 }, 0)
                        .to(".hero-title-02", { y: "+=220", autoAlpha: 0 }, 0)
                        .to(".hero-description", { y: -180, autoAlpha: 0 }, 0)
                        .to("#switch-btn", { autoAlpha: 0 }, 0)
                        .to(".scroll-down-wrapper", { autoAlpha: 0 }, 0);
```

Os seis `.to()` são idênticos aos de hoje, incluindo valores e posição `0`. O que mudou é apenas o objeto `scrollTrigger`: o `trigger` saiu de `.lum-section` para `#hero`, e `start`/`end` passaram a derivar do pin.

- [ ] **Step 4: Verificar as faixas de scroll no navegador**

Recarregar, clicar no switch, esperar a entrada e rodar:

```javascript
ScrollTrigger.getAll().map(t => ({id: t.vars.id, start: Math.round(t.start), end: Math.round(t.end)}))
```

Expected, numa janela de altura `H`: `hero-pin` de `0` a `1.6×H`; `hero-video` de `0` a `H`; `hero-exit` de `H` a `1.6×H`; `lum` começando em `1.6×H` ou depois. As faixas de `hero-video` e `hero-exit` devem encostar sem sobrepor.

- [ ] **Step 5: Verificar que a tela fica imóvel durante a saída**

Rolar devagar até passar do fim do vídeo e observar. A verificação objetiva, medindo um elemento que não é animado pela timeline de saída — o próprio `#hero`:

```javascript
// medir em dois pontos diferentes da fase de saída
const H = innerHeight;
scrollTo(0, H * 1.1); ScrollTrigger.update();
const a = document.querySelector("#hero").getBoundingClientRect().top;
scrollTo(0, H * 1.5); ScrollTrigger.update();
const b = document.querySelector("#hero").getBoundingClientRect().top;
console.log({a, b, diferenca: b - a});
```

Expected: `diferenca` igual a 0 (ou no máximo 1px de arredondamento). Qualquer valor negativo grande significa que a hero ainda está subindo com a página — o pin não está cobrindo a fase.

- [ ] **Step 6: Verificar que os textos somem antes de o pin soltar**

```javascript
scrollTo(0, innerHeight * 1.6); ScrollTrigger.update();
[".hero-designer", ".hero-title-01", ".hero-title-02", ".hero-description", "#switch-btn", ".scroll-down-wrapper"]
  .map(s => ({ el: s, opacity: getComputedStyle(document.querySelector(s)).opacity }));
```

Expected: `opacity` `"0"` nos seis elementos ao fim do pin.

- [ ] **Step 7: Verificar o mobile**

Redimensionar a janela para menos de 992px de largura, recarregar e repetir a consulta do Step 4.

Expected: `hero-pin` vai de `0` a `1×H` (não `1.6×H`), não existe trigger `hero-exit`, e não existe trigger `lum`. Ou seja, idêntico ao comportamento de `hero-pin-baseline`.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Pina a hero durante a saida dos textos (desktop); saida ancorada no pin"
```

---

### Task 3: Verificação de ponta a ponta e entrega para UAT

**Files:** nenhum arquivo muda nesta task, salvo ajuste de calibração se algo reprovar.

- [ ] **Step 1: Percorrer o fluxo inteiro do zero, com a aba em foco real**

Recarregar com cache frio, esperar o texto digitado, clicar no switch e rolar do início ao fim sem pular etapas. Confirmar, em ordem: entrada dos textos igual à de sempre; vídeo scrubando no ritmo de antes até o frame preto; saída dos textos com a tela imóvel; rolagem preta; luminária entrando, carrossel e saída da luminária como antes.

- [ ] **Step 2: Testar o scroll reverso**

Do meio da seção da luminária, rolar para cima até o topo da página. Expected: os textos da hero reaparecem na ordem inversa, o vídeo retrocede, e nenhum elemento fica preso invisível ou fora de lugar.

- [ ] **Step 3: Testar scroll-slam**

Rolar para baixo e para cima rapidamente atravessando a emenda entre o vídeo e a saída várias vezes. Expected: nenhum elemento fica travado num estado intermediário; o console não acumula erros.

- [ ] **Step 4: Testar resize no meio do pin**

Parar o scroll no meio da fase de saída e redimensionar a janela verticalmente. Expected: o layout se reajusta e a animação continua coerente com a nova altura (as posições são funções, recalculadas no refresh).

- [ ] **Step 5: Registrar o resultado e entregar ao Pedro**

Relatar o que foi verificado e o que ficou pendente, e pedir o UAT. Os dois parâmetros de calibração disponíveis para o feedback dele: `HERO_EXIT_VH` (quanto scroll a saída consome) e o `scrub` da timeline de saída.

- [ ] **Step 6: Push (só depois do aval do Pedro)**

`git push origin main` publica em produção na Vercel automaticamente. Não empurrar antes do UAT aprovar.

---

## Notas de pilotagem no navegador (aprendizados já registrados)

- A aba controlada pela extensão fica com `document.visibilityState: "hidden"` e o Chrome throttla o `requestAnimationFrame`, travando o `gsap.ticker`. Para forçar avanço: `gsap.ticker.tick()` após `ScrollTrigger.update()`.
- Para scroll programático funcionar, `body`/`html` precisam estar com `overflow: 'visible'` — com `'auto'` o `document.scrollingElement` fica null e `window.scrollTo` para de funcionar.
- Simular o fluxo de entrada com o ticker travado é hostil (texto digitado + callbacks do clique). Atalho: `gsap.set` manual dos estados pós-entrada, esconder `[class*="typed"], [class*="cursor"], [class*="overlay"]`, e `invalidate()` nos triggers cujos valores de início foram capturados antes da entrada.
