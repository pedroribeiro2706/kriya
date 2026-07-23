# MEMORY — Kriya Portfólio

Fatos-chave do projeto (detalhes e narrativa completa em `HANDOFF.md`):

- Local canônico do código: `G:\Pedro\Dev\Kriya` | GitHub: https://github.com/pedroribeiro2706/kriya (público, conta pedroribeiro2706)
- Rodar: `npm run dev` → http://localhost:5173/versoes.html (estação de testes) ou /index.html (cópia de trabalho)
- `portfolio.html` = página principal publicada (export Webflow + GSAP inline no fim, ~linha 1379); desde 20/07 `index.html` é a CÓPIA DE TRABALHO dele com a seção da luminária (o protótipo antigo virou `index-old-02.html`)
- Feature em andamento: seção da luminária (`index.html` + `css/luminaria.css`) — implementada e aprovada em UAT (entrada, pisca, facho, títulos); falta a animação de SAÍDA, que aguarda a luminária SVG articulada (ver HANDOFF.md, atualização 23/07). NÃO apagar arquivos de teste antigos
- Guias visuais em `references/`: `animacao-luminaria-ideal-01..05.png` = sequência-alvo da saída (montada pelo Pedro no Photoshop); `secao-luminaria-pos-fix-*.png` = registros de UAT
- Pasta antiga no OneDrive (`...\Kriya Design\Portfolio`) = arquivo morto de assets pesados (Photoshop/ e Videos/, ~10 GB, fora do git); sem .git; não editar código lá
- test-video-02-bkp-02.html ≡ test-video-02.html (idênticos); a variação está nos JS
- GSAP 3.13+ tornou ScrollSmoother/SplitText gratuitos; melhoria futura é migrar para gsap via npm
- Limpeza adiada (lista completa no HANDOFF.md, seção "Próximos passos")

## Log de sessões

- **2026-07-19** — Retomada: diagnóstico do projeto, git init + push inicial (`c2bd7d6`), clone para fora do OneDrive, estação de testes de versões (`c4def0a`), handoff criado. Pedro testou todas as versões na estação — conclusões ainda não comunicadas; pedir na próxima sessão.
- **2026-07-20** — Pedro comunicou as conclusões (`revisao.md`); setup do `index.html` como cópia de trabalho do `portfolio.html` (`index.html` antigo virou `index-old-02.html`). Brainstorming da seção da luminária → spec aprovada → plano de 7 tasks → implementação via subagentes (commits `ea7bc3d`..`3c7a913`). UAT do Pedro achou 2 bugs (switch invisível + menu quebrado), causa-raiz investigada e corrigida (`262287f`) — Pedro confirmou os 2 fixes funcionando ao vivo. UAT achou 1 bug novo (título da seção coberto pelo menu fixo) — não corrigido ainda. Sessão encerrando para reiniciar o Claude Code (troca Sonnet 5 → Fable 5, plano Max). Extensão do Chrome confirmada conectada. Detalhes completos no `HANDOFF.md`.
- **2026-07-20 (tarde/noite)** — Título coberto pelo menu corrigido (`5ee3611`, `top: 160px` fixo). Descoberto e corrigido bug crítico: vídeo da hero sem metadata no `window.load` lançava exceção não capturada que impedia a criação de TODOS os ScrollTriggers da luminária (`a319386`, guard `isFinite`). Lição registrada no handoff: aba controlada pela extensão do Chrome fica `hidden` e o Chrome throttla rAF — usar `gsap.ticker.tick()` / `.progress()` direto para verificar.
- **2026-07-21** — Recalibração do facho (`--lum-clip-on` medido da boca da cúpula) e do `.lum-rig` (âncora no rodapé, 82.2vh). Ficou no working tree, sem commit, até 23/07.
- **2026-07-23** — UAT aprovou a calibração de 21/07 (commitada como `8b54bed`) + entrada e pisca. Bug da SAÍDA analisado frame a frame (facho desconecta da cúpula): causa = interpolação vértice a vértice do clip-path com mapeamento invertido + janelas dessincronizadas. Fix intermediário `7772c6d` (clip-full reordenado, beam+rig na mesma janela 87–99) — melhorou, mas desconexões residuais são estruturais. **Decisão: luminária SVG articulada com o facho como path dentro do grupo da cúpula; saída em 2 fases (cúpula gira → rig desliza), guia em `references/animacao-luminaria-ideal-01..05.png`. Pedro está produzindo o SVG (spec no HANDOFF.md) — próxima sessão começa integrando o arquivo quando ele chegar.** Extensão do Chrome desconectada a sessão toda; verificação visual foi do Pedro via screenshots.
