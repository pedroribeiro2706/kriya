# HANDOFF — Retomada do projeto (2026-07-19, atualizado 2026-07-23)

Documento de passagem de contexto entre sessões. Escrito pelo agente que fez a retomada do projeto na sessão de 19/07/2026 (que rodou no diretório antigo do OneDrive), para que a próxima sessão — nesta pasta `G:\Pedro\Dev\Kriya` — comece sem redescobrir nada.

## Atualização 07/08/2026 — SCRUB DO VÍDEO RESOLVIDO, APROVADO NO UAT E PUBLICADO. PRÓXIMA SESSÃO COMEÇA AQUI

**Estado dos ambientes:** `main` = `7ca2dfd` (merge), publicada na Vercel — **verificado por fetch da produção**: serve `assets/hero-scrub.mp4` (3,98 MB), `HERO_VIDEO_VH = 2.0`, `LERP = 0.08`, `VIDEO_FPS = 12`, guarda `readyState >= 2` presente. Working tree limpo (`.claude/` untracked, pendência antiga). Branch `ajuste-scrub-video-hero` preservada. Spec: `docs/superpowers/specs/2026-08-07-video-scrub-hero-design.md` · Plano: `docs/superpowers/plans/2026-08-07-video-scrub-hero.md`.

**UAT do Pedro (07/08):** "melhorou muito" na bancada; **"está ótimo"** no site com os valores finais.

### O item 1 do backlog era TRÊS problemas somados, não um

**Causa 1 — `scrub: 3` era inerte. VERIFICADO NO FONTE, não é hipótese.**
Baixei o ScrollTrigger 3.12.7 não-minificado e li o caminho de código:
- linhas 1714–1722: `self.scrubDuration(scrub)` está **dentro do bloco `if (animation)`** — e é a única chamada que cria o `scrubTween` (a tween de catch-up, `ease: "expo"`).
- linha 2284: `self.progress = clipped`, derivado direto do scroll. linha 2343: `onUpdate(self)`.

O `hero-video` é um `ScrollTrigger.create()` **sem `animation` anexada** ⇒ `scrubTween` nunca existiu ⇒ o `onUpdate` sempre recebeu progresso cru. **A suspeita de 27/07 está confirmada, e vale retroativamente para as 11 variantes desde março/2025** (`scrub: 9` no `test-video.html` e `js/main.js`, `scrub: 3` no `portfolio.html`, `test-video-02.js`, `test-video-03.js`, `testing.js`). As variantes por `wheel` (`main-bkp-01/02/03.js`) também nunca suavizaram: `currentTime += deltaY * 0.005`, atribuição direta.

**Causa 2 — o arquivo era hostil a seek.** Medido por um parser de átomos MP4 escrito na sessão (`ffprobe` não existe nesta máquina): `coffee-03.mp4` = 19,98 MB, 1920×1080, 21 s, 630 frames @30fps, **21 keyframes = GOP 30**. Cada seek obrigava a decodificar até 29 frames intermediários a 1080p.

**Causa 3 — a razão pixels-por-frame era impossível.** 630 frames em 1 viewport (776px) = **1,23 px por frame**; um giro de roda (~100px) pulava ~81 frames e o vídeo inteiro cabia em 8 giros. É literalmente o sintoma que o Pedro relatou ("pula do primeiro frame direto pro último"). A faixa saudável é 5–15 px/frame.

> **Insight que vale guardar:** no scrub, o **fps do arquivo é irrelevante para a fluidez** — quem dita o ritmo é o scroll, não o relógio. O que importa é frames ÷ pixels. Por isso baixar de 30fps para 12fps **melhorou** em vez de piorar.

### A correção

**JS** — o trigger virou só um leitor (`onUpdate` grava o alvo e sai) e um callback no `gsap.ticker` faz a interpolação, com três guardas: `isFinite(duration)` (preservada), `readyState >= 2` (nova) e **throttle de um frame por seek** (nova — sem ela o ticker manda 60 seeks/s). Lerp independente de framerate via `Math.pow(1 - LERP, gsap.ticker.deltaRatio())`.

**Arquivo** — `assets/hero-scrub.mp4`: 1280×720, 12fps, 254 frames, **GOP 1**, 3,98 MB. Nome por função, não por conteúdo: na fase do vídeo autoral o arquivo novo entra com o mesmo nome e o código não muda.

**Geometria** — `HERO_VIDEO_VH = 2.0` (nova constante). Faixas na janela de 776px: `hero-video` 0→1552, `hero-exit` 1552→2018, `hero-pin` 0→2018. **Os seis `.to()` da saída dos textos não mudaram** — só a janela em que rodam. A `lum` acompanhou sozinha (2018→2794), por estar ancorada na `.lum-section`. Terceira vez que a lição de 27/07 se aplica: mexer só no mecanismo.

**Calibração escolhida no UAT:** `LERP = 0.08` (mais peso que os 0.12 iniciais) e faixa 2,0vh ("a animação fica mais fluida e completa, apesar de ficar um pouco mais lenta"). A hero agora consome 2,6 viewports de pin.

### Bancada de medição (`teste-scrub.html`) — e a skill que saiu dela

A comparação entre variantes não foi por impressão: a bancada conta os frames **realmente apresentados** via `requestVideoFrameCallback` e desenha cada frame como coluna que acende quando pintado. O botão de passada de 2s dá a cobertura, que é o número comparável.

Achado do UAT: **o Pedro não distinguiu A, B, C e D.** Isso é informação, não empate — significa que qualquer GOP curto resolve, e a escolha virou critério objetivo. Ficou a **A** (GOP 1 protege o caso ruim — mobile e máquinas fracas — por só 2 MB a mais que a B; e tem 254 frames contra 149 da C, o que rende movimento mais fiel em rolagem lenta).

| variante | MB | resolução | fps | frames | GOP | px/frame (faixa 1552) |
|---|---:|---|---:|---:|---:|---:|
| `coffee-03` (antigo) | 19,98 | 1920×1080 | 30 | 630 | 30 | 2,46 |
| **A → `hero-scrub.mp4`** | 3,98 | 1280×720 | 12 | 254 | **1** | 6,11 |
| B | 1,90 | 1280×720 | 12 | 254 | 5 | 6,11 |
| C | 2,90 | 1280×720 | 7 | 149 | 1 | 10,42 |
| D | 3,97 | 1920×1080 | 12 | 254 | 5 | 6,11 |

