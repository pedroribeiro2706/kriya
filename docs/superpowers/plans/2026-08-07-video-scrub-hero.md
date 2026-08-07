# Plano — Suavidade do scrub do vídeo da hero

**Spec:** `docs/superpowers/specs/2026-08-07-video-scrub-hero-design.md`
**Baseline seguro:** `main` = `1451d5d` (working tree limpo, só `.claude/` untracked)
**Branch de trabalho:** `ajuste-scrub-video-hero`

---

## Contexto

O vídeo da hero está travado — salta entre poucos frames em vez de se ler como movimento. A investigação de 07/08 achou três causas somadas, todas verificadas: (1) o `scrub: 3` do trigger `hero-video` é inerte, porque o GSAP só cria o `scrubTween` em trigger com `animation` anexada; (2) o `coffee-03.mp4` tem GOP de 30 frames a 1080p, o que torna cada seek caro; (3) 630 frames estão mapeados em uma viewport, dando 1,23 px de scroll por frame — cerca de 8× abaixo do piso praticável.

O plano ataca as três, na ordem que produz evidência mais cedo. O vídeo autoral (Higgsfield) vem na Fase 4, encomendado com parâmetros já provados em vez de chutados.

---

## Fase 0 — Preparação

**Tarefa 0.1 — Branch de trabalho**
```
git checkout -b ajuste-scrub-video-hero
```

**Tarefa 0.2 — Instalar ffmpeg**
Não está no PATH desta máquina (verificado). Instalar via winget:
```
winget install Gyan.FFmpeg
```
Requer confirmação do Pedro (instala software na máquina). Verificar com `ffmpeg -version` numa sessão nova de terminal — o winget não atualiza o PATH da sessão corrente.

**Verificação:** `git branch --show-current` retorna `ajuste-scrub-video-hero`; `ffmpeg -version` responde.

---

## Fase 1 — Corrigir o JS (independente do arquivo de vídeo)

Esta fase vale por si: mesmo com o `coffee-03.mp4` atual, o lerp e o throttle de seek já devem produzir diferença perceptível. É o teste barato da Causa 1.

**Tarefa 1.1 — Constante `HERO_VIDEO_VH`**
`index.html`, no bloco de constantes (linhas 1654–1672), ao lado de `HERO_EXIT_VH`:
```js
// Quanto scroll o vídeo consome, em alturas de viewport.
// Calibrável: aumentar dá mais pixels por frame (movimento mais legível).
const HERO_VIDEO_VH = 1.5;
```

**Tarefa 1.2 — Reescrever o trigger `hero-video`** (linhas 1688–1713)
Substituir pelo bloco da seção 4.1 do spec: trigger vira leitor de posição (`onUpdate` só grava `alvoProgresso`), `scrub: 3` removido com comentário explicando por quê, e o `gsap.ticker.add()` assume a escrita do `currentTime` com lerp + guardas de `readyState` e passo de frame.

Remover também o `console.log("✅ Scroll liberado!")` — resíduo de 2025 que nunca fez nada além de poluir o console a cada update.

**Tarefa 1.3 — Reancorar `hero-pin` e `hero-exit`**
- `hero-pin` (linha ~1682): `end: () => "+=" + (vh() * (HERO_VIDEO_VH + (heroExitAtiva() ? HERO_EXIT_VH : 0)))`
- `hero-exit` (linhas ~1739–1741): `start: () => HERO_TOP + vh() * HERO_VIDEO_VH` e `end: () => HERO_TOP + vh() * (HERO_VIDEO_VH + HERO_EXIT_VH)`

**Os seis `.to()` do `hero-exit` não mudam.** Só a janela de scroll se desloca.

**Tarefa 1.4 — Atributos da tag de vídeo** (linha 446)
```html
<video class="hero-video" src="assets/coffee-03.mp4" playsinline muted preload="auto"></video>
```

**Verificação da Fase 1** (browser, janela ≥992px):
1. `ScrollTrigger.getById("hero-video")` → `start` = 0, `end` ≈ `1.5 × innerHeight`
2. `ScrollTrigger.getById("hero-exit")` → `start` ≈ `1.5 × innerHeight`, `end` ≈ `2.1 × innerHeight`; as faixas encostam sem sobrepor
3. `ScrollTrigger.getById("hero-pin")` → `end` ≈ `2.1 × innerHeight`
4. `#hero` permanece em `top: 0` durante toda a saída dos textos (regressão de 27/07 — deslocamento tem que continuar 0px)
5. Os seis alvos do `hero-exit` chegam a opacidade 0 antes de o pin soltar
6. Máscaras dos textos da direita seguem disjuntas em 10/20/30% da saída (regressão de 06/08)
7. Scroll reverso restaura tudo; ida e volta rápida atravessando a emenda vídeo→saída não deixa elemento preso

> **Protocolo de pilotagem** (aprendido em 06/08 — refresh no meio da faixa corrompe estados):
> `scrollTo(0,0)` → `heroTl.progress(1)` → `tick` → `ScrollTrigger.refresh(true)` → 2 ticks → só então scrollar.
> A medição de **suavização temporal** não pode ser feita com ticker manual — exige aba em foco real, com a página rodando livre.

**Commit:** `Separa a leitura de scroll da escrita no vídeo; lerp no ticker e faixa de 1,5vh`

---

## Fase 2 — Re-encode e medição

**Tarefa 2.1 — Gerar as variantes**
Saída no scratchpad (não versionar tentativas). Fonte: `assets/coffee-03.mp4`.

