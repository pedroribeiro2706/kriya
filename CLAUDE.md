# Kriya Design — Portfólio

Site one-page de portfólio (Pedro Ribeiro / Kriya Design) com animações GSAP. Projeto iniciado ~março/2025, retomado em julho/2026.

**Antes de qualquer trabalho, leia `HANDOFF.md`** — contém o contexto completo da retomada do projeto e os próximos passos combinados. Fatos-chave resumidos em `MEMORY.md`.

## Como rodar
- `npm run dev` → abre em http://localhost:5173/
- **Página principal**: http://localhost:5173/index.html (desde 26/07/2026 o index É a página canônica — ver "Arquivos-chave")
- **Estação de testes**: http://localhost:5173/versoes.html (índice de todas as versões do site)

## Deploy (Vercel)
- Projeto `kriya` na conta Vercel do Pedro (team pedroribeiro2706s-projects), conectado ao repo GitHub
- **Cada push em `main` = deploy automático de produção** (site estático puro, sem build — `vercel.json` força isso; NÃO deixar a Vercel autodetectar "Vite")
- URL de produção: https://kriya-pedroribeiro2706s-projects.vercel.app

## Arquivos-chave
- `index.html` — a página PRINCIPAL e canônica do site (export Webflow + GSAP inline no fim + seção da luminária COMPLETA). Convenção adotada em 26/07/2026: index.html na raiz, como serve a Vercel
- `portfolio.html` — versão ANTIGA da página principal (sem a seção da luminária); mantida como legado, não editar
- `test-video-02.html`, `v-*.html`, `back-ups/` — protótipos e tentativas antigas da seção da luminária. **NÃO APAGAR** — a limpeza foi deliberadamente suspensa
- `versoes.html` — estação de testes que lista e explica todas as versões
- `js/ScrollSmoother.min.js` e `js/SplitText.min.js` — plugins GSAP locais (gratuitos desde o GSAP 3.13)

## Regras do projeto
- Responder sempre em português
- Commits atômicos com mensagens em português; push para `origin main` (https://github.com/pedroribeiro2706/kriya)
- Os assets pesados de design (`Photoshop/`, `Videos/`, ~10 GB) NÃO estão no git — ficam em `G:\OneDrive\Documents\01 - Design\01 - Portfólio\Kriya Design\Portfolio` (arquivo morto; não editar código lá)
- GSAP é o framework de animação do projeto (ScrollTrigger para scroll; ScrollSmoother/SplitText disponíveis mas ainda não usados)