O pipeline virou **skill global** a pedido do Pedro: `C:\Users\Pedro\.claude\skills\video-scrub-bench\` (SKILL.md, `mp4probe.js`, `references/encode.md`, `references/implementacao.md`, `assets/bancada.template.html`). Espelhada em `Brain\docs\assets\skills\video-scrub-bench\` e registrada no `setup-guide.md` como passo `3d`, conforme o protocolo do harness global. **A cópia no Brain não foi commitada** — havia renomeações de outra sessão em staging lá (`docs/AIOS-Structure/` → `historico/`) e misturar seria bagunça.

### Ferramental descoberto (economiza tempo na próxima)

- **`ffmpeg` existe nesta máquina**, apesar de não estar no PATH: `G:\Anthropic Playground\Remotion Skills\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe` (n7.1, com `libx264` e `libvpx-vp9`). **Ressalva:** build com `--disable-filters` e allowlist — **o filtro `fps` NÃO existe** (só `scale`); usar `-r 12`, nunca `-vf fps=12`. Verificado.
- **`mp4probe.js`** lê GOP, frames, resolução e faststart sem ffprobe. Atenção a uma sutileza: **átomo `stss` ausente significa que TODOS os frames são keyframes** (GOP 1), não que não há nenhum.
- **Limitação de pilotagem confirmada de novo:** o Chrome **não carrega vídeo em aba com `visibilityState: "hidden"`** (`buffered` vazio, `readyState` 0, `networkState` 2 eternamente). Geometria e layout dá para verificar sozinho; **suavidade de vídeo exige aba em foco real do Pedro.** As opacidades da saída travando em 0.8 sob ticker manual são o mesmo artefato já visto em 06/08, não regressão.

### PENDÊNCIAS EXPLÍCITAS (não fechadas nesta sessão)

1. **Firefox / `webm` — NÃO MEDIDO.** O Firefox é comprovadamente ruim com mp4 nesse cenário mesmo com GOP baixo, e o iOS Safari prefere mp4. O plano previa avaliar um `<source>` webm, e isso **não foi feito** — o UAT foi só no Chrome. A ordem dos `<source>` tem que ser decidida medindo, não deduzindo (o browser usa o primeiro formato que suporta; se o Safari suportar webm mas render pior nele, pôr webm primeiro piora). Comando de encode pronto em `references/encode.md` da skill.
2. ~~**`coffee-03.mp4` (20 MB)**~~ — **DECIDIDO EM 07/08: MANTER. Questão encerrada, não reabrir.** Contexto para quem ler depois: eu afirmei que o arquivo estava "sem uso" e **estava errado** — ele é referenciado por `portfolio.html:446`, `test-video-02.html`, `test-video-02-bkp-02.html`, `v-test-video-02-js-bkp.html`, `v-test-video-03.html`, `back-ups/test-video-03.html` e pela própria `teste-scrub.html` (que o usa como termo de comparação, que é o valor da bancada). O CLAUDE.md manda NÃO APAGAR esses protótipos. O Pedro tinha autorizado a remoção com base na minha premissa errada; apresentado o fato correto, decidiu manter.
3. **`assets/scrub-testes/`** (variantes B, C, D, ~9 MB) está no `.gitignore`, fora do git. Só existe nesta máquina; a bancada quebra parcialmente num clone novo.

### BACKLOG (ordem atualizada)

1. **Vídeo autoral no Higgsfield** (Fase 4 do plano de 07/08). O spec de encomenda já tem números provados: **~250 frames**, master em pelo menos 1920×1080 (para poder reduzir), **movimento contínuo e lento — sem cortes secos**, porque o scrub expõe corte como salto; sem áudio. Depois passa pelo mesmo pipeline (`-r 12`, GOP 1, 720p, `-movflags +faststart`) e pela bancada. **Não verificado ainda:** que durações, resoluções e formatos o Higgsfield entrega — é o primeiro passo dessa frente, não uma suposição. Antes de gerar, brainstorm com o Pedro sobre o CONCEITO visual (o café é o ponto de partida a superar, não a referência a copiar).
2. **Responsividade mobile/tablet** — "está tudo muito desencaixado". Frente própria. Herda desta sessão: o Android é comprovadamente ruim em scrub com scroll nativo mesmo com GOP baixo, e o plano B (sequência de imagens em canvas) está documentado na skill mas **não construído** — só construir depois de medir. Somar: a colisão dos textos da direita EM REPOUSO em janelas ≥ ~917px de altura (pré-existente, no spec de 06/08) e o UAT em alturas 900/1080px que segue de fora.
3. **Firefox/webm** (pendência 1 acima) — pode entrar junto da frente mobile, já que ambas são "cobertura de plataforma".

### Roteiro sugerido para a próxima sessão

A sessão de 07/08 encerrou aqui, com tudo publicado e verificado. O Pedro pediu explicitamente para **conversar sobre o Higgsfield na próxima sessão** — nada foi decidido sobre o vídeo autoral além do spec técnico.

1. **Brainstorm do conceito do vídeo autoral, ANTES de tocar no Higgsfield.** O café atual é o ponto de partida a superar, não a referência a copiar. Esta conversa não aconteceu.
2. Verificar o que o Higgsfield entrega (duração/resolução/formato) — **não verificado**, é premissa aberta.
3. Encodar pelo pipeline da skill `video-scrub-bench` (`-r`, GOP 1, 720p, faststart), medir na bancada, UAT.
4. Em paralelo ou depois: frente mobile (item 2), que pode absorver a pendência do Firefox/webm.

## Atualização 06/08/2026 — ITENS 1 E 2 DO BACKLOG RESOLVIDOS, APROVADOS NO UAT E PUBLICADOS

**Estado dos ambientes:** `main` = `fc469e0` (merge com UAT aprovado), publicada na Vercel — **verificado por fetch da produção**: CSS novo presente (`calc(215px - 6vh)`, `bottom: 26vh`), transition antiga ausente. Working tree limpo (só `.claude/` untracked, pendência antiga). Branch de trabalho `ajuste-overlap-texto-hero` preservada no GitHub. Commits de conteúdo: `7130b53` (máscara do título) e `c0fb4db` (seta de scroll); specs e planos em `docs/superpowers/`.

**UAT do Pedro (06/08): "Ficou ótimo!"** — cobriu entrada completa, saída dos textos, reversões e o novo fade da seta.

### Item 1 — Overlap dos textos da direita (RESOLVIDO)

- **Causa raiz medida (não era só "a máscara não corta"):** cruzamento MÚTUO. Na saída o título desce (`y: "+=220"`) e a descrição sobe (`y: -180`), atravessando em sentidos opostos uma faixa compartilhada de ~45px entre as máscaras — a do título terminava 59px abaixo do glifo (sobra da entrada, que desce o texto 105px), a da descrição começava 14px acima da zona do título. Fade linear junto com o movimento: no pico do cruzamento ambos com ~80% de opacidade.
- **Correção (CSS-only, 2 declarações):** `.hero-title-02-wrapper`: `bottom: 20vh → 26vh` e `height: 215px → calc(215px - 6vh)`. O topo do wrapper é invariante (`80vh − 215px` antes e depois) ⇒ layout parado intacto; a borda inferior da máscara passa a coincidir com o `top: 74%` da máscara da descrição ⇒ **faixa compartilhada zero em qualquer altura de janela**. JS intocado; os seis `.to()` da saída preservados (mesma lição de 27/07: mexer só no mecanismo).
- **Verificado:** 3 alturas de janela (742/776/719px), 3 pontos da saída (10/20/30% — faixas visíveis disjuntas em todos), screenshots antes/depois no ponto do bug (20%), glifo íntegro em repouso. A entrada é segura por geometria: o repouso é o ponto mais baixo da descida do título, então "íntegro em repouso" ⇒ íntegro na descida toda.
- Spec: `docs/superpowers/specs/2026-08-06-hero-overlap-texto-direita-design.md` · Plano: `docs/superpowers/plans/2026-08-06-hero-overlap-texto-direita.md`

### Item 2 — Seta de scroll unificada no GSAP (RESOLVIDO)

- **Sintoma re-comprovado antes do fix:** a 90% da saída, o GSAP escrevia `opacity: 0.1004` no elemento e o computed seguia `1` — a `transition: opacity 1s, transform 1s` do CSS interpolando por conta própria sobre cada escrita do GSAP.
- **Correção:** removida a linha `transition` do `.scroll-down-wrapper` (só listava as duas propriedades em disputa). O `@keyframes bounce` do `.scroll-arrow` ficou intacto (elemento filho, sem conflito). Nenhum toggle de classe dependia da transition (verificado por grep).
- **Depois:** computed == GSAP em 90% (`0.1004`) e em 100% (`0` + `visibility: hidden` do autoAlpha). O fade de ENTRADA da seta agora é só o tween GSAP (1s, power2.out) — percepção levemente mais direta, **aprovada no UAT**.
- Spec: `docs/superpowers/specs/2026-08-06-seta-scroll-transition-design.md` · Plano: `docs/superpowers/plans/2026-08-06-seta-scroll-transition.md`

### Conhecimento operacional NOVO de pilotagem (browser automatizado, aba throttled)

- **Corrupção por refresh no meio da faixa:** `ScrollTrigger.refresh()` disparado por eventos assíncronos (onComplete da entrada, load) com a página parada DENTRO da faixa de um trigger e o ticker congelado recaptura os starts dos tweens com os elementos já deslocados (`invalidateOnRefresh`) — e cada tween pode recapturar um número diferente de vezes, produzindo estados mistos (frações de progresso diferentes por elemento). **Protocolo correto:** `scrollTo(0,0)` → `heroTl.progress(1)` → `tick` → `ScrollTrigger.refresh(true)` → 2 ticks → só então scrollar para a faixa. Não afeta usuários reais.
- **Localizar a `heroTimeline`** (const em closure, sem acesso global): `gsap.globalTimeline.getChildren(true, false, true).find(tl => tl.paused() && !tl.scrollTrigger && tl.getChildren(true, true, false).some(tw => tw.targets().includes(document.querySelector(".hero-designer"))))`. Depois `progress(1)` dispara o onComplete e habilita os triggers com os elementos no estado certo.
- **Screenshots CDP** na aba throttled dão timeout de 30s às vezes; `gsap.ticker.tick()` + repetir a captura resolve.
- **Resize da janela <992px durante a pilotagem** desmonta `hero-exit`/`lum` na hora (matchMedia) — checar `innerWidth` antes de cada medição. **Bônus:** isso verificou ao vivo o teardown do matchMedia, que 27/07 listava como não verificado (parcial: teardown por resize funciona; a CARGA em viewport mobile real segue não vista).

### BACKLOG (ordem acordada, atualizada)

1. **Suavidade do scrub do vídeo** (era o item 3) — PRÓXIMA FRENTE. Investigar primeiro a suspeita registrada em 27/07: `scrub` em `ScrollTrigger.create()` **sem animação anexada** pode não suavizar nada — o `self.progress` do `onUpdate` seguiria o scroll cru, e o `scrub: 3` do trigger `hero-video` nunca teria feito efeito. **Não verificado.** Se confirmado, a suavização precisa ser feita de outro jeito (ex.: interpolar o `currentTime` no ticker). O trigger está isolado (`hero-video`, faixa 0→1vh), então o ajuste é de baixo risco.
2. **Responsividade mobile/tablet** (era o item 4) — "está tudo muito desencaixado" no celular. Lembrar: no mobile a seção da luminária não existe; o acordeon `#service` assume (decisão da spec de 19/07). Somar a esta frente: a colisão dos textos da direita EM REPOUSO em janelas internas ≥ ~917px de altura (pré-existente, documentada no spec do item 1 de hoje) e o UAT em alturas 900/1080px via DevTools que ficou de fora do ciclo de hoje.

