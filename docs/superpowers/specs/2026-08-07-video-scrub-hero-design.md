# Spec — Suavidade do scrub do vídeo da hero

**Data:** 2026-08-07
**Item do backlog:** 1 (era item 3 na ordenação de 27/07)
**Status:** design aprovado nas 4 decisões de escopo; implementação pendente

---

## 1. O sintoma

Relato do Pedro: *"ele está muito travado. O vídeo está pulando do primeiro frame direto para o último frame ou algo parecido."*

O vídeo da hero (`assets/coffee-03.mp4`) é controlado pelo scroll através do ScrollTrigger `hero-video`. Em vez de se ler como movimento contínuo, ele salta entre poucos frames esparsos.

---

## 2. Causa raiz — três problemas somados

A investigação encontrou **três causas independentes**, cada uma suficiente para degradar o resultado sozinha. Todas foram verificadas nesta sessão; nenhuma é hipótese.

### Causa 1 — `scrub: 3` é inerte neste trigger (VERIFICADO no fonte)

Fonte não-minificado do ScrollTrigger 3.12.7 (`https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.js`), lido nesta sessão:

- **linhas 1714–1722** — `self.scrubDuration(scrub)` está **dentro do bloco `if (animation)`**:
  ```js
  if (animation) {
    animation.vars.lazy = false;
    ...
    self.animation = animation.pause();
    animation.scrollTrigger = self;
    self.scrubDuration(scrub);   // <-- só executa quando existe `animation`
    ...
  }
  ```
- **linhas 1694–1711** — `scrubDuration` é o único lugar do arquivo que cria o `scrubTween` (a tween de catch-up, `ease: "expo"`, duração = valor do scrub).
- **linha 2284** — em `update()`: `self.progress = clipped`, onde `clipped` deriva direto da posição de scroll.
- **linha 2343** — `onUpdate && !isToggle && !reset && onUpdate(self);`

O trigger `hero-video` (`index.html:1690`) é um `ScrollTrigger.create()` **sem `animation` anexada**. Logo `scrubTween` nunca é criado, e o `self.progress` entregue ao `onUpdate` é o progresso **cru** do scroll.

> **Conclusão:** `scrub: 3` nunca suavizou nada. A suspeita registrada em 27/07 está confirmada.

Isso vale retroativamente para **todas as 11 variantes desde março/2025** — `scrub: 9` em `back-ups/test-video.html` e `js/main.js`, `scrub: 3` em `portfolio.html`, `test-video-02.js`, `test-video-03.js` e `testing.js`. As variantes por `wheel` nativo (`main-bkp-01/02/03.js`) também não tinham suavização: `currentTime += deltaY * 0.005` ou `* 0.009`, atribuição direta.

### Causa 2 — o arquivo de vídeo é hostil a seek (VERIFICADO por parser MP4)

`ffmpeg`/`ffprobe` não estão instalados nesta máquina. Os dados abaixo vieram de um parser dos átomos MP4 escrito nesta sessão (`stsz` para contagem de samples, `stss` para sync samples, `tkhd` para dimensões, `mdhd` para timescale):

| Métrica | `assets/coffee-03.mp4` (em uso) |
|---|---|
| Tamanho | 20.947.862 bytes (19,98 MB) |
| Codec / container | H.264 (`avc1`) / mp42, faststart ✔ |
| Resolução | 1920×1080 |
| Duração | 21,000 s |
| Frames | 630 @ 30 fps |
| Bitrate de vídeo | 7,97 Mbps |
| **Keyframes (`stss`)** | **21 — GOP médio de 30 frames, 1 por segundo** |
| Maior gap entre keyframes | 30 frames (1,000 s) |

Para pintar um frame arbitrário, o decoder precisa partir do keyframe anterior e reconstruir **até 29 frames intermediários a 1080p**. A referência prática da comunidade é GOP entre 1 e 10.

Os outros arquivos disponíveis não resolvem: `coffee.mp4` (3,69 MB) tem GOP 24,9; `coffee-02.mp4` (10,62 MB) tem GOP 30; `teste.mp4` tem GOP 30 e **não é faststart**.

Complementarmente, a tag atual (`index.html:446`) é:
```html
<video class="hero-video" src="assets/coffee-03.mp4" playsinline></video>
```
Sem `preload`, sem `muted`, sem fallback `webm`.

### Causa 3 — a razão pixels-por-frame torna o scrub impossível (CALCULADO)

O trigger mapeia o vídeo inteiro em **uma viewport** (`start: HERO_TOP` → `end: HERO_TOP + vh()`).

Numa janela de 776 px de altura (a usada nas medições de 27/07 e 06/08):

```
630 frames ÷ 776 px = 1,23 px de scroll por frame
```

Um notch de roda do mouse (~100 px) obriga o vídeo a saltar **~81 frames de uma vez**. O vídeo inteiro cabe em **~8 notches**. É literalmente o sintoma relatado.

