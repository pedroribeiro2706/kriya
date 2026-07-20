# MEMORY — Kriya Portfólio

Fatos-chave do projeto (detalhes e narrativa completa em `HANDOFF.md`):

- Local canônico do código: `G:\Pedro\Dev\Kriya` | GitHub: https://github.com/pedroribeiro2706/kriya (público, conta pedroribeiro2706)
- Rodar: `npm run dev` → http://localhost:5173/versoes.html (estação de testes) ou /portfolio.html
- `portfolio.html` = página principal (export Webflow + GSAP inline no fim, ~linha 1379); index.html é protótipo antigo
- Feature em andamento: seção da luminária vetorizada — tentativas em index.html, test-video-02.html e js/test-video-02-bkp-02.js (órfão). NÃO apagar arquivos de teste
- Pedro ainda vai explicar o comportamento desejado da luminária — perguntar antes de implementar
- Pasta antiga no OneDrive (`...\Kriya Design\Portfolio`) = arquivo morto de assets pesados (Photoshop/ e Videos/, ~10 GB, fora do git); sem .git; não editar código lá
- test-video-02-bkp-02.html ≡ test-video-02.html (idênticos); a variação está nos JS
- GSAP 3.13+ tornou ScrollSmoother/SplitText gratuitos; melhoria futura é migrar para gsap via npm
- Limpeza adiada (lista completa no HANDOFF.md, seção "Próximos passos")

## Log de sessões

- **2026-07-19** — Retomada: diagnóstico do projeto, git init + push inicial (`c2bd7d6`), clone para fora do OneDrive, estação de testes de versões (`c4def0a`), handoff criado. Pedro testou todas as versões na estação — conclusões ainda não comunicadas; pedir na próxima sessão.
- **2026-07-20** — Pedro comunicou as conclusões (`revisao.md`); setup do `index.html` como cópia de trabalho do `portfolio.html` (`index.html` antigo virou `index-old-02.html`). Brainstorming da seção da luminária → spec aprovada → plano de 7 tasks → implementação via subagentes (commits `ea7bc3d`..`3c7a913`, todos em `origin main`). **Pendente: UAT visual** (nenhuma verificação em navegador rodou nesta sessão — extensão desconectada). Detalhes e pontas soltas no `HANDOFF.md`.
