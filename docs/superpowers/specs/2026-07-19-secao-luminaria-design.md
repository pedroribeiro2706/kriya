# Seção da Luminária — Design Doc

**Data:** 2026-07-19
**Status:** aprovado por Pedro em brainstorming (esta sessão); aguardando revisão final do documento
**Escopo:** substituir a seção do acordeon ("O que podemos fazer por você, hoje?") no novo `index.html` pela seção animada da luminária

## Contexto

O `portfolio.html` é a versão mais completa do site, mas sua segunda seção usa um acordeon simples. A ideia original — mais sofisticada — é uma animação com uma luminária cuja luz revela as áreas de atuação. Diversos protótipos tentaram executá-la (ver `revisao.md`); nenhum acertou por completo. Este design consolida os acertos de cada um.

O trabalho acontece no novo `index.html` (cópia do `portfolio.html` criada em 2026-07-19), preservando `portfolio.html` como referência funcional.

## Referências

- **Mockup visual:** `references/secao-luminaria-01.png` — fonte da composição
- **Mecanismo do Title Switcher:** `back-ups/teste.html` (dois timelines GSAP com scrub: títulos deslizam via `yPercent`, parágrafos em crossfade sincronizado)
- **Saída dos títulos da hero:** `v-index-bkp-03.html`
- **Melhor tentativa geral:** `v-test-video-02-js-bkp.html` (roda `js/test-video-02-bkp-02.js`)
- **Observações de teste de todas as versões:** `revisao.md`
- **Assets:** `assets/luminaria.png` (bitmap da luminária), `assets/light-mask.svg` e `assets/light-mask-01.svg` (shape do facho)

## Comportamento (sequência completa)

1. **Hero sai** — ao final da experiência do café, os títulos da hero animam a saída (referência: `v-index-bkp-03.html`). Gatilho exato a definir no plano, lendo como o `index.html` encerra a hero hoje.
2. **Seção pinada, escura** — o scroll (scrub) conduz a luminária deslizando da direita para a posição, apagada, com a seção toda preta.
3. **Luz liga** — ao cruzar o ponto de encaixe, dispara sozinha (uma vez) a sequência: flicker rápido de lâmpada → facho acende → título da seção e conteúdo revelados.
4. **Title Switcher** (scrub) — os 4 títulos rolam verticalmente na coluna esquerda; o título que entra na posição ativa (dentro do facho) muda de cinza para verde e seu texto aparece à direita, em crossfade. Ao trocar o título ativo, troca o texto.
5. **Saída** (scrub) — títulos e textos saem animados; o facho se abre até ocupar a tela inteira (tela branca); a luminária desliza de volta para fora pela direita. O pin solta e os elementos de "A gente" entram com as animações que já existem.

## Composição e camadas

Nova `<section id="luminaria">` no lugar da seção do acordeon, altura de viewport, pinada. Camadas de trás para frente:

| # | Camada | Descrição |
|---|--------|-----------|
| 1 | Fundo escuro | Seção inteira preta, no mesmo tom do escurecimento do fim do vídeo do café, para continuidade visual. Tom exato: a confirmar no código na fase de plano. |
| 2 | Título da seção | "O que podemos fazer por você, hoje?" no topo esquerdo, branco com destaque verde, fora do facho (visível sobre o preto, como no mockup). Entra animado junto com o acender da luz. |
| 3 | Camada iluminada (facho) | Container cobrindo a seção com `clip-path` no formato do trapézio (shape do `light-mask.svg`), fundo branco. Contém a coluna dos 4 títulos à esquerda (cinza-claro; o ativo em verde) e a coluna de textos à direita (4 blocos empilhados na mesma posição, crossfade). Tudo fora do clip-path é invisível — efeito do "BRANDING" cortado na borda, visto no mockup. |
| 4 | Luminária | `assets/luminaria.png` à direita, acima do facho, dentro de um container `.luminaria-rig` — o **slot substituível** pelo SVG articulado no futuro. Cúpula e origem do clip-path no mesmo sistema de coordenadas (unidades relativas à seção), para não desalinhar em resize. |