A faixa saudável para o vídeo se ler como movimento é **5–15 px por frame** — estamos cerca de 8× abaixo do piso.

> **Corolário que define o vídeo novo:** aumentar keyframes não basta. O vídeo precisa de **menos frames totais** e/ou de **mais faixa de scroll**. As duas alavancas são independentes e se somam.

**Observação que orienta o encode:** no scrub, o *fps do arquivo é irrelevante para a fluidez percebida* — quem determina o ritmo é o scroll, não o relógio. O que importa é **frames totais ÷ pixels de scroll**. Reduzir o fps do arquivo só afeta a fidelidade do movimento original (quanto do gesto filmado se perde entre um frame e o seguinte).

---

## 3. Decisões de escopo (Pedro, 07/08)

| Decisão | Escolha |
|---|---|
| Ordem de ataque | **Consertar o vídeo atual primeiro.** Só depois encomendar o vídeo autoral, já com parâmetros provados. |
| Faixa de scroll do vídeo | **1,5 viewport** (~1160 px numa janela de 776 px) |
| Sensação do movimento | **Inércia leve** — o vídeo persegue o scroll com lerp, atraso perceptível de ~0,15 s |
| Plano B se o mobile engasgar | **Decidir depois de medir** — não construir canvas/image-sequence a priori |

---

## 4. Design da solução

### 4.1 Separação de papéis no JS

O trigger deixa de escrever no vídeo e passa a ser **só um leitor de posição**. Quem escreve é um callback no `gsap.ticker`, com interpolação própria.

Motivo: é a única forma de ter suavização temporal real, já que o `scrub` não age em trigger sem `animation`. A alternativa (anexar uma tween `gsap.to(video, {currentTime})` ao trigger para reativar o `scrubTween`) foi descartada — daria a suavização, mas tira de nós o controle sobre o *throttle de seek*, que é o que protege o decoder.

```js
// --- Trigger 2: SÓ o vídeo ---
// O trigger é apenas um LEITOR de posição de scroll: grava o alvo e sai.
// Quem escreve no vídeo é o ticker abaixo, com interpolação própria.
//
// `scrub` foi REMOVIDO de propósito: num ScrollTrigger.create() sem
// `animation` anexada o GSAP nunca cria o scrubTween (fonte do
// ScrollTrigger 3.12.7, linhas 1714-1722), então `scrub: 3` não
// suavizava nada desde março/2025.
let alvoProgresso = 0;
let suaveProgresso = 0;
let ultimoTempoEscrito = -1;

const heroVideoST = ScrollTrigger.create({
    trigger: "#hero",
    start: () => HERO_TOP,
    end: () => HERO_TOP + vh() * HERO_VIDEO_VH,
    invalidateOnRefresh: true,
    id: "hero-video",
    onUpdate: (self) => { alvoProgresso = self.progress; }
});

// Interpolação do playhead. LERP menor = mais inércia.
const LERP = 0.12;
// Passo mínimo entre seeks: a duração de um frame do arquivo. Impede
// pedir ao decoder um seek que cairia no mesmo frame já exibido.
const VIDEO_FPS = 12;                 // [CALIBRAR: fps do arquivo final]
const PASSO_FRAME = 1 / VIDEO_FPS;

gsap.ticker.add(() => {
    if (!isFinite(heroVideo.duration)) return;
    const d = alvoProgresso - suaveProgresso;
    if (Math.abs(d) < 0.0005) {        // já chegou: nada a fazer
        suaveProgresso = alvoProgresso;
        return;
    }
    // lerp independente de framerate (deltaRatio é 1 a 60fps)
    suaveProgresso += d * (1 - Math.pow(1 - LERP, gsap.ticker.deltaRatio()));

    const t = suaveProgresso * heroVideo.duration;
    if (heroVideo.readyState >= 2 && Math.abs(t - ultimoTempoEscrito) >= PASSO_FRAME) {
        ultimoTempoEscrito = t;
        heroVideo.currentTime = t;
    }
});
```

Três guardas, cada uma com um motivo distinto:
- `isFinite(heroVideo.duration)` — preservada da versão atual: o `load` da window não espera metadata do vídeo.
- `readyState >= 2` (`HAVE_CURRENT_DATA`) — **nova**: não pedir seek antes de haver dado decodificado.
- `Math.abs(t - ultimoTempoEscrito) >= PASSO_FRAME` — **nova**: throttle de seek. É a guarda que protege o decoder de pedidos redundantes; sem ela o ticker manda 60 seeks/s.

### 4.2 Nova geometria de scroll

Constante nova, ao lado de `HERO_EXIT_VH`:

```js
// Quanto scroll o vídeo consome, em alturas de viewport.
// Calibrável: aumentar dá mais pixels por frame (movimento mais legível).
const HERO_VIDEO_VH = 1.5;
```

