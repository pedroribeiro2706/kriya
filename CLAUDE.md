# Kriya Design — Portfólio

Site one-page de portfólio (Pedro Ribeiro / Kriya Design) com animações GSAP. Projeto iniciado ~março/2025, retomado em julho/2026.

**Antes de qualquer trabalho, leia `HANDOFF.md`** — contém o contexto completo da retomada do projeto e os próximos passos combinados. Fatos-chave resumidos em `MEMORY.md`.

## Como rodar
- `npm run dev` → abre em http://localhost:5173/
- **Estação de testes**: http://localhost:5173/versoes.html (índice de todas as versões do site)
- **Página principal**: http://localhost:5173/portfolio.html

## Arquivos-chave
- `portfolio.html` — a página PRINCIPAL do site (não é o index.html!). Export do Webflow + toda a lógica GSAP num `<script>` inline no final do arquivo (~linha 1379)
- `index.html`, `test-video-02.html`, `v-*.html`, `back-ups/` — protótipos e tentativas da **seção da luminária** (feature em desenvolvimento). **NÃO APAGAR** — a limpeza foi deliberadamente suspensa
- `versoes.html` — estação de testes que lista e explica todas as versões
- `js/ScrollSmoother.min.js` e `js/SplitText.min.js` — plugins GSAP locais (gratuitos desde o GSAP 3.13)

## Regras do projeto
- Responder sempre em português
- Commits atômicos com mensagens em português; push para `origin main` (https://github.com/pedroribeiro2706/kriya)
- Os assets pesados de design (`Photoshop/`, `Videos/`, ~10 GB) NÃO estão no git — ficam em `G:\OneDrive\Documents\01 - Design\01 - Portfólio\Kriya Design\Portfolio` (arquivo morto; não editar código lá)
- GSAP é o framework de animação do projeto (ScrollTrigger para scroll; ScrollSmoother/SplitText disponíveis mas ainda não usados)