### Roteiro sugerido para a próxima sessão (07/08)

1. Abrir com o item 1 do backlog (scrub do vídeo). Fase de investigação antes de qualquer mudança: (a) conferir na referência local do GSAP (`.claude/skills/gsap/references/gsap-scrolltrigger.md`) e/ou na doc oficial se `scrub` sem `animation` suaviza o `self.progress`; (b) medir ao vivo: comparar `self.progress` com o scroll cru durante movimento (a pilotagem com ticker manual NÃO serve para medir suavização temporal — vai precisar de aba em foco real ou de logging com a página rodando livre; considerar `read_console_messages` com a aba aberta pelo Pedro).
2. Brainstorm curto com o Pedro sobre a SENSAÇÃO desejada do vídeo (mais peso? mais resposta?) antes de implementar qualquer suavização.
3. Se sobrar fôlego: iniciar a auditoria mobile (item 2).

## Atualização 27/07/2026 — SAÍDA DA HERO RESOLVIDA, APROVADA NO UAT E PUBLICADA (itens 1 e 2 do backlog desta seção resolvidos em 06/08, ver acima)

**Estado dos ambientes:** `main` = `2221d91`, publicada na Vercel. Working tree limpo (só `.claude/` untracked, pendência antiga). O que está no ar é exatamente o que o Pedro testou e aprovou ("funcionou muito bem"). Ponto de retorno anterior preservado na tag **`hero-pin-baseline`** (`d61a2f0`) e a branch de trabalho `ajuste-saida-hero` continua no GitHub.

**O problema, com causa raiz medida:** durante a saída dos textos da hero, a página rolava de verdade por baixo da animação. A timeline `hero-exit` era a única do fluxo ancorada em elemento nenhum pinado: ela ia de `.lum-section top bottom` até `top top`, ou seja, era scrubada exatamente na faixa entre o fim do pin do vídeo (776px, numa janela de 776 de altura) e a chegada da luminária (1552px) — 100vh de rolagem real. Medição do deslocamento da `#hero` durante a saída, **antes da correção: −310px**. Esse era o "escorregar" que o Pedro sentia; a animação dos textos em si sempre esteve correta.

**A solução (spec `docs/superpowers/specs/2026-07-27-hero-saida-pin-design.md`, plano `docs/superpowers/plans/2026-07-27-hero-saida-pin.md`):** o ScrollTrigger único que prendia a hero *e* rodava o vídeo — ambos sob `scrub: 3` — virou **três, com uma responsabilidade cada**:

| Trigger | Faixa (janela de 776px) | Papel |
|---|---|---|
| `hero-pin` | 0 → 1242 | Só prende a hero. Sem scrub, sem animação. |
| `hero-video` | 0 → 776 | Só o vídeo: `scrub: 3` e o `onUpdate` intocados (guard `isFinite` preservado). |
| `hero-exit` | 776 → 1242 | Só a saída dos textos, `scrub: 1` próprio. |

O pin foi estendido de 100vh para 160vh (100 de vídeo + 60 de saída) e a timeline de saída passou a ser ancorada em `#hero`, começando onde o vídeo termina. **Nenhum valor da animação dos textos mudou** — os seis `.to()` são os mesmos. Medição depois: **deslocamento 0px**. A luminária desceu no documento (`lum` agora 2018→6018) e acompanhou sozinha, por estar ancorada na `.lum-section`.

