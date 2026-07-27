# Saída dos textos da hero com a tela pinada — design

**Data:** 2026-07-27
**Autor:** sessão de brainstorming com Pedro Ribeiro
**Arquivo alvo:** `index.html` (script GSAP inline, linhas ~1453–1814)
**Ponto de retorno:** tag `hero-pin-baseline` → commit `d61a2f0` (já em `origin/main`)

## Problema

Durante a saída dos textos da hero, o conjunto inteiro desliza para cima junto com a
página, transmitindo sensação de rolagem. O desejado: a tela fica **imóvel** enquanto o
scroll dirige a animação de saída dos dois blocos de texto; só depois a página rola para
a seção da luminária entrar.

A animação interna dos textos (cada frase deslizando para dentro do seu wrapper mascarado)
**já está correta** e não deve ser alterada. O defeito é o palco se mover, não os textos.

## Diagnóstico (verificado nesta sessão)

Fluxo atual, com os pontos do código:

| # | Etapa | Linhas | Mecanismo |
|---|---|---|---|
| 0 | Trava inicial | 1457 | `body.overflow = 'hidden'` |
| 1 | Texto digitado + máscara lanterna | 1504–1583 | `typeText` + `radial-gradient` seguindo o mouse |
| 2 | Clique no switch | 1620–1644 | `switchOnTimeline` → `onComplete` |
| 3 | Entrada dos textos | 1479–1495 (`heroTimeline`) | timeline autônoma, disparada |
| 4 | Libera o scroll | 1686–1690 | `onComplete` → `heroScrollTrigger.enable()` |
| 5 | Scrub do vídeo | 1656–1678 (`heroScrollTrigger`) | `trigger:#hero`, `start:"top top"`, `end:"bottom top"`, `pin:true`, `scrub:3` |
| 6 | **Saída dos textos** | 1701–1716 (id `hero-exit`) | `trigger:.lum-section`, `start:"top bottom"`, `end:"top top"`, `scrub:1`, **sem pin** |
| 7 | Luminária | 1736–1808 (`lumMaster`) | `trigger:.lum-section`, `start:"top top"`, `end:"+=4000"`, `pin:true`, `scrub:1` |

**Causa raiz:** a etapa 6 é a única que roda numa faixa de scroll em que nada está pinado.

`#hero` é `position: relative; height: 100vh` (CSS inline do `index.html`, linha 134) e está
no início do fluxo; o pin da etapa 5 acrescenta um espaçador de 100vh; a `.lum-section`
(linha 513) vem logo em seguida — entre as duas há apenas markup comentado e morto
(linhas 454–510). Logo, a `.lum-section` começa por volta de 200vh, e o `hero-exit`
(de `top bottom` até `top top` dela) é scrubado exatamente entre 100vh e 200vh de scroll:
a faixa em que o pin do vídeo já soltou e a página rola de verdade, empurrando o `#hero`
para fora da tela por cima.

O que se vê é a soma da animação correta com uma rolagem que ninguém pediu.

**Observação sobre a tentativa reprovada em 26/07:** naquela rota o pin foi estendido *e* a
animação de saída foi substituída por uma reversão fiel da entrada, herdando também o
`scrub: 3` do vídeo. Hipótese (não confirmada com o Pedro): a troca da animação e o scrub
pesado explicam a reprovação. Este design não repete nenhuma das duas coisas.

## Solução: três triggers, uma responsabilidade cada

Hoje um único ScrollTrigger prende a tela **e** roda o vídeo, ambos sob `scrub: 3`. A
proposta separa as responsabilidades:

| Trigger | Faixa de scroll | Responsabilidade |
|---|---|---|
| `heroPin` | 0 → 160vh (desktop) | Só prende a hero. Sem scrub, sem animação. |
| `heroVideo` | 0 → 100vh | Só o vídeo: `scrub: 3` e o mesmo `onUpdate` de hoje, com o guard `isFinite`. |
| `heroExit` | 100vh → 160vh | Só a saída dos textos: a timeline existente, com scrub próprio. |

