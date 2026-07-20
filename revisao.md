# Revisão

## http://localhost:5173/index.html
Esta versão não anima. Parece travada. Talvez, não esteja com todas as conexões resolvidas.

## http://localhost:5173/portfolio.html
Esta versão é a mais completa e funcional, mas a segunda seção ‘O que podemos fazer por você, hoje?’ que exibe as áreas de atuação (web/app design, graphic design, motion design e branding) é uma versão mais simples com acordeon. Funciona bem, mas a ideia original e mais sofisticada é fazer uma animação com uma luminária. Há algumas versões que tentam executar esta ideia mas nenhuma delas conseguiu ainda fazer corretamente. Algumas chegam perto, mas precisam de ajustes. Outras tem algo que esta não tem, mas são menos completas. Depois vou descrever o que funciona e o que não funciona em cada uma delas para que possamos encontrar a solução definitiva a partir dos acertos de cada uma. Ela tem ainda outras seções como ‘A gente’, ‘Projetos em destaque’ e ‘Vamos trabalhar juntos’ que estão funcionando bem, mas ainda precisam de ajustes. Estas sessões serão resolvidas depois da sessão ‘O que podemos fazer por você, hoje?’

## http://localhost:5173/test-video-02.html
Tem a animação da hero parecida e funciona bem. Quando fazemos o scroll para a próxima seção ‘O que podemos fazer por você, hoje?’, os textos da hero não animam para sair e a luminária aparece rolando de baixo para cima, já na segunda seção, em uma posição fixa. A ideia é que ao fazer o scroll, os títulos da hero animam saindo e a luminária entra na tela em uma animação onde ela surge pelo lado direito da tela (e não vindo debaixo já dentro da próxima seção). Neste arquivo os títulos (web/app design, graphic design, motion design e branding) já aparecem fixos na posição, sem animação com scroll. Os textos correspondentes a cada título não aparecem ao lado

## http://localhost:5173/v-test-video-02-js-bkp.html
Este é o que tem um dos melhores resultados, ao menos mais próximo do que eu quero para a seção 02 ‘O que podemos fazer por você, hoje?’.
Após a animação da hero concluir (o scroll fica travado enquanto ela está acontecendo) e a animação do café começar e a tela escurecer (os textos da hero deveriam animar para sair, mas permanecem na tela, o que é um erro), a segunda seção aparece direto sem a animação da luminária conforme descrito acima. O título e o texto abaixo do título anima. Os títulos são um “Title Switcher” que faz um scroll dos títulos (Branding, Web Design, Animation, Visual Identity) aparecem posicionados próximos do local correto. Sempre que um destes títulos que são cinza passa por uma determinada região (a partir do scroll), sua cor muda para verde, e mais ao lado (dieito) um texto relativo àquele título é exibido. Quando os títulos se deslocam verticalmente e outro título entra naquela posição, outro texto relativo ao título que mudou de cor é exibido ao lado. Quando o scroll dos títulos termina, está sessão destrava e segue para a próxima que aparece branca e em seguida outra seção que é uma duplicata desta mesma sessão que descrevi (um erro)

## http://localhost:5173/back-ups/teste.html
Este documento mostra como que o “Title Switcher” deve funcionar. No entanto, neste exemplo, o texto referente a cada título fica logo abaixo do título, enquanto no nosso site, os textos aparecem ao lado. É o mesmo mecanismo porém com as posições dos títulos e dos textos diferentes. Mas este arquivo é a referencia do mecanismo que buscamos

## http://localhost:5173/v-index-bkp-03.html
Este arquivo tem a hero, parecida com as outras heros que funcionam bem, porém esta tem a animação de saída do texto da hero correta. É a animação que precede a animação da luminária

## http://localhost:5173/v-test-video-03.html
Lembra a versão no documento http://localhost:5173/v-test-video-02-js-bkp.html porém o “Title Switcher” é mais parecido com o arquivo de referência http://localhost:5173/back-ups/teste.html. Mas não funciona muito bem.

