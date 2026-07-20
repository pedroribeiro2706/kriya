# HANDOFF — Retomada do projeto (2026-07-19, atualizado 2026-07-20)

Documento de passagem de contexto entre sessões. Escrito pelo agente que fez a retomada do projeto na sessão de 19/07/2026 (que rodou no diretório antigo do OneDrive), para que a próxima sessão — nesta pasta `G:\Pedro\Dev\Kriya` — comece sem redescobrir nada.

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