**Por que a tentativa de 26/07 foi reprovada (hipótese que guiou o redesenho):** naquela rota eu estendi o pin **e** troquei a animação de saída por uma reversão fiel da entrada, que herdou o `scrub: 3` do vídeo. Duas variáveis de uma vez, uma delas pesada. Desta vez só o mecanismo de scroll mudou; a animação ficou intacta. Lição para repetir: **quando o usuário diz que a animação está quase certa e o problema é a sensação, mexer só no mecanismo.**

**Decisões técnicas que valem preservar:**
- As faixas dos três triggers são **posições absolutas de scroll** derivadas de `vh()` e da constante `HERO_TOP = 0` (a hero é a primeira seção). Nenhum trigger lê `.start`/`.end` de outro, então nada depende da ordem de refresh do ScrollTrigger. O plano original previa `refreshPriority`, abandonado porque a referência local do GSAP (`.claude/skills/gsap/references/gsap-scrolltrigger.md`, linha 61) afirma que *menor* refresca primeiro, contrariando o que a documentação online diz — em vez de apostar numa das leituras, a dependência foi eliminada.
- O pin estendido é **condicional a `≥992px`** (`heroExitAtiva()`), porque a timeline de saída vive dentro do `matchMedia` de 992px. Abaixo disso o pin continua 100vh, como antes.
- Os triggers da hero são habilitados **juntos** (`heroTriggers.forEach`) no `onComplete` da entrada — se o pin entrasse em vigor antes, criaria seu espaçador com a página ainda travada.
- Parâmetros de calibração prontos: **`HERO_EXIT_VH = 0.6`** (quanto scroll a saída consome) e o `scrub: 1` da timeline de saída.

**Verificado no navegador (janela 1536×776):** faixas corretas e encostando sem sobrepor; `#hero` em `top: 0` em todos os pontos da saída; os seis alvos chegam a opacidade 0 antes de o pin soltar; scroll reverso restaura tudo; seis idas e voltas rápidas atravessando a emenda vídeo→saída não deixam elemento preso em estado intermediário. UAT do Pedro: aprovado.

**NÃO VERIFICADO:** o comportamento abaixo de 992px. A ferramenta `resize_window` da extensão reporta sucesso mas não altera a viewport (`innerWidth` seguiu 1536 em duas tentativas). Por construção o mobile recebe o mesmo pin de antes, mas isso não foi visto rodando — confirmar na próxima sessão, de preferência pelo DevTools do próprio Pedro.

**BACKLOG, em ordem de prioridade acordada:**

1. **Sobreposição no bloco de texto da direita** (o "pequeno ajuste" que o Pedro confirmou faltar após o UAT). A descrição sobe e invade a área do título DESIGNPLINARY em vez de já estar cortada pela máscara. Hipótese calculada a partir do CSS inline do `index.html`: `.hero-title-02-wrapper` (`bottom: 20vh`, `height: 215px`) e `.hero-description-wrapper` (`top: 74%`) dividem ~54px da mesma faixa vertical numa janela de 900px. **Não verificado visualmente.** Ficou mais aparente depois deste ajuste, porque a tela parada dá tempo de ver.
2. **Uniformizar a animação da seta de scroll (`.scroll-down-wrapper`)**, item levantado pelo Pedro por preferir código coerente. Hoje ela tem `transition: opacity 1s ease-in-out, transform 1s ease-in-out` no CSS **e** é animada por GSAP na entrada e na saída — os dois sistemas disputam a mesma propriedade, e o CSS interpola por 1s por conta própria. Comprovado ao vivo: no fim do pin o GSAP escrevia `opacity: 0.0009` no elemento enquanto o `computed` seguia em `1`. Correção provável: remover `opacity`/`transform` do `transition` e deixar o GSAP mandar sozinho. **Cuidado:** essa transição também afeta a animação de ENTRADA, que está aprovada — mexer exige novo UAT da entrada, por isso não foi feito de carona.
3. **Suavidade do scrub do vídeo** — o Pedro considera o movimento atual insatisfatório. Agora isolado no trigger `hero-video`, o que torna o ajuste de baixo risco. Observação a investigar: `scrub` com `ScrollTrigger.create()` **sem animação anexada** pode não ter efeito nenhum sobre o `self.progress` do `onUpdate` — se for o caso, o `scrub: 3` nunca suavizou nada e a suavização precisa ser feita de outro jeito (ex.: interpolar o `currentTime` no ticker). **Não verificado.**
4. **Responsividade mobile/tablet** — o Pedro olhou no celular e relatou que "está tudo muito desencaixado". Frente própria. Lembrar que no mobile a seção da luminária não existe: o acordeon `#service` assume, por decisão da spec de 19/07.

**Commits desta sessão:** `2d3ba4e` (spec), `c153aa5` (plano), `ed28696` (task 1 — separação dos triggers), `73e9e7c` (task 2 — pin estendido), `2221d91` (merge na main).

**Nota operacional:** durante o merge, o Git falhou uma vez com `unable to append to '.git/logs/HEAD': Permission denied` — bloqueio transitório do arquivo (antivírus ou indexador do Windows). O merge ficou pela metade (mudanças no index, sem commit) e foi concluído com `git commit --no-edit`. Se reaparecer, é isso: não é corrupção do repositório.

## Atualização 26/07/2026 (noite) — tentativa de ajuste da SAÍDA DA HERO reprovada e REVERTIDA (RESOLVIDO em 27/07, ver seção acima)

**Estado dos ambientes (verificado no encerramento):** working tree limpo, HEAD = `origin/main` = `1bf07e9`; localhost:5173 e a produção Vercel servem o MESMO conteúdo (versão aprovada: luminária completa + saída antiga da hero). A tentativa abaixo NUNCA foi commitada — produção intocada.

**O pedido do Pedro (hero):** durante o scroll pós-vídeo, a saída dos elementos da hero (NÓS SOMOS / MULTI / DESIGNPLINARY / descrição / switch / seta) transmite sensação de ROLAGEM — o conjunto desliza para cima com a página. Desejo: todos os elementos revertem FIELMENTE a animação de entrada (a heroTimeline pós-switch), com a TELA PARADA — o scroll dirige a animação sem rolar a página — e só depois a página rola para a luminária entrar (aí sim parecendo "a luminária entrando"). Decisões já acordadas: textos revertem fiel ao estado inicial do CSS; switch e seta saem em fade simples; sequencial limpo (vídeo termina preto → começa a saída).

**Tentativa implementada (rota 1) e REVERTIDA:** pin da hero estendido de 100vh para 160vh (`end: "+=160%"`); fase A (0–100vh) = vídeo com o ritmo original (onUpdate com `progress×1.6` clampado em 1); fase B (100–160) = timeline `heroSaida` (reverso fiel, ordem inversa, ease power2.in espelhado; estados-alvo = os `transform` iniciais do CSS: designer y:100%, title-01 y:-100%, title-02 x:-100% [desfazendo antes o y:105px], description y:-100%) anexada como `animation` do trigger (scrub 3, timeline virtual de 160 com a saída em 100–155); o `hero-exit` antigo (trigger .lum-section) removido. Pré-validação por estados no browser passou (conjunto imóvel, preto no fim, unpin→lum ok). **O UAT REAL DO PEDRO REPROVOU — "os ajustes não funcionaram", MOTIVO AINDA NÃO DETALHADO.** Revertido com `git restore index.html`.