| Trigger | Faixa hoje | Faixa nova |
|---|---|---|
| `hero-video` | `0 → 1vh` | `0 → 1,5vh` |
| `hero-exit` | `1vh → 1,6vh` | `1,5vh → 2,1vh` |
| `hero-pin` | `0 → 1,6vh` (ou `1vh` no mobile) | `0 → 2,1vh` (ou `1,5vh` no mobile) |

Todas as faixas continuam sendo **posições absolutas de scroll** derivadas de `vh()` e `HERO_TOP` — nenhum trigger lê `.start`/`.end` de outro. A decisão de 27/07 de eliminar dependência de ordem de refresh fica intacta.

A luminária desce no documento como consequência, e acompanha sozinha por estar ancorada na `.lum-section` (mesmo comportamento verificado em 27/07 quando o pin foi de 100vh para 160vh).

**Nenhum valor da animação de saída dos textos muda.** Os seis `.to()` do `hero-exit` ficam idênticos — só a janela de scroll em que rodam se desloca. É a mesma disciplina de 27/07 e 06/08: quando o problema é de mecanismo, mexer só no mecanismo.

### 4.3 Tag de vídeo

```html
<video class="hero-video" src="assets/coffee-03.mp4" playsinline muted preload="auto"></video>
```

`muted` e `preload="auto"` entram já na Fase 1 (custo zero, benefício imediato no buffer). A decisão sobre `<source>` múltiplo com `webm` fica para depois da medição — a ordem correta dos `<source>` depende de qual formato cada browser prefere na prática, e chutar isso agora seria inverter evidência e alegação.

### 4.4 Alvo de encode

Alvo derivado das decisões: **1,5 viewport ≈ 1160 px** de faixa, mirando **~8 px por frame** ⇒ **~145 frames**.

Variantes a produzir e medir (fonte: `coffee-03.mp4`, 1920×1080 / 21 s / 30 fps):

| Variante | Resolução | fps | Frames | GOP | O que testa |
|---|---|---|---|---|---|
| A | 1280×720 | 12 | 252 | 1 | GOP 1 puro — teto de suavidade, ver o custo em peso |
| B | 1280×720 | 12 | 252 | 5 | equilíbrio peso × suavidade |
| C | 1280×720 | 7 | 147 | 1 | alvo exato de ~8 px/frame |
| D | 1920×1080 | 12 | 252 | 5 | se 1080p ainda aguenta |

Métricas a coletar por variante: tamanho do arquivo, GOP e contagem de frames confirmados pelo parser, e avaliação visual na bancada de comparação.

---

## 5. Espaço de soluções considerado

| Abordagem | Situação |
|---|---|
| **Lerp no ticker + re-encode + faixa maior** | **Escolhida.** Ataca as três causas, mantém a arquitetura de 3 triggers de 27/07 intacta. |
| Anexar `gsap.to(video, {currentTime})` ao trigger para reativar o `scrubTween` | Descartada. Resolve a Causa 1, mas entrega o controle do seek ao GSAP — perdemos o throttle por frame, que é a guarda que protege o decoder. |
| Sequência de imagens em `<canvas>` | **Plano B, não descartado.** É a técnica mais robusta (funciona no Android, onde o scrub nativo é comprovadamente ruim) e a que a Apple usa. Custo: peso total maior, preload obrigatório, bem mais código. Decisão adiada até haver medição. |
| WebCodecs (`VideoDecoder`) | Fora de escopo. Poder de fogo desproporcional para uma hero, e complexidade alta. |
| Virtual scroll (ScrollSmoother) | Fora de escopo agora. O ScrollSmoother já está carregado e registrado mas **nunca instanciado** — ativá-lo mexeria no scroll da página inteira, não só da hero. |

---

## 6. Fontes consultadas

- Fonte do ScrollTrigger 3.12.7 (leitura direta do código) — prova da Causa 1
- [The secrets for an optimized scroll-based HTML5 video — Yoann Gueny](https://blog.yoanngueny.com/the-secrets-for-an-optimized-scroll-based-html5-video/) — keyframe interval, lerp com threshold de seek, o problema do Android, alternativa em canvas
- [Scrubbing videos using JavaScript — Muffin Man](https://muffinman.io/blog/scrubbing-videos-using-javascript/) — comandos ffmpeg (`-g 10`, `keyint=10:scenecut=0`), comportamento por browser, necessidade de mp4 + webm
- [Scrub through video smoothly — fórum GSAP](https://gsap.com/community/forums/topic/25730-scrub-through-video-smoothly-scrolltrigger/) — resposta do Jack (GreenSock): o problema é de codec e keyframes, não do GSAP
- [Playing with video scrubbing animations on the web — Abhishek Ghosh](https://www.ghosh.dev/posts/playing-with-video-scrubbing-animations-on-the-web/) — degradação por resolução, comportamento em mobile