## http://localhost:5173/back-ups/test-video.html
Este é o teste de fazer o video do café avançar e retroceder de acordo com a direção do scroll


## Insight da seção do primeiro agente que revisou o projeto no diretório antigo:

Como a animação funciona (confirmei no código)

Toda a lógica GSAP do portfolio.html está num <script> inline no final do arquivo (linha ~1379). O fluxo é exatamente o que você descreveu: a página carrega com scroll travado e um overlay preto com máscara "lanterna" que segue o mouse, um texto "Que tal um cafézinho?" é digitado com cursor, e ao clicar no switch SVG a timeline de entrada revela os títulos ("PEDRO RIBEIRO", "MULTI DESIGNPLINARY"). Só quando essa timeline termina é que o ScrollTrigger é habilitado: a seção hero fica fixa (pin) e o scroll controla o currentTime do vídeo assets/coffee-03.mp4 (scrub: 3) — é isso que cria o efeito da xícara se aproximando.

Observações sobre o estado do projeto (pendências que notei)

- Sem git — considerando que você agora trabalha com agentes, um git init seria o primeiro passo que eu recomendaria antes de mexer em qualquer coisa.
- ScrollSmoother e SplitText (plugins premium do Club GSAP, presentes em js/) estão carregados/registrados mas ainda não são usados de fato — provavelmente eram parte das "novas features" planejadas.
- O portfolio.html ainda depende de jQuery + webflow.js via CDN (herança do export do Webflow) e tem umas <div class="glasp-extension"> no final que são lixo de uma extensão do navegador que veio junto quando o HTML foi salvo — dá pra limpar.
- Há bastante duplicação para consolidar depois: 7 variações de logo em assets/, vídeos coffee.mp4/coffee-02/coffee-03/teste.mp4, e os arquivos de teste na raiz.
- Detalhe curioso no código: desligar o switch agenda um location.reload() após 10 segundos.

Uma nota: tentei inspecionar visualmente pela extensão do Claude no Chrome, mas ela não está conectada — por isso abri no seu navegador padrão para você mesmo conferir. Se quiser que eu depure visualmente no futuro, é só instalar/conectar a extensão.

Salvei um resumo disso na minha memória do projeto, então nas próximas sessões eu já vou saber que o portfolio.html é o principal e como rodar tudo. Quando quiser, podemos atacar a lista de ajustes — bons candidatos a primeiro passo: git init + limpeza dos arquivos de teste, ou já partir para as novas features que você tinha em mente.

recap: Retomando seu portfólio Kriya: o site já está rodando em http://localhost:5173/portfolio.html, sendo portfolio.html o arquivo principal (roda com npm run dev). Próximo passo: você conferir o site no navegador e decidirmos os ajustes.

Perfeito — plano: verificar tamanhos das pastas pesadas (o GitHub bloqueia arquivos >100 MB), criar um .gitignore adequado, iniciar o git, commitar o estado atual e subir para o seu repositório. Começando pela checagem de tamanhos e da autenticação com o GitHub.

Estado atual salvo e seguro no GitHub ✅

O commit inicial c2bd7d6 com 58 arquivos já está em https://github.com/pedroribeiro2706/kriya na branch main. O que foi decidido na montagem do repositório:

- Entrou: todo o site (HTMLs, CSS, JS), os assets leves (44 MB, incluindo os vídeos do café), a pasta back-ups/ e os dois plugins GSAP que o site usa (ScrollSmoother.min.js e SplitText.min.js — desde o GSAP 3.13 eles são gratuitos, então não há problema de licença em repositório público).
- Ficou fora (via .gitignore): node_modules/, e as pastas Photoshop/ (4,7 GB) e Videos/ (5,1 GB) — elas têm dezenas de arquivos acima do limite de 100 MB do GitHub e continuam seguras no OneDrive, que já é o backup delas. Também deixei fora o gsap-premium.zip e a pasta extraída, que são redundantes.