**PRÓXIMA SESSÃO — roteiro:** (1) PRIMEIRO: pedir ao Pedro o relato do que ele viu de errado no teste real (é a informação que falta; nada de reimplementar antes disso); (2) diagnosticar a causa com o relato em mãos (candidatos a investigar: sensação do scrub/lag na fase B, a transição vídeo→saída, interações com o clique/entrada, comportamento do pin estendido no scroll real, mobile); (3) redesenhar a solução em conversa e só então implementar. O design da rota 1 acima fica como ponto de partida documentado — pode ser refinado ou descartado conforme o relato.

**Notas de pilotagem (browser) desta rodada:** simular o fluxo de entrada da hero com o ticker travado é hostil (typed text + callbacks do clique). Atalho que funcionou: `gsap.set` manual dos estados pós-entrada + esconder `[class*="typed"/"cursor"/"overlay"]` + `stHero.animation.invalidate()` — os starts do scrub capturam valores errados na pilotagem (elementos ainda pré-entrada); no fluxo real capturam certo porque o trigger só habilita após a entrada completar.

## Atualização 26/07/2026 — coreografia de saída FINALIZADA e APROVADA ("Perfeito!")

Três rodadas de calibração com UAT do Pedro (sequências `ajuste-facho-*.png` em `references/`):

1. **Cúpula não girava** — causa: erro de sinal meu na composição de rotações (convenção y-down). A intuição do Pedro estava certa: a cúpula NÃO precisa de giro próprio — ela (e o facho) herdam o giro do braço, como numa luminária real. Tween da cúpula removido.
2. **Facho girava além do braço + boca acima da horizontal + quina** — morph de abertura REMOVIDO (cadeia 100% rígida: um único giro, o do braço, comanda tudo); braço **+51°** (não +53.75): é o giro que deixa a corda da boca vertical exata na tela. **Metodologia de verificação de ângulos** (após o erro de sinal): transformar os extremos da corda da boca `(739.76,68.43)-(859.61,165.48)` via `getScreenCTM` e medir a linha resultante — alvo 90°, desvio zero confirmado. Commit `3fb7229`.
3. **O "retângulo"** — a cortina em movimento varria a cena com a borda vertical do próprio elemento (aprendizado: `clip-path` só RECORTA o elemento, não estende o fundo — o clip inclinado era inócuo). Solução (proposta do Pedro): **cortina ESTÁTICA**; o rig desliza **170%** (`power2.in` — trajeto até t95 ≈ igual ao aprovado) e as fronteiras oblíquas do próprio facho engolem o preto até a tela ficar branca exatamente em t100. Leque estendido (raios −3000, base 2200) para a ponta nunca entrar na tela. Cobertura verificada analiticamente (folga 108px). Commit `fa18db1`.

**Estado FINAL da saída (t85–100), 3 tweens:** rig `x:170% dur15 power2.in @85`; braço `rotation:+51 y:+200 svgOrigin(992.23,110.77) dur10 @85` (cúpula e facho herdam tudo); fades de conteúdo/heading `@85`. Cortina e beam estáticos. Feature da luminária COMPLETA: entrada, pisca, carrossel e saída aprovados.

**Deploy/servidor (RESOLVIDO 26/07):** projeto `kriya` criado na Vercel (team pedroribeiro2706s-projects), conectado ao repo GitHub — **cada push em `main` = deploy automático de produção** (validado). Site estático puro sem build (`vercel.json` força; nunca deixar autodetectar "Vite"). Vercel Authentication DESATIVADA pelo Pedro (site público). URL: https://kriya-pedroribeiro2706s-projects.vercel.app — raiz serve o `index.html` (agora a página CANÔNICA; `portfolio.html` = legado; CLAUDE.md atualizado). Railway: não usado (verificado).

## Atualização 25/07/2026 — SVG articulado INTEGRADO (Etapas 1 e 2 implementadas). AGUARDANDO AJUSTES FINAIS DO UAT DO PEDRO

**Pedro entregou o SVG** (`references/luminaria.svg` + `luminaria.ai`, versionados). Reestruturado nesta sessão: grupos ANINHADOS `base` | `braco` (pivô 992.23,110.77) > `cupula` (pivô 871.49,22.98) > `facho` — cadeia cinemática: cada elo carrega os de baixo por construção. Aninhamento cupula-dentro-de-braco foi decisão da sessão (Pedro confirmou): quando o braço desce/gira, a cúpula e o facho acompanham automaticamente.

**Correção de entendimento da saída (Pedro, confirmada nos frames):** NÃO são 2 fases sequenciais — é uma coreografia única com movimentos SOBREPOSTOS: o rig já desliza para fora enquanto a cúpula gira; o eixo do braço desce a haste verticalizando o braço (senão a cúpula subiria atrás do menu fixo); o leque ABRE (ângulo de abertura aumenta — morph, não rotação rígida); a cunha preta sai junto. Sequência-alvo: `references/animacao-luminaria-ideal-01..05.png`.

**Etapa 1 — troca estática (commit `ab2a9d3`, UAT APROVADO 25/07):**
- SVG inline no `.lum-rig` no lugar do `<img>` PNG. viewBox recortado `732.21 -11.54 399.92 479.23` replica a caixa do PNG aprovado (bbox opaco 868x1054 + padding 17px esq/15 dir/26 topo no PNG 900x1080) — caixa de layout idêntica, `translateX(%)` de entrada/saída preservados.
- Cor `#625e5e` amostrada do PNG (o export do Illustrator vinha com `#bcbcd1` — a fonte `references/luminaria.svg` ainda tem a cor antiga; o inline é a verdade).
- Ids no inline: grupo raiz renomeado para `lum-svg-root` (a section já usa `id="luminaria"`); demais preservados (`base`, `braco`, `cupula`, `facho`, `haste`, `eixo-*`, `braco-shape`, `cupula-shape`).

**Etapa 2 — migração da luz + coreografia nova (implementada nesta sessão; commit desta atualização; UAT final PENDENTE):**
- `#facho` agora é a luz visível, com raios estendidos ~3x (path `M-1800,509.37 L0,205.29 C... 849.52,468.58 L849.52,1400 L-1800,1400 Z` — a extensão continua a tangente exata do desenho do Pedro; sem fresta em nenhum viewport).
- `.lum-beam` virou container TRANSPARENTE do conteúdo (títulos/textos): mantém o clip `--lum-clip-on` (corte do carrossel na diagonal), z-index 1→4 (conteúdo SOBRE a luz). `.lum-heading-wrap` z 2→4. Flicker (lightOn) retargetado: `const luz = [".lum-beam", "#facho"]` — piscam juntos.
- Fundo preto virou ELEMENTO: `.lum-curtain` (z1, `clip-path` com borda esquerda inclinada); `.lum-section` background agora é `#fff`. A cunha preta dos frames 04–05 emerge da interseção curtain × área-não-coberta-pelo-facho — não é desenhada à mão.
- Saída nova (substituiu `clipPath: LUM_CLIP_FULL` + rig @87–99; a const LUM_CLIP_FULL foi removida do JS; as vars `--lum-clip-full` seguem no CSS sem uso, limpar depois):
  - `.lum-rig` x:110% dur 15 @85, ease `power1.in` (devagar nos frames 01–03, acelera 04–05)
  - `#cupula` rotation −35 svgOrigin "871.49 22.98" dur 11 @85
  - `#braco` rotation +53.75 (verticaliza; o rect nasce a −53.75) + y:+200 (desce a haste), svgOrigin "992.23 110.77", dur 13 @85
  - `#facho` attr d → FACHO_ABERTO dur 8 @85 — abertura de 22° na boca; interpolação NATIVA do GSAP (os dois paths têm a MESMA estrutura de comandos M L C C L L Z — não precisou de MorphSVG)
  - `.lum-curtain` x:135% dur 10 @90
