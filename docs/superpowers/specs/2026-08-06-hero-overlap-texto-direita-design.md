# Correção do overlap dos textos da direita na saída da hero — Design

**Data:** 2026-08-06
**Status:** Aprovado pelo Pedro (rota e design) — aguardando revisão do texto do spec
**Item do backlog:** #1 da lista acordada em 27/07 (HANDOFF.md)

## Problema

Durante a saída dos textos da hero (trigger `hero-exit`, scroll dirigindo a animação com a tela pinada), a descrição ("Criamos conteúdo audiovisual…") cruza visualmente com o título DESIGNPLINARY na coluna da direita — os dois aparecem sobrepostos, semitransparentes, um por cima do outro.

**Reproduzido e medido nesta sessão** (janela 1536×742, faixa do `hero-exit` = scroll 742→1187):

| Elemento | Em repouso (pós-entrada) | A 20% da saída |
|---|---|---|
| `.hero-title-02` (caixa do elemento) | y 500→536 | y 544→580, opacity 0.79 |
| `.hero-description` (caixa do elemento) | y 559→634 | y 521→596, opacity 0.79 |
| Máscara `.hero-title-02-wrapper` | y 380→595 | (fixa) |
| Máscara `.hero-description-wrapper` | y 550→632 | (fixa) |

A 20% da saída os dois textos ocupam a mesma faixa (550→580) com ~80% de opacidade cada — é o momento capturado no screenshot de evidência (zoom da coluna direita). Obs.: o glifo pintado do DESIGNPLINARY (fonte league-gothic, 76.8px) excede a caixa de 36px do elemento; a estimativa visual do fundo do glifo em repouso é ~548px (estimativa a partir do zoom, não medida por API).

## Causa raiz

Três fatores combinados:

1. **As máscaras se sobrepõem.** A máscara do título termina em 595px; a da descrição começa em 550px — 45px de faixa vertical compartilhada onde ambos os textos podem estar visíveis. (A altura de 215px da máscara do título é herança da entrada: o texto desce `y: 0→105px` para se posicionar, e a máscara precisou de altura para essa descida ficar visível.)
2. **Movimentos em direções opostas.** Na saída, o título desce (`y: "+=220"`) e a descrição sobe (`y: -180`) — eles atravessam a faixa compartilhada em sentidos contrários, cruzando-se entre ~6% e ~33% do progresso.
3. **Fade linear junto com o movimento.** `autoAlpha` cai linearmente com o progresso (ease: "none"), então no pico do cruzamento ambos ainda têm ~0.8 de opacidade.

## Rotas consideradas

- **A. Cortes limpos nas máscaras (ESCOLHIDA)** — alinhar as fronteiras das máscaras numa mesma linha; cada texto é cortado na própria zona. Preserva coreografia e layout.
- B. Defasar os tempos (descrição sai primeiro, título depois) — muda o ritmo aprovado da saída.
- C. Inverter a direção da descrição (descer em vez de subir) — muda a coreografia aprovada.

Pedro escolheu a rota A em 06/08/2026.

## Mudança

Apenas no CSS inline do `index.html`, seletor `.hero-title-02-wrapper`:

```css
/* antes */          /* depois */
bottom: 20vh;        bottom: 26vh;
height: 215px;       height: calc(215px - 6vh);
```

**Nenhuma mudança no JS.** Os seis `.to()` da timeline `hero-exit` ficam intactos, assim como a arquitetura de três triggers aprovada em 27/07.

### Por que o layout parado não muda

O wrapper é ancorado pelo fundo (`bottom`) dentro da hero de 100vh. O topo dele é `100vh − bottom − height`:

- Antes: `100vh − 20vh − 215px` = `80vh − 215px`
- Depois: `100vh − 26vh − (215px − 6vh)` = `80vh − 215px` (idêntico)

Como o texto é alinhado ao topo do wrapper (`align-items: flex-start`), ele não se move. Só a borda **inferior** da máscara sobe: de `80vh` (topo + 215px) para a linha de `74vh` (topo + 215px − 6vh) — que, com a hero em 100vh, coincide com o `top: 74%` da máscara da descrição. **Fronteiras coincidentes ⇒ faixa compartilhada zero, em qualquer altura de janela.**

## Riscos e calibração

- **Folga apertada em repouso.** Na janela de 742px, o fundo visual estimado do glifo (~548px) fica ~1px acima da nova fronteira (549px). Acima de ~770px de altura interna, a matemática das unidades mistas (glifo ancorado em vh+px, fronteira em %) indica que a fronteira pode raspar os últimos pixels do glifo em repouso. **Calibração visual obrigatória** em 2–3 alturas de janela; ajuste fino aceitável: descer a fronteira para 75% (aceitando 1–2px de faixa compartilhada, invisível na prática). A descida da entrada (`y: 0→105px`) também precisa ser conferida contra a máscara nova.
- **Pré-existente, fora de escopo:** em janelas internas ≥ ~917px de altura, os próprios textos *parados* se aproximam até colidir (title bottom cresce com 0.8·vh, desc top com 0.74·vh). Isso independe desta correção e fica para o item 4 do backlog (responsividade).

## Verificação (antes do UAT do Pedro)

1. Pilotagem no navegador (mesmo protocolo desta sessão: forçar entrada com `progress(1)`, scroll programático + `ScrollTrigger.update()` + matar o tween do scrub + `gsap.ticker.tick()`).
2. Screenshots e medição de rects em repouso e a 10/20/30% da saída — critérios: nenhum cruzamento visível; glifo íntegro em repouso; descida da entrada não cortada.
3. Repetir em pelo menos duas alturas de janela.
4. UAT do Pedro na tela real (aba em foco, sem automação) — critério final.

## Fora de escopo

- Item 2 do backlog (transition CSS da seta de scroll) — será pareado com esta correção **num mesmo ciclo de UAT**, mas é mudança separada com spec/decisão próprias.
- Responsividade <992px e colisão do layout parado em janelas muito altas (item 4 do backlog).
