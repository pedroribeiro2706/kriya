gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)

window.addEventListener("load", () => {
    document.body.style.overflow = 'hidden'; // a página não faz rolagem

    // ################################## VARIÁVEIS DA SEÇÃO 01 ######################################

    const heroSection = document.querySelector("#hero");
    const heroVideo = document.querySelector(".hero-video");
    const coffeeText = document.querySelector("#coffee-text");
    const switchBackground = document.querySelector("#elipse");
    const switchCircle = document.querySelector("#ciculo");
    const switchBtn = document.querySelector("#switch-btn");
    const blackOverlay = document.querySelector(".black-overlay");
    const heroDesigner = document.querySelector(".hero-designer");
    const heroTitle01 = document.querySelector(".hero-title-01");
    const heroTitle02 = document.querySelector(".hero-title-02");
    const heroDescription = document.querySelector(".hero-description");
    const scrollDownWrapper = document.querySelector(".scroll-down-wrapper");



    // ################################## TIMELINE DA ANIMAÇÃO DE ENTRADA DA SEÇÃO 01 ######################################


    const heroTimeline = gsap.timeline({ paused: true });

    let isOn = false;

    heroTimeline
        .to(heroVideo, { opacity: 0, duration: 0.5, ease: "power2.out" }) // 🔥 Deixa o vídeo invisível no início
        //.to(switchCircle, { x: 95, duration: 0.3, ease: "power2.inOut" })
        //.to(switchBackground, { fill: "#7ed957", stroke: "none", duration: 0.3, ease: "power2.inOut" }, "<")
        .to(blackOverlay, { opacity: 0, duration: 1, ease: "power2.out" }, "<")
        .to(heroDesigner, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.25")
        .to(heroTitle01, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.25")
        .to(heroTitle02, { x: "160%", duration: 1.2, ease: "power2.out" }, "-=0.25")
        .to(heroVideo, { opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.30") // 🔥 Torna o vídeo visível novamente depois do heroTitle02
        .to(heroTitle02, { y: "135px", duration: 1, ease: "power2.out" }, "-=0.25")
        .to(heroDescription, { y: "0%", opacity: 1, duration: 1, ease: "power2.out" }, "-=0.25")
        .to(switchBtn, { y: 312, duration: 1, ease: "power2.out" }, "-=0.25") // Move o botão para a posição final
        .to(scrollDownWrapper, { opacity: 1, y: -10, duration: 1, ease: "power2.out" }); // Exibe a seta de scroll



    // 🔥 ############# ANIMAÇÕES DO TEXTO "HOW ABOUT A COFFEE?" NO MOMENTO QUE A PÁGINA É CARREGADA ############


    // CRIA O CURSOR E ESCREVE O TEXTO

    if (coffeeText) {
        coffeeText.innerHTML = `<span class="cursor">|</span>`; // 🔥 Cursor visível antes de começar
        setTimeout(() => {
            typeText(coffeeText, "How about a coffee?", 50);
        }, 500); // Pequeno atraso para garantir que tudo carregou
    }

    // 🔥 ANIMAÇÃO DO CURSOR DO TEXTO

    function typeText(element, text, speed, onComplete) {
        let i = 0;
        function typing() {
            if (i <= text.length) {
                element.innerHTML = text.substring(0, i) + `<span class="cursor">|</span>`; // 🔥 Cursor acompanha a digitação
                i++;
                setTimeout(typing, speed);
            } else if (onComplete) {
                onComplete();
            }
        }
        typing();
    }

    // 🔥 APAGA O TEXTO "HOW ABOUT A COFFEE?"

    function eraseText(element, speed, onComplete) {
        let text = element.textContent;
        let i = text.length;
        function erasing() {
            if (i > 0) {
                element.innerHTML = text.substring(0, i - 1) + `<span class="cursor">|</span>`; // 🔥 Cursor acompanha o apagamento
                i--;
                setTimeout(erasing, speed);
            } else {
                element.innerHTML = ""; // 🔥 Remove todo o texto e o cursor
                if (onComplete) {
                    onComplete();
                }
            }
        }
        erasing();
    }



    // ####################################### MÁSCARA SEE-THROUGH ##########################################

    // 🔥 Garante que o overlay começa completamente opaco
    blackOverlay.style.webkitMaskImage = "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)";
    blackOverlay.style.maskImage = "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)";

    setTimeout(() => {
        let revealProgress = { radius: 0, opacity: 0 };

        // 🔥 Animação inicial do raio-x (crescendo no centro da tela)
        gsap.to(revealProgress, {
            radius: 240, // Tamanho final do círculo
            opacity: 1, // Opacidade final do efeito
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
                let x = window.innerWidth / 2; // Inicia do centro
                let y = window.innerHeight / 2;

                blackOverlay.style.webkitMaskImage = `radial-gradient(circle ${revealProgress.radius}px at ${x}px ${y}px, rgba(0,0,0,${1 - revealProgress.opacity}) 0%, rgba(0,0,0,1) 100%)`;
                blackOverlay.style.maskImage = `radial-gradient(circle ${revealProgress.radius}px at ${x}px ${y}px, rgba(0,0,0,${1 - revealProgress.opacity}) 0%, rgba(0,0,0,1) 100%)`;
            },
            onComplete: () => {
                // 🔥 Ativa o controle do mouse normalmente
                document.addEventListener("mousemove", (event) => {
                    gsap.to(blackOverlay, {
                        webkitMaskImage: `radial-gradient(circle ${revealProgress.radius}px at ${event.clientX}px ${event.clientY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)`,
                        maskImage: `radial-gradient(circle ${revealProgress.radius}px at ${event.clientX}px ${event.clientY}px, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)`,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                });
            }
        });
    }, 500); // 🔥 Pequeno atraso para garantir que o DOM carregou



    // ############################## CONTROLE DO BOTÃO SWITCH #################################

    // TIMELINE DA ANIMAÇÃO DA POSIÇÃO OFF PARA POSIÇÃO ON

    const switchOnTimeline = gsap.timeline({ paused: true });

    switchOnTimeline
        .to(switchCircle, { x: 95, duration: 0.3, ease: "power2.inOut" })
        // Aqui, garantimos que estamos animando o background (não o switchBtn)
        .to(switchBackground, {
            duration: 0.3,
            ease: "power2.inOut",
            // Você pode animar diretamente se fill e stroke forem tratadas como CSS
            fill: "#7ed957",
            stroke: "none"
        }, "<");


    // TIMELINE DA ANIMAÇÃO DA POSIÇÃO ON PARA POSIÇÃO OFF

    const switchOffTimeline = gsap.timeline({ paused: true });

    switchOffTimeline
        .to(switchCircle, { x: 0, duration: 0.3, ease: "power2.inOut" })
        .to(switchBackground, {
            duration: 0.3,
            ease: "power2.inOut",
            fill: "none",
            stroke: "#fff",
            // Usamos o 'attr' para garantir que 'stroke-width' seja animado também
        }, "<");

    // FUNÇÃO QUE CONTROLA AS AÇÕES DO BOTÃO SWITCH DE ACORDO COM A POSIÇÃO (ON OU OFF)

    switchBtn.addEventListener("click", () => {
        if (!isOn) {
            isOn = true;
            console.log("✅ Botão foi pressionado!");
            // Toca a animação de ligar (ON)
            switchOnTimeline.restart();
            // Após a animação do botão, inicia a animação principal
            switchOnTimeline.eventCallback("onComplete", () => {
                heroTimeline.play();
                eraseText(coffeeText, 50);
                
            });
        } else {
            isOn = false;
            console.log("🔄 Retornando ao estado inicial!");
            // Toca a animação de desligar (OFF)
            switchOffTimeline.restart();
            switchOffTimeline.eventCallback("onComplete", () => {
                heroTimeline.reverse();
                setTimeout(() => {
                    location.reload();
                }, 10000);
            });
        }
    });


    

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

});