- Verificação por estados forçados no browser: 0.50≈frame 01, 0.88≈02, 0.93≈03, 0.96≈04/05, 1.0 = tela 100% branca ✓. Junção boca↔facho conectada em TODOS os estados (herança por construção). Zoom confirmou: sem gap real (o que parecia gap era compressão JPEG do screenshot).

**Delta conhecido vs a referência:** no ~frame 04 a cunha preta ideal do Pedro é mais LARGA (o escuro atrás/abaixo da cúpula desce grosso até a base); no implementado o facho aberto ilumina mais o canto inferior-direito. Ajustável na geometria do FACHO_ABERTO se o Pedro quiser fiel ao Photoshop.

**PENDENTE — PRÓXIMA SESSÃO COMEÇA AQUI:** Pedro viu o resultado ("está ficando interessante"), saiu antes do UAT completo e VAI EXPLICAR OS AJUSTES que ainda quer. Parâmetros calibráveis prontos: ângulos (−35 cúpula / +53.75 braço / 22° abertura), descida do braço (+200), janelas e durations dos 5 tweens, ease do rig, velocidade/inclinação da cortina, geometria do FACHO_ABERTO.

**Notas operacionais:**
- claude-in-chrome FUNCIONOU (Pedro abriu o Chrome; nas sessões anteriores estava desconectada).
- Pilotagem determinística da timeline em aba oculta (throttled): helper `window.__goLum(p)` via console — `scrollTo(start + p*(end-start))` + `ScrollTrigger.update()` + `st.getTween().progress(1)` (mata a suavização do scrub) + `gsap.ticker.tick()`. Para screenshots com a luz acesa: matar a timeline do flicker (kill nos tweens de opacity de `#facho`/`.lum-beam`) e `gsap.set(opacity 1)` — senão o flicker fica oscilando em câmera lenta pelos ticks manuais.
- Scroll programático: usar `body/html overflow 'visible'` — com `'auto'` o `document.scrollingElement` ficou null e `window.scrollTo` parou de funcionar.
- Vite dev na 5173 (`npm run dev`).

## Atualização 23/07/2026 — calibração aprovada; saída melhorada; decisão: luminária SVG articulada com facho embutido. AGUARDANDO SVG DO PEDRO

**UAT do Pedro (manhã) aprovou:** posição do facho, entrada da luminária e pisca. A calibração que estava pendente no working tree desde 21/07 (polígono do `--lum-clip-on` + `.lum-rig` ancorada no rodapé com 82.2vh) foi commitada como `8b54bed`.

**Bug reportado na saída da seção:** quando a luminária desliza para fora e o facho abre até a tela branca, o facho se desconecta visualmente da cúpula — cria formas próprias, "luz sem fonte" (sequência `references/secao-luminaria-pos-fix-04a..h.png`). Causa raiz verificada no código: a interpolação do clip-path é vértice a vértice e o mapeamento era ruim — o vértice da boca da cúpula tinha destino no canto superior ESQUERDO (direção oposta à saída do rig, que vai para a direita), e as janelas de tempo eram dessincronizadas (beam 85–100, rig 87–99).

**Fix intermediário aplicado (commit `7772c6d`):** `--lum-clip-full` reordenado (vértice da boca → canto superior direito; o leque abre com dobradiça na boca) + tweens do beam e do rig na mesma janela (87–99; a `lumMaster` já tem `defaults: { ease: "none" }`). Segunda UAT: "ficou melhor, mas ainda há desconexão" (`references/secao-luminaria-pos-fix-05a..g.png`). As desconexões residuais são ESTRUTURAIS, não calibráveis de forma robusta no método atual: (1) vertical — o vértice de origem sobe até o topo da tela enquanto a boca da cúpula mantém a altura durante o slide; (2) velocidade — a cúpula percorre 110% da largura do rig enquanto o vértice percorre só 25vw (~1,5× mais lento); no fim sobra coluna preta à direita sem fonte de luz.

**Decisão alinhada com o Pedro:** substituir o PNG (`luminaria.png`) por um **SVG articulado com o facho como path DENTRO do grupo da cúpula**. O facho deixa de ser uma camada HTML separada tentando "adivinhar" onde a boca está: como filho do grupo da cúpula ele herda rotação e translação — conexão perfeita por construção, em qualquer viewport. A animação de saída vira 2 fases, conforme a sequência de referência que o Pedro montou no Photoshop (`references/animacao-luminaria-ideal-01..05.png`):

- **Fase A** — luminária parada; a cúpula GIRA para cima (pivô na articulação cúpula-braço) e o leque gira junto, abrindo (morph de path — MorphSVG é gratuito desde o GSAP 3.13) até a aresta superior do leque encostar no topo da tela.
- **Fase B** — o rig desliza para fora pela direita; a cunha preta restante (acima/abaixo da cúpula) sai junto com ela; tela termina 100% branca.

**O Pedro vai produzir o SVG** (ele tem o vetor fonte). Especificação combinada do arquivo único:
- Grupos/camadas nomeados (viram IDs no export): `base`, `braco`, `cupula`; o path `facho` DENTRO da camada `cupula`.
- Pose idêntica ao PNG atual (troca 1:1, preserva a calibração de entrada aprovada).
- Facho desenhado no estado aceso atual (como `animacao-luminaria-ideal-01.png`), com os raios estendidos para bem além da tela (≥3× o tamanho da luminária). Opcional: segunda camada oculta `facho-aberto` com o leque da fase A aberta (ideal-03) para o morph ser fiel ao desenho do Pedro.
- Marcador de pivô: círculo pequeno na articulação cúpula-braço, camada `pivo-cupula` (o código lê a posição e o esconde). Opcional: `pivo-braco`.
- Sem clipping masks/efeitos raster; paths chapados; cores do PNG atual, facho branco.
- Export Illustrator: SVG com Object IDs = Layer Names; o facho pode vazar do artboard.

**O que NÃO muda:** entrada, flicker, textos/títulos, e o desenho do facho aceso aprovado (o path inicial do facho replica os ângulos do `--lum-clip-on` atual).

**Próximo passo (quando o SVG chegar):** plano de integração — trocar o PNG no `.lum-rig` pelo SVG inline; decidir o destino do `.lum-beam`/clip-path atuais (o facho passa a viver no SVG); adaptar o flicker para o novo alvo; reanimar a saída em 2 fases; verificação visual a cada etapa antes de declarar pronto.