A saída deixa de ser ancorada na `.lum-section` e passa a começar exatamente onde o vídeo
termina — o "sequencial limpo" combinado: o vídeo chega ao frame preto, então começa a
saída, com a tela imóvel durante as duas fases.

**Derivação das posições:** `heroVideo` e `heroExit` derivam seus limites do próprio
`heroPin` (início do pin, mais uma altura de viewport) em vez de constantes de layout.
Assim, mudança de altura da janela ou de conteúdo acima reajusta os três juntos. A ordem
de recálculo entre os três triggers no `ScrollTrigger.refresh()` é um detalhe de
implementação a resolver no plano (candidato: `refreshPriority`).

## O que não muda

- `heroTimeline` — a animação de entrada (1479–1495), incluindo o disparo pelo switch.
- Todos os valores da timeline de saída: `.hero-designer` `y:220`, `.hero-title-01` `y:-220`,
  `.hero-title-02` `y:"+=220"`, `.hero-description` `y:-180`, `autoAlpha` de todos, e os
  fades de `#switch-btn` e `.scroll-down-wrapper`.
- O `onUpdate` do vídeo, seu `scrub: 3` e o guard `isFinite(heroVideo.duration)` (que
  corrige o bug crítico de 20/07 — não pode ser perdido no rearranjo).
- `lumMaster` e toda a coreografia da luminária. A `.lum-section` desce 60vh no documento;
  como o `lumMaster` está ancorado nela, acompanha sozinho.
- O trecho de rolagem preta entre o fim do pin e a luminária — a ilusão aprovada de que a
  luminária desliza para dentro da tela em vez de a página rolar.

## Mobile

A timeline de saída vive dentro de `mm.add("(min-width: 992px)")` (linha 1696); abaixo
disso ela não existe e a seção da luminária é substituída pelo acordeon `#service`
(decisão da spec de 19/07). O pin do vídeo, ao contrário, está fora do `matchMedia` e vale
em qualquer largura.

Portanto o pin estendido é **condicional**: 160vh apenas em `≥992px`; abaixo disso o pin
continua com 100vh, exatamente como hoje. A mudança deve ser neutra no mobile — e isso
será verificado, não presumido.

## Parâmetros calibráveis (não estruturais)

| Parâmetro | Valor inicial | Observação |
|---|---|---|
| Scroll da fase de saída | 60vh | Define quanto scroll o usuário gasta para completar a saída |
| Scrub da saída | 1 | Igual ao da timeline atual; bem mais leve que o `3` do vídeo |

## Critérios de verificação

1. Durante toda a saída dos textos, nenhum elemento da hero se desloca verticalmente por
   causa da rolagem — o único movimento é o das frases dentro dos seus wrappers.
2. As quatro frases desaparecem por completo dentro das máscaras antes de o pin soltar.
3. O vídeo continua terminando no frame preto no mesmo ponto de scroll de hoje, com o
   mesmo ritmo.
4. A luminária entra exatamente como antes.
5. Scroll reverso (para cima) refaz a sequência sem travar nem deixar elemento preso.
6. Abaixo de 992px o comportamento é idêntico ao de `hero-pin-baseline`.

## Fora de escopo (backlog acordado)

1. **Sobreposição no bloco da direita:** a descrição sobe e invade a área do título
   "DESIGNPLINARY" em vez de já estar cortada. Hipótese calculada a partir do CSS inline —
   `.hero-title-02-wrapper` (`bottom: 20vh`, `height: 215px`) e `.hero-description-wrapper`
   (`top: 74%`) dividem cerca de 54px da mesma faixa vertical numa viewport de 900px. Não
   verificado visualmente. Tende a ficar mais aparente depois deste ajuste, porque a tela
   parada dá tempo de ver a saída.
2. **Suavidade do scrub do vídeo:** o Pedro considera o movimento atual insatisfatório.
   Isolado no `heroVideo` por este design, o que torna o ajuste futuro de baixo risco.
3. **Responsividade geral (mobile/tablet):** posicionamento da hero desencaixado abaixo de
   992px. Frente própria, depois de o desktop estar aprovado.