Uma observação para você saber: repositório git dentro de pasta do OneDrive funciona, mas o OneDrive vai sincronizar a pasta .git a cada commit, o que gera um pouco de ruído de sincronização. Não é um problema agora — se um dia incomodar, dá para marcar .git como "sempre local" ou mover o projeto para fora do OneDrive, já que o GitHub passa a ser o backup do código.

Proposta para a limpeza (próximo passo combinado)

Com tudo versionado, nada mais é perda permanente — qualquer limpeza é reversível. Minha proposta seria fazer numa branch limpeza com PR para você revisar:

1. Apagar da raiz: index-old.html, test-video-02.html, test-video-02-bkp-02.html, teste.js (vazio), testing.js e a pasta back-ups/ (o git agora é o histórico).
2. Consolidar assets: manter só o coffee-03.mp4 (o que o portfolio usa), remover coffee.mp4, teste.mp4, predibase_c1_01_master.mp4 (160 bytes, corrompido) e as ~5 variações antigas de logo.
3. A grande decisão que é sua: promover o portfolio.html a index.html (ele vira a página oficial que abre por padrão), aposentando o protótipo atual do hero. O coffee-02.mp4 só é usado pelo protótipo — sairia junto.

Quer que eu execute essa limpeza agora na branch com PR, ou prefere revisar/ajustar a lista antes? E confirma a promoção do portfolio.html a index.html?

Tudo pronto — projeto migrado e estação de testes no ar 🚀

A estação de testes de versões já está aberta no seu navegador: http://localhost:5173/versoes.html. É uma página-índice com cartões para todas as 10 versões do site, marcando com uma etiqueta amarela as que contêm tentativas da seção da luminária.

O que foi feito nesta rodada:

Migração — O projeto agora vive em G:\Pedro\Dev\Kriya, clonado direto do GitHub (mesmo repositório — como expliquei, não havia motivo para criar outro). O .git foi removido da pasta do OneDrive, que vira arquivo morto dos assets pesados (Photoshop e Videos continuam lá, seguros e sincronizados). Daqui pra frente, todo o trabalho de código é em G:\Pedro\Dev\Kriya.

O mistério dos back-ups resolvido — Você não conseguia testá-los porque esses HTMLs foram escritos para rodar na raiz do projeto: eles procuram css/... e js/..., mas ao serem movidos para back-ups/ os arquivos ficaram soltos na pasta e os caminhos quebraram. Criei cópias com prefixo v- na raiz com os CSS/JS posicionados corretamente — agora todas rodam.

Duas descobertas no caminho: o test-video-02-bkp-02.html é uma cópia byte a byte idêntica do test-video-02.html — a diferença real entre as tentativas está no JavaScript. E o js/test-video-02-bkp-02.js (15,5 KB, maior que a versão atual) não era usado por página nenhuma — criei a v-test-video-02-js-bkp.html para você poder testar essa variante órfã, que pode ser justamente uma tentativa mais avançada da luminária.

Limpeza suspensa — Como você explicou, os arquivos de teste são o histórico das tentativas da luminária, então nada foi apagado. A limpeza de verdade fica para depois que você identificar a versão vencedora.

Tudo commitado e no GitHub (c4def0a). Seu próximo passo: navegar pelas versões na estação de testes e me dizer duas coisas — qual versão está mais próxima do que você quer e como a seção da luminária deve funcionar (o comportamento que você imaginou: o que a luz revela, como ela se move, o que dispara a animação). Com isso a gente parte para o desenvolvimento.

Retomando seu portfólio Kriya: o projeto foi migrado para G:\Pedro\Dev\Kriya, versionado no GitHub, e a estação de testes está aberta em localhost:5173/versoes.html. Falta você testar as versões e me dizer qual é a mais próxima da seção da luminária que quer desenvolver.