**Notas operacionais desta sessão:**
- A extensão claude-in-chrome ficou DESCONECTADA a sessão inteira — as verificações visuais foram do Pedro, via screenshots salvos em `references/`. Reconectar na próxima sessão se possível.
- `references/` passou a ser versionada no git (screenshots de UAT, sequência ideal e PSDs de trabalho, ~11 MB).
- Pendência pequena: decidir se `.claude/` (skills locais do repo, ex. `gsap`) entra no git — está untracked.

## Atualização 20/07/2026 (terceira parte) — bug do título corrigido + bug crítico novo encontrado e corrigido

**Bug do título (`.lum-heading` escondido atrás do menu) CORRIGIDO e verificado visualmente.** Causa raiz confirmada por medição ao vivo via `getBoundingClientRect()`: `nav.w-nav` tem altura fixa de ~128px que não escala com vh, enquanto `.lum-heading-wrap` usava `top: 8vh` (proporcional) — em viewports baixas (~776px, notebook) o H2 ficava inteiramente coberto (`top:62px, bottom:119px`, dentro da faixa 0-128px do menu). Trocado para `top: 160px` fixo (commit `5ee3611`). Confirmado no screenshot: título completo visível com respiro abaixo do menu.

**Bug crítico novo, descoberto e corrigido nesta sessão (commit `a319386`), mais grave que o do título:** o `<video>` da hero (`assets/coffee-03.mp4`) não tem metadata garantida no momento em que `window.load` dispara o script. Quando isso acontece, `heroVideo.duration` é `NaN`, e a criação do `ScrollTrigger` do vídeo (linha ~1631) lançava `TypeError: currentTime non-finite` — uma exceção **não capturada** que interrompia a execução do resto do `<script>` (tudo roda dentro de um único callback síncrono de `window.addEventListener("load", ...)`). Isso significa que **nenhum ScrollTrigger da seção luminária era criado** (nem `hero-exit` nem `lum`) sempre que o vídeo carregava devagar — confirmado via JS ao vivo (`ScrollTrigger.getAll()` só retornava o trigger da hero, sem `hero-exit`/`lum`). Reproduzido em 100% das cargas de página com cache frio nesta sessão; provavelmente intermitente (depende da velocidade de carregamento do vídeo), o que explica por que o UAT anterior (9:09am) viu tudo funcionando — o commit não mudou entre as duas verificações, só o timing de rede/cache. Fix: guard `isFinite(heroVideo.duration)` antes de setar `currentTime`.

**Lição de processo para sessões futuras que usem `claude-in-chrome` para verificar animações GSAP:** a aba controlada pela extensão fica com `document.visibilityState: "hidden"` (não é a aba ativa em foco do SO), e o Chrome throttla `requestAnimationFrame` para abas ocultas — isso trava o `gsap.ticker` e qualquer timeline/ScrollTrigger para de avançar, mesmo com `paused: false`. Sintoma: cliques registram (`addEventListener` funciona normal) mas nada anima visualmente, mesmo esperando vários segundos. **Workaround usado:** via `javascript_tool`, chamar `gsap.ticker.tick()` manualmente (avança usando o tempo real decorrido) ou setar `.progress(1)` direto na timeline para forçar o estado final e verificar o layout resultante — não reproduz a animação em si, mas é suficiente para validar posicionamento/CSS final. Para simular scroll dentro de seções pinadas, usar `window.scrollTo(0, Y)` + `ScrollTrigger.update()` em vez de `computer scroll` (mais confiável sob throttling). Isso não é um bug do site — é uma limitação do canal de automação; um usuário real com a aba em foco não tem esse problema.

**Próximo passo sugerido:** nenhum bug conhecido pendente da luminária. Seguir para UAT do Pedro com a aba em foco real (não via automação) para confirmar a entrada/flicker/scroll completos com o fix do vídeo aplicado, já que a sessão anterior só validou isso antes da descoberta do bug do vídeo.

## Atualização 20/07/2026 (segunda parte) — UAT confirmou 2 fixes, achou 1 bug novo, sessão reiniciando

**UAT do Pedro confirmou os dois fixes do commit `262287f`:** o switch aparece e funciona, a animação da hero roda normal, o scroll é liberado depois, e a entrada/flicker/scroll da luminária (títulos + textos ao lado) funcionam como esperado.

**Bug novo encontrado no screenshot (`references/secao-luminaria-pos-fix-01.png`):** o título da seção (`.lum-heading`, "O que podemos fazer por você, hoje?") não aparece — fica atrás/embaixo do menu fixo do site. Causa provável: `.lum-heading-wrap` tem `top: 8vh` em `css/luminaria.css`, posição alta demais dado que o menu fixo cobre ~150px do topo da viewport. O subtítulo (`.lum-heading-sub`, que vem depois no HTML e por isso fica mais abaixo) aparece normalmente — só o H2 fica coberto. **NÃO CORRIGIDO AINDA.** Calibrar `top` (ou adicionar padding-top considerando a altura do menu) é o próximo passo, agora com verificação visual real disponível.

**Duas causas-raiz do bug do switch (resolvido) valem registrar para não repetir o erro:**
1. O review final da branch (sem acesso a navegador) leu `<!--section class="avator-outterwrap"><section class="avator-sticky">...</section-->` como se fosse uma seção viva de 100vh entre a Hero e a luminária — mas é markup morto, comentado, lixo do export Webflow. O fix aplicado em cima dessa leitura errada (reancorar o trigger `hero-exit` em `.avator-sticky`) quebrou a timeline que esconde `#switch-btn`. Revertido para `.lum-section` (o elemento real).
2. O link "O que fazemos" do menu apontava para `#service` (acordeon), que fica `display:none` no desktop — âncora para elemento sem caixa de layout não funciona. Adicionada `<div id="services-anchor">` sempre visível antes das duas versões da seção; menu atualizado para apontar para ela.

**Lição para a próxima sessão:** fixes de CSS/animação/scroll baseados só em leitura de código, sem verificação visual ao vivo, têm risco real de introduzir regressões (foi exatamente o que aconteceu no ponto 1 acima). A extensão do Chrome está confirmada conectada e funcional agora (20/07, à tarde) — usar `mcp__claude-in-chrome__*` para verificar visualmente ANTES de declarar qualquer fix de UI como resolvido, não só depois.

**Por que a sessão está sendo reiniciada:** a sessão anterior bateu o limite de uso do Fable 5 e o Claude Code trocou automaticamente para Sonnet 5. O painel de billing da conta confirma que o Fable 5 continua incluído no plano Max, e que ver uma mensagem de "configurar créditos de uso" significa que é preciso **reiniciar o Claude Code** (não basta `/model` dentro do processo já rodando) para a verificação de plano ser atualizada.

**Commits desta sessão (20/07):** `ea7bc3d`..`262287f`, todos em `origin main`.

## Estado no fim da sessão de 20/07/2026 — seção da luminária implementada, aguardando UAT visual

A seção da luminária (ver "A feature em desenvolvimento" abaixo) foi projetada (brainstorming → spec aprovada → plano) e **implementada inteira** em `index.html` + `css/luminaria.css`, via subagent-driven-development (7 tasks + 1 commit de correção do review final). Documentos:
- Spec: `docs/superpowers/specs/2026-07-19-secao-luminaria-design.md`
- Plano: `docs/superpowers/plans/2026-07-19-secao-luminaria.md`
- Commits: `ea7bc3d`..`3c7a913` (todos em `origin main`)

