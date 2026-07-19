    // ############################## SCROLL TRIGGER DO VIDEO DO CAFÉ #################################

    // 🔥 Garante que o vídeo começa pausado no primeiro frame
    heroVideo.pause();
    heroVideo.currentTime = 0;

    // Cria a instância ScrollTrigger para rodar o video com o scroll
    const heroScrollTrigger = ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 3,
        pin: true, // 🔥 Mantém a seção fixa enquanto o vídeo é controlado pelo scroll
        onUpdate: (self) => {
            let progress = self.progress; // varia de 0 a 1
            // Atualiza o currentTime do vídeo conforme o progresso
            let newTime = heroVideo.duration * progress;
            heroVideo.currentTime = newTime;
            // console.log("🎥 currentTime atualizado:", newTime.toFixed(2));

            // 🔥 Quando o vídeo atingir 95% do progresso, libera a rolagem
            if (progress >= 0.95) {
                console.log("✅ Scroll liberado!");
            }
        }
    });

    // Desative o gatilho de rolagem até que a timeline da animação inicial da Hero section termine.
    heroScrollTrigger.disable();

    // Adiciona um onComplete callback a timeline da animação inicial da Hero Section 
    // para habilitar o scroll da página.

    heroTimeline.eventCallback("onComplete", () => {
        heroScrollTrigger.enable();
        document.body.style.overflow = ''; // or 'auto'
    });





// ############################## SCROLL TRIGGER DO TIMELINE DA SAÍDA DOS ELEMENTOS #################################


heroVideo.pause();

const heroTitle01ScrollTimeline = gsap.timeline({

  scrollTrigger: {
    trigger: "#hero",      // ou outro elemento que sirva como gatilho
    start: "top top",      // quando o topo da seção atingir o topo da viewport
    end: "+=1000",          // distância de scroll para a animação (ajuste conforme necessário)
    scrub: true,           // sincroniza a animação com o scroll
    pin: true,             // se necessário, fixa a seção durante a animação
    markers: true          // para debug; remova quando estiver satisfeito
  }


});

heroTitle01ScrollTimeline.to(heroTitle01, { 
  y: -150,                // desloca o elemento para cima
  ease: "power2.inOut" 
});

heroTitle01ScrollTimeline.scrollTrigger.disable();

heroTimeline.eventCallback("onComplete", () => { 
    console.log("HeroTimeline concluída, liberando scroll...");
    heroTitle01ScrollTimeline.scrollTrigger.enable();
    document.body.style.overflow = ''; // or 'auto'
    console.log("Overflow:", document.body.style.overflow); 
});