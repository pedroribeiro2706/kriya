gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)

window.addEventListener("load", () => {
    document.body.style.overflow = 'hidden';

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

    const heroTimeline = gsap.timeline({ paused: true });

    let isOn = false;

    // ################################## TIMELINE DA ANIMAÇÃO DE ENTRADA ######################################

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



    // 🔥 ############# ANIMAÇÃO DO TEXTO "HOW ABOUT A COFFEE?" NO MOMENTO QUE A PÁGINA É CARREGADA ############

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



    // ############################## TIMELINE DO BOTÃO SWITCH #################################

    // Timeline para a animação de ligar (ON) do botão
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

    // Timeline para a animação de desligar (OFF) do botão
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

    // Create the ScrollTrigger instance and disable it immediately.
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
            console.log("🎥 currentTime atualizado:", newTime.toFixed(2));

            // 🔥 Quando o vídeo atingir 95% do progresso, libera a rolagem
            if (progress >= 0.95) {
                console.log("✅ Scroll liberado!");
            }
        }
    });

    // Disable the scroll trigger until timeline is finished.
    heroScrollTrigger.disable();

    // Attach an onComplete callback to the timeline.

    heroTimeline.eventCallback("onComplete", () => {
        heroScrollTrigger.enable();
        document.body.style.overflow = ''; // or 'auto'
    });







    


    let exploreTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: "#explore",
            start: "top 75%", // Começa quando 75% da seção entra na tela
            onEnter: () => console.log("✅ ScrollTrigger ativado!"),
            toggleActions: "play none none none" // Executa só uma vez
        }
    });

    // 🔥 Animação da luz piscando com durações aleatórias
    exploreTimeline.to(".light-mask", {
        opacity: 1,
        duration: () => 0.1 + Math.random() * 0.3,
        ease: "power2.inOut",
        repeat: 7,
        yoyo: true,
        repeatRefresh: true,
        onComplete: () => {
            gsap.to(".light-mask", { opacity: 1, duration: 0.75 });
        }
    });

    // 🔥 2. Animação do Título com SplitText (letras entrando uma a uma)
    exploreTimeline.add(() => {
        let splitTitle = new SplitText(".explore-title", { type: "chars" });

        // 🔥 Agora sim, começa com opacity: 0 e só aparece quando a animação inicia
        gsap.set(".explore-title", { opacity: 1 });

        gsap.from(splitTitle.chars, {
            opacity: 0,
            y: 50,
            stagger: 0.05,
            ease: "power2.out",
            duration: 0.3
        });
    }, "+=0.5"); // 🔥 Pequeno delay após a luz piscar

    // 🔥 3. Efeito Máquina de Escrever na Descrição (AGORA COMEÇA DEPOIS DO TÍTULO)
    exploreTimeline.add(() => {
        let description = document.querySelector(".explore-description");
        description.style.opacity = "1"; // Ativa a visibilidade apenas agora
        description.innerHTML = ""; // Garante que o texto começa vazio

        typeText(description, "As a multi-disciplinary designer, I am a visual storyteller, crafting experiences that engage and connect deeply.", 20);
    }, "+=0.3"); // 🔥 Agora só começa depois que o título termina

    // 🔥 Função Máquina de Escrever (mantém igual)
    function typeText(element, text, speed, onComplete) {
        let i = 0;
        function typing() {
            if (i <= text.length) {
                element.innerHTML = text.substring(0, i) + `<span class="cursor">|</span>`;
                i++;
                setTimeout(typing, speed);
            } else {
                element.innerHTML = text;
                if (onComplete) onComplete();
            }
        }
        typing();
    }



    // Select the Explore section, menu items, and dynamic texts
    const exploreSection = document.querySelector("#explore");
    let menuItems = document.querySelectorAll(".explore-menu-item");
    let textItems = document.querySelectorAll(".explore-text");
    const totalItems = menuItems.length;  // e.g., 4 items
    const indexLength = totalItems - 1;

    // Get one menu item's height (assumes all are the same)
    const menuItemHeight = document.querySelector(".explore-menu-item").offsetHeight;

    // Define the scroll distance for pinning.
    // Adjust the multiplier if needed until the menu animation feels right.
    const scrollDistance = menuItemHeight * indexLength * 3;

    // -----
    // 1. Create a timeline that pins the Explore section and moves the menu items.
    //    We use pinSpacing: true and anticipatePin to help smooth the transition.
    let tl = gsap.timeline({
        scrollTrigger: {
            trigger: exploreSection,
            start: "top top",                // When Explore's top reaches the top of the viewport
            end: () => "+=" + scrollDistance, // Pin for a distance equal to scrollDistance
            scrub: true,
            pin: true,
            pinSpacing: false,                // Ensures space is maintained while pinned
            //anticipatePin: 1,                // Smooth out the pin release
            markers: true,                   // Enable markers for debugging; remove when satisfied
            //invalidateOnRefresh: true,       // Recalculate values on refresh/resizing
        }
    });
    tl.to(menuItems, {
        yPercent: -100 * indexLength,
        ease: "power1.inOut"
    });

    // -----
    // 2. Create a separate ScrollTrigger that updates the active menu item and dynamic text.
    // -----
    ScrollTrigger.create({
        trigger: exploreSection,
        start: "top top",
        end: () => "+=" + scrollDistance,
        scrub: true,
        markers: true, // Remove once you have the desired behavior
        onUpdate: self => {
            // Divide the scroll progress (0 to 1) into equal segments per menu item.
            const segment = 1 / totalItems;
            let activeIndex = Math.min(totalItems - 1, Math.floor(self.progress / segment));

            // Update the menu items by toggling the "active" class.
            menuItems.forEach((item, i) => {
                if (i === activeIndex) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            // Update the dynamic texts: fade in the active text and hide the others.
            textItems.forEach((text, i) => {
                if (i === activeIndex) {
                    text.style.display = "block"; // Ensure it’s visible
                    gsap.to(text, { autoAlpha: 1, duration: 0.3 });
                } else {
                    gsap.to(text, {
                        autoAlpha: 0,
                        duration: 0.3,
                        onComplete: () => { text.style.display = "none"; }
                    });
                }
            });
        }
    });


    console.log("✅ Código GSAP carregado corretamente!");


});