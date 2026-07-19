gsap.registerPlugin(ScrollTrigger);

// 🔥 Garante que o vídeo começa pausado no primeiro frame
const heroVideo = document.querySelector(".hero-video");
heroVideo.pause();
heroVideo.currentTime = 0;

// 🔥 Ativa o ScrollTrigger logo no carregamento da página
ScrollTrigger.create({
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: 9,
    pin: true,
    invalidateOnRefresh: true, // 🔥 Recalcula o layout quando a página muda
    anticipatePin: 1, // 🔥 Evita "pulos" inesperados no pin
    onUpdate: (self) => {
        let progress = self.progress;
        let newTime = heroVideo.duration * progress;
        heroVideo.currentTime = newTime;
        console.log("🎥 currentTime atualizado:", newTime.toFixed(2));
    }
});

// DECLARAÇÃO DAS VARIÁVEIS

const cursorMask = document.querySelector(".cursor-mask");
const blackOverlay = document.querySelector(".black-overlay");

// EFEITO SEE-THROUGH (CARREGA APÓS CARREGAR A PÁGINA)

window.addEventListener("load", () => {

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
});







// DECLARAÇÃO DAS VARIÁVEIS

const switchBackground = document.querySelector("#elipse");
const switchCircle = document.querySelector("#ciculo");
const switchBtn = document.querySelector("#switch-btn");
const heroDesigner = document.querySelector(".hero-designer");
const heroTitle01 = document.querySelector(".hero-title-01");
const heroTitle02 = document.querySelector(".hero-title-02");
const heroDescription = document.querySelector(".hero-description");
const coffeeText = document.querySelector("#coffee-text");
const scrollDownWrapper = document.querySelector(".scroll-down-wrapper");
const heroTimeline = gsap.timeline({ paused: true });

let isOn = false;
//let autoplayStopped = false;


// 🔥 1. TIMELINE PARA ENTRADA DOS ELEMENTOS DA HERO SECTION

heroTimeline
    .to(switchCircle, { x: 95, duration: 0.3, ease: "power2.inOut" })
    .to(switchBackground, { fill: "#7ed957", stroke: "none", duration: 0.3, ease: "power2.inOut" }, "<")
    .to(blackOverlay, { opacity: 0, duration: 1, ease: "power2.out" }, "<")
    .to(heroDesigner, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5")
    .to(heroTitle01, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5")
    .to(heroTitle02, { x: "160%", duration: 1.2, ease: "power2.out" })
    .to(heroTitle02, { y: "135px", duration: 1, ease: "power2.out" })
    .to(heroDescription, { y: "0%", opacity: 1, duration: 1, ease: "power2.out" })
    .to(switchBtn, { y: 295, duration: 1, ease: "power2.out" }) // Move o botão para a posição final
    .to(scrollDownWrapper, { opacity: 1, y: -10, duration: 1, ease: "power2.out" }); // Exibe a seta de scroll


// 🔥 ANIMAÇÃO DO TEXTO "HOW ABOUT A COFFEE?" NO MOMENTO QUE A PÁGINA É CARREGADA

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





// 🔥 2. SWITCH BUTTON ATIVA (3 FUNÇÕES) A TIMELINE E O CONTROLE DE VIDEO, E REMOVE O TEXTO "HOW ABOUT A COFFEE?"

switchBtn.addEventListener("click", () => {
    if (!isOn) {
        isOn = true;
        heroTimeline.play();
        eraseText(coffeeText, 50);
        //enableVideoScrollControl();
    } else {
        location.reload(); // 🔥 Após as animações, o botão recarrega a página
    }
});




// 🔥 5. TRANSIÇÃO SUAVE PARA A SEÇÃO 2 (EXPLORE)
gsap.to("#explore", {
    y: "-100vh",
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
        trigger: "#explore",
        start: "top bottom",
        end: "top top",
        scrub: true
    }
});

