# HANDOFF — Retomada do projeto (2026-07-19, atualizado 2026-07-23)

Documento de passagem de contexto entre sessões. Escrito pelo agente que fez a retomada do projeto na sessão de 19/07/2026 (que rodou no diretório antigo do OneDrive), para que a próxima sessão — nesta pasta `G:\Pedro\Dev\Kriya` — comece sem redescobrir nada.

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