- **Flicker:** opacidade da camada 3 piscando.
- **Beat final:** animação dos pontos do `clip-path` até cobrir a viewport (tela branca).

## Máquina de animação

Um ScrollTrigger master na seção (`pin: true`, `scrub`, distância de scroll ~4000px — valor a calibrar visualmente), com fases por progresso:

| Progresso | Fase | Condução |
|---|---|---|
| 0–15% | Luminária desliza da direita, apagada, seção escura | scrub |
| ~15% (ao cruzar) | Flicker → luz liga → título da seção e conteúdo revelados | disparada (timeline própria, toca uma vez; ao reverter abaixo do ponto, apaga com reverse rápido, sem flicker) |
| 15–20% | Respiro morto no scrub (espaço para o flicker tocar) | — |
| 20–85% | Title Switcher: títulos `yPercent`, cor do ativo, crossfade dos textos | scrub |
| 85–100% | Conteúdo sai, clip-path expande até a tela branca, luminária sai pela direita | scrub |

Todos os percentuais são pontos de partida a calibrar visualmente na implementação.

## Conteúdo

Português, reaproveitando integralmente os itens do acordeon atual do `portfolio.html`:

- Título da seção: "O que podemos fazer por você, hoje?" (linha 516 do `portfolio.html`)
- Itens: "1. ui/ux design (web e app)", "2. Graphic Design", "3. Motion Graphics", "4. Branding", cada um com seu texto já escrito no acordeon (o inglês do mockup era placeholder do design antigo)

## Integração com o index.html

- A nova seção assume o lugar do acordeon na experiência desktop, mas o markup do acordeon **permanece no DOM** — ele é a versão mobile da seção (exibição alternada por breakpoint via CSS). Título na linha 516; limites exatos do bloco a determinar no plano.
- O JS novo entra no bloco `<script>` inline existente no fim do arquivo (~linha 1379).
- Atenção à ordem dos pins (o ScrollTrigger do vídeo do café vem antes) e a `ScrollTrigger.refresh()` em resize; posições em unidades relativas.
- Ambiente real: export Webflow (jQuery + webflow.js via CDN) + GSAP — protótipos servem apenas como referência de leitura, nenhum código é transplantado.

## Mobile

Em telas estreitas, a seção exibe o **acordeon atual**, que permanece no DOM (conteúdo idêntico, UX boa de touch, zero risco); a seção da luminária fica oculta e seus triggers desabilitados nesse breakpoint. A luminária é experiência desktop. Breakpoint de corte: a definir no plano, seguindo os breakpoints do CSS do Webflow. Uma versão mobile da luminária pode ser desenhada depois, se fizer falta.

## Casos de borda

- **Reversão de scroll:** o scrub reverte naturalmente; a luz apaga com reverse rápido (sem flicker) quando a luminária desencaixa.
- **Resize:** `ScrollTrigger.refresh()` + unidades relativas garantem o alinhamento cúpula ↔ facho.
- **Reduced-motion/acessibilidade:** fora do escopo da v1 (o site atual não trata).

## Fora do escopo da v1 / evoluções previstas

1. **Entrada com braço articulado:** a luminária vetorizada em SVG com partes nomeadas (base, haste, braço, cúpula) entrando com o braço se desdobrando até a pose, e então a luz acende. Depende de asset SVG que ainda não existe (há apenas o facho em SVG). A arquitetura já prevê a troca: substituir o conteúdo do slot `.luminaria-rig` e a sub-timeline de entrada, sem tocar no resto.
2. Versão mobile da luminária.
3. Tratamento de `prefers-reduced-motion`.

## Notas de implementação

- **Invocar a skill local `gsap`** (`.claude/skills/gsap`) antes de escrever o código de animação — pedido explícito do Pedro.
- Invocar `/frontend-design` antes do código de interface (regra do workspace).
- Decisões pendentes marcadas no texto (tom do preto, gatilho da saída da hero, limites do bloco do acordeon, breakpoint mobile) são resolvidas na fase de plano lendo o código real — nunca preenchidas por suposição.