```bash
# A — 720p @12fps, GOP 1 (todos os frames são keyframe)
ffmpeg -i assets/coffee-03.mp4 -an -vf "scale=1280:720,fps=12" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=1:min-keyint=1:scenecut=0 -crf 23 \
  -movflags +faststart A-720p12-gop1.mp4

# B — 720p @12fps, GOP 5
ffmpeg -i assets/coffee-03.mp4 -an -vf "scale=1280:720,fps=12" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=5:min-keyint=5:scenecut=0 -crf 23 \
  -movflags +faststart B-720p12-gop5.mp4

# C — 720p @7fps, GOP 1 (alvo exato de ~8px/frame)
ffmpeg -i assets/coffee-03.mp4 -an -vf "scale=1280:720,fps=7" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=1:min-keyint=1:scenecut=0 -crf 23 \
  -movflags +faststart C-720p7-gop1.mp4

# D — 1080p @12fps, GOP 5
ffmpeg -i assets/coffee-03.mp4 -an -vf "fps=12" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=5:min-keyint=5:scenecut=0 -crf 23 \
  -movflags +faststart D-1080p12-gop5.mp4
```

`-an` remove o áudio (nunca é usado — o vídeo é `muted` e nunca dá `play()`).

**Tarefa 2.2 — Confirmar o encode**
Rodar o parser MP4 da sessão (`scratchpad/mp4probe.js`) em cada variante e conferir que `keyframes == frames` (GOP 1) ou `gopMedioFrames ≈ 5`, e registrar tamanho de arquivo. Encoder não é confiável na palavra — a confirmação vem do `stss`.

**Tarefa 2.3 — Bancada de comparação**
Criar `teste-scrub.html` na raiz (segue a cultura de `versoes.html`): mesma geometria de scroll da hero, seletor para trocar entre as variantes ao vivo, e um HUD mostrando progresso alvo × progresso suave × `currentTime` × tamanho do arquivo. Sem isso a comparação vira impressão, não medição.

**Tarefa 2.4 — Escolher a variante**
Critério de decisão, nesta ordem: (1) suavidade percebida na aba real; (2) peso do arquivo; (3) qualidade de imagem a 1920px de largura de tela.

Só depois da escolha, decidir sobre `webm` como `<source>` adicional — a ordem correta dos `<source>` depende de qual formato cada browser prefere na prática, e isso se mede, não se chuta.

**Verificação:** tabela preenchida com variante × tamanho × GOP confirmado × frames × veredito visual. Nenhuma linha com "[PREENCHER]".

**Commit:** `Adiciona bancada de comparação de variantes de encode do vídeo da hero`
**Commit:** `Troca o vídeo da hero pela variante <X> (GOP <n>, <res>@<fps>)`

---

## Fase 3 — Calibração e UAT

**Tarefa 3.1 — Calibrar**
Dois parâmetros, ajustados na aba real do Pedro:
- `LERP` (0,12 é o ponto de partida para "inércia leve") — menor = mais peso
- `HERO_VIDEO_VH` (1,5) — maior = mais px por frame
- `VIDEO_FPS` tem que casar com o fps do arquivo escolhido na Fase 2

**Tarefa 3.2 — UAT do Pedro**
Teste na aba real, não automatizada. Cobrir: entrada completa da hero, o scrub inteiro do vídeo, a emenda vídeo→saída dos textos, a saída completa, e o scroll reverso.

**Bloqueio:** só seguir para a Fase 4 com aprovação explícita. O vídeo autoral só se encomenda depois que o formato estiver provado.

**Commit:** `Calibra LERP e faixa do vídeo após UAT`

---

## Fase 4 — Vídeo autoral (Higgsfield)

Só começa depois do UAT da Fase 3. O produto da Fase 3 é o **spec de encomenda** com números provados.

**Tarefa 4.1 — Escrever o spec de encomenda**
Preencher com os valores medidos:
- Frames totais alvo: `[PREENCHER: definido na Fase 2]`
- Resolução de master: pelo menos 1920×1080 (para poder reduzir sem perder)
- Duração de conteúdo: `[PREENCHER: definido na Fase 3]`
- Requisito de movimento: contínuo e lento, sem cortes secos — o scrub expõe corte como salto
- Sem áudio

**Tarefa 4.2 — Conceito**
Brainstorm com o Pedro sobre o conceito visual antes de gerar. O café atual é o ponto de partida a superar, não a referência a copiar. `[PREENCHER: conceito a definir com o Pedro]`

**Tarefa 4.3 — Gerar e encodar**
Gerar no Higgsfield, passar pelo mesmo pipeline de encode da Fase 2, medir na mesma bancada, UAT.

**Nota:** ainda não verifiquei quais durações, resoluções e formatos de saída o Higgsfield entrega. Isso é o primeiro passo da Fase 4, não uma suposição deste plano.

---

## Fora de escopo (permanecem no backlog)

- **Responsividade mobile/tablet** — item 2 do backlog, frente própria. Herda desta sessão a informação de que o scrub nativo no Android é comprovadamente ruim mesmo com GOP baixo, e que o plano B (canvas) fica em aberto.
- **Colisão dos textos da direita em repouso** em janelas ≥ ~917px de altura — pré-existente, documentada no spec de 06/08.
- **ScrollSmoother** — carregado e registrado (`index.html:1448`, `:1453`) mas nunca instanciado. Ativá-lo afetaria o scroll da página inteira; decisão separada.

---

## Rollback

Qualquer fase pode ser abandonada com `git checkout main`. A branch `ajuste-scrub-video-hero` parte de `1451d5d`, que é o que está em produção e aprovado no UAT de 06/08. `assets/coffee-03.mp4` permanece versionado — se a variante nova for pior, basta reverter a tag.