**O que falta, em ordem:**
1. **UAT visual com o Pedro.** Nenhuma verificação no navegador aconteceu nesta sessão — a extensão claude-in-chrome ficou desconectada o tempo todo. Toda verificação foi estática (sintaxe JS, greps de posicionamento, HTTP 200) + review de spec por task + um review final de arquitetura que pegou 1 Critical + 3 Important (todos corrigidos no commit `3c7a913`) + minors. **Abrir http://localhost:5173/index.html e testar ao vivo é o próximo passo obrigatório antes de qualquer coisa.**
2. A reconfirmação automática dos fixes do review final falhou por limite de uso de sessão do subagente (resolvido: eu mesmo verifiquei o diff `ba75012..3c7a913` linha a linha contra o que o review pedia — os 6 fixes batem, nenhum problema novo visível). Ainda assim, é uma segunda opinião que só a UAT visual substitui de verdade.
3. Pontos específicos para olhar na UAT (o review final já anotou como prováveis pontas soltas):
   - O recorte diagonal do facho (`--lum-clip-on` em `css/luminaria.css`) pode cortar as listas de texto mais longas (item 1 tem 8 linhas) — calibrar o polígono.
   - A transição hero → seção preta (o "vão" da seção `.avator-sticky`, 100vh) — o `hero-exit` foi reancorado nela no fix, mas nunca foi visto rodando.
   - Scroll-slam (ida/volta muito rápida) no trecho 15%↔85% — testar que nada fica preso.
   - Resize no meio do pin.
4. Minors deixados de propósito para a calibração (não corrigir sem o Pedro decidir): classe `is-active` sem prefixo `lum-`; `font-family` "Coolvetica Compressed Hv" duplicada em 2 pontos do `luminaria.css` em vez de var.
5. No mobile (≤991px) a seção antiga do acordeon (`#service`) continua sendo exibida — isso é intencional (decisão da spec), não um bug.

## O que é este projeto

Portfólio da Kriya Design (Pedro Ribeiro), site one-page com animações GSAP. A experiência: a página carrega com scroll travado, um overlay preto com máscara "lanterna" que segue o mouse e um texto "Que tal um cafézinho?" digitado com cursor. Ao clicar no **switch SVG**, uma timeline GSAP revela os títulos ("PEDRO RIBEIRO", "MULTI DESIGNPLINARY"). Quando ela termina, um ScrollTrigger com `pin` é habilitado: o scroll controla o `currentTime` do vídeo `assets/coffee-03.mp4` (`scrub: 3`) — a xícara de café se aproxima conforme o usuário rola. Depois vêm as seções services, about, projects, contact e footer.

O projeto foi criado ~março/2025, à mão, antes do Pedro usar agentes — por isso os back-ups manuais e a ausência original de git.

## Estado atual (fim da sessão de 19/07/2026)

- **Git/GitHub**: repositório https://github.com/pedroribeiro2706/kriya (público). Commits até aqui: `c2bd7d6` (estado inicial, 58 arquivos) e `c4def0a` (estação de testes). gh CLI autenticado como `pedroribeiro2706`.
- **Este diretório é o local canônico do código.** A pasta antiga (`G:\OneDrive\Documents\01 - Design\01 - Portfólio\Kriya Design\Portfolio`) teve o `.git` removido e virou arquivo morto dos assets pesados (`Photoshop/` 4,7 GB, `Videos/` 5,1 GB — fora do git por causa do limite de 100 MB do GitHub; o OneDrive é o backup deles).
- `package.json` ganhou o script `"dev": "vite"` (não existia — era o motivo de o site "não rodar").
- `.gitignore` exclui: `node_modules/`, `Photoshop/`, `Videos/`, `js/gsap-premium*`, `__MACOSX/`, `dist/`.

## Descobertas importantes (não redescobrir!)

1. **`portfolio.html` é a versão principal**, não `index.html`. É um export do Webflow (depende de jQuery + webflow.js via CDN) com o GSAP adicionado por cima num `<script>` inline no final (~linha 1379).
2. **Os HTMLs de `back-ups/` "não rodavam"** porque foram escritos para a raiz do projeto (referenciam `css/...` e `js/...`), mas os CSS/JS deles ficaram soltos dentro de `back-ups/`. Solução aplicada: cópias `v-*.html` na raiz + CSS/JS copiados para `css/` e `js/`. Tudo listado em `versoes.html`.
3. **`test-video-02-bkp-02.html` é idêntico a `test-video-02.html`** (mesmo hash git). A variação real está no JS: `js/test-video-02-bkp-02.js` (15,5 KB) não era referenciado por nenhuma página — a `v-test-video-02-js-bkp.html` foi criada para testá-lo.
4. **GSAP 3.13+ (abril/2025) tornou todos os plugins premium gratuitos** — ScrollSmoother/SplitText no repositório público não são problema de licença. Melhoria futura: migrar para `gsap` do npm e remover os .min.js locais.
5. No `portfolio.html`, ScrollSmoother é registrado mas não usado; SplitText está comentado. Desligar o switch agenda um `location.reload()` após 10 s.

## A feature em desenvolvimento: seção da luminária

O objetivo real do Pedro é **adicionar ao portfolio.html uma seção com uma luminária vetorizada** (assets: `luminaria.png`, `light-mask.svg`, `light-mask-01.svg`; seção "explore" com "WHAT CAN I DO FOR YOU TODAY?"). As tentativas anteriores estão em `index.html`, `test-video-02.html` e no JS órfão `js/test-video-02-bkp-02.js`. **Por isso a limpeza dos arquivos de teste foi suspensa — não apagar nada disso.**

O Pedro ainda vai explicar **como a seção deve funcionar** (o que a luz revela, como se move, o que dispara a animação). Peça essa explicação antes de implementar.

## Próximos passos combinados

1. ~~**[Pedro]** Testar todas as versões~~ ✅ **FEITO em 19/07/2026** — Pedro analisou todos os arquivos na estação de testes, mas **ainda não comunicou as conclusões**. Primeira coisa a fazer na sessão: perguntar qual versão é o melhor ponto de partida e o que ele observou em cada uma.
2. **[Pedro]** Explicar o comportamento desejado da luminária.
3. **[Agente]** Desenvolver a seção da luminária a partir da versão escolhida, integrando ao `portfolio.html`.
4. **[Depois]** Limpeza adiada: remover protótipos obsoletos (só após a luminária pronta), consolidar as ~7 variações de logo em `assets/`, remover `assets/predibase_c1_01_master.mp4` (160 bytes, corrompido), decidir promoção de `portfolio.html` a `index.html`, remover as `<div class="glasp-extension">` (lixo de extensão de navegador) do fim do portfolio.html, e avaliar migrar GSAP para npm.

## Avaliação das versões (Pedro preenche ou dita ao agente)

| Página | Observações do teste |
|---|---|
| portfolio.html | |
| index.html | |
| test-video-02.html | |
| v-test-video-02-js-bkp.html | |
| v-index-bkp-03.html | |
| v-index-estudo.html | |
| v-test-video-03.html | |
| back-ups/teste.html | |
| back-ups/test-video.html | |
