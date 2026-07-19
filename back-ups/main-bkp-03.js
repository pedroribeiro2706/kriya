/* https://codepen.io/jh3y/pen/MYgaaem */

gsap.registerPlugin(ScrollTrigger);

console.log("GSAP:", gsap);
console.log("ScrollTrigger:", ScrollTrigger);

// ################################# EFEITO SEE THROUGH ####################################


// Seleciona os elementos
const cursorMask = document.querySelector(".cursor-mask");
const blackOverlay = document.querySelector(".black-overlay");

// Evento de movimento do mouse
// 🔥 Garante que o overlay começa completamente opaco
blackOverlay.style.webkitMaskImage = "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)";
blackOverlay.style.maskImage = "radial-gradient(circle 0px at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 100%)";

setTimeout(() => {
  let revealProgress = { radius: 0, opacity: 0 };

  // 🔥 Animação inicial do raio-x (crescendo e aparecendo)
  gsap.to(revealProgress, {
    radius: 240, // 🔥 Tamanho final do círculo
    opacity: 1, // 🔥 Opacidade final do efeito
    duration: 1.0,
    ease: "power2.out",
    onUpdate: () => {
      let x = window.innerWidth / 2; // Começa do centro da tela
      let y = window.innerHeight / 2;

      blackOverlay.style.webkitMaskImage = `radial-gradient(circle ${revealProgress.radius}px at ${x}px ${y}px, rgba(0,0,0,${1 - revealProgress.opacity}) 0%, rgba(0,0,0,1) 100%)`;
      blackOverlay.style.maskImage = `radial-gradient(circle ${revealProgress.radius}px at ${x}px ${y}px, rgba(0,0,0,${1 - revealProgress.opacity}) 0%, rgba(0,0,0,1) 100%)`;
    },
    onComplete: () => {
      // 🔥 Após a animação inicial, ativa o controle do mouse normalmente
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
}, 3000);


// ###################################### FUNÇÕES DENTRO DO "LOAD" E VARIÁVEIS #################################### //


window.addEventListener("load", () => {
  const switchBackground = document.querySelector("#elipse");
  const switchCircle = document.querySelector("#ciculo");
  const switchBtn = document.querySelector("#switch-btn");
  const blackOverlay = document.querySelector(".black-overlay"); // Overlay
  const heroVideo = document.querySelector(".hero-video"); // Vídeo
  const heroDesigner = document.querySelector(".hero-designer");
  const heroTitle01 = document.querySelector(".hero-title-01");
  const heroTitle02 = document.querySelector(".hero-title-02");
  const heroDescription = document.querySelector(".hero-description");
  const coffeeText = document.querySelector("#coffee-text"); //
  const scrollDownWrapper = document.querySelector(".scroll-down-wrapper");
  const exploreSection = document.querySelector(".explore-section"); // 🔥 Seção 02
  console.log("exploreSection encontrado?", exploreSection);
  const exploreTitle = document.querySelector(".explore-title"); //Título Seção 02


  let isOn = false; //Garante que o botão foi pressionado antes de liberar o scroll.
  let autoplayStopped = false; //Garante que o vídeo chegou aos 3 segundos antes de permitir o scroll.



  // ###################################### FUNÇÃO "HOW ABOUT A COFFEE" #################################### //


  // Função para criar efeito de digitação com cursor animado
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

  // Função para apagar o texto com efeito reverso
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

  if (coffeeText) { // Verifica se o elemento existe
    coffeeText.innerHTML = `<span class="cursor">|</span>`; // 🔥 Cursor visível antes de começar
    setTimeout(() => { 
      typeText(coffeeText, "How about a coffee?", 50);
    }, 500); // Pequeno atraso para garantir que tudo carregou
  }


  // ###################################### FUNÇÃO QUE CHAMA O ELEMENTO SETA E SCROLL DOWN #################################### //


    // Quando pressionar o botão, mostra a seta
    function showScrollDown() {
      gsap.to(scrollDownWrapper, { opacity: 1, y: -10, duration: 1, ease: "power2.out" });
  }

  // Quando os elementos saírem da tela, esconde a seta
  function hideScrollDown() {
      gsap.to(scrollDownWrapper, { opacity: 0, y: 10, duration: 1, ease: "power2.out" });
  }


  // ###################################### FUNÇÃO ANIMAÇÕES ACIONADAS COM O BOTÃO SWITCH #################################### //


  switchBtn.addEventListener("click", () => {
    isOn = !isOn;


    gsap.to(switchCircle, {
      x: isOn ? 95 : 0,
      duration: 0.3,
      ease: "power2.inOut",
    });

    gsap.to(switchBackground, {
      fill: isOn ? "#7ed957" : "transparent",
      stroke: isOn ? "none" : "#fff",
      duration: 0.3,
      ease: "power2.inOut",
    });

    gsap.to(blackOverlay, {
      opacity: isOn ? 0 : 1,
      duration: 1,
      ease: "power2.out"
    });

    if (isOn) {
      gsap.to(heroDesigner, { y: 0, duration: 1, delay: 0.5, ease: "power2.out" });
      gsap.to(heroTitle01, { y: 0, duration: 1, delay: 0.5, ease: "power2.out" });

      gsap.to(heroTitle02, {
        x: "160%",
        duration: 1.2,
        delay: 1,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(heroTitle02, {
            y: "135px",
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(heroDescription, { y: "0%", duration: 1, ease: "power2.out" });

              gsap.to(switchBtn, { // 🔥 Move o botão para a posição final
                y: 295,
                duration: 1,
                ease: "power2.out"
              });

              setTimeout(() => {
                heroVideo.play();

                let checkVideoTime = setInterval(() => {
                  if (heroVideo.currentTime >= 0.5 && !autoplayStopped) {
                    heroVideo.pause();
                    autoplayStopped = true;
                    clearInterval(checkVideoTime);
                  }
                }, 100);
              }, 2000);
            }
          });
        }
      });
    }

    eraseText(coffeeText, 50);

    showScrollDown(); // Chama a função posiciona o aviso Scroll Down e seta

  });


  // ###################################### FUNÇÃO QUE CONTROLA OS EVENTOS DO SCROLL - WHEEL #################################### //


  document.addEventListener("wheel", (event) => {
    if (isOn && autoplayStopped) {
      let progress = heroVideo.currentTime / heroVideo.duration;
      let scrollAmount = event.deltaY * 0.009;

      // 🔥 Se o vídeo já chegou ao último frame e o usuário faz scroll down, esconde a seta
      if (progress >= 0.95 && event.deltaY > 0) {
        hideScrollDown();
      }
  
      if (progress < 0.95) {
        heroVideo.currentTime = Math.min(heroVideo.duration, Math.max(0, heroVideo.currentTime + scrollAmount));
      } else {
        // Ajustes de movimentação e fade out para os elementos
        let moveYHero = Math.min(300, Math.max(0, heroDesigner.offsetTop + event.deltaY * 1.5)); // "PEDRO RIBEIRO" para baixo
        let moveYMulti = Math.max(-300, Math.min(0, heroTitle01.offsetTop - event.deltaY * 1.5)); // "MULTI" para cima
        let moveYDesignplinary = Math.min(435, Math.max(135, 135 + event.deltaY * 1.5)); // "DESIGNPLINARY" para baixo, compensando o deslocamento inicial
        let moveYDescription = Math.max(-300, Math.min(0, heroDescription.offsetTop - event.deltaY * 1.5)); // Texto descrição para cima
        let opacityValue = Math.max(0, 1 - Math.abs(moveYHero) / 100); // Controle do fade
  
        gsap.to(heroDesigner, { y: moveYHero + "px", opacity: opacityValue, duration: 0.75, ease: "none" });
        gsap.to(heroTitle01, { y: moveYMulti + "px", opacity: opacityValue, duration: 0.75, ease: "none" });
        gsap.to(heroTitle02, { y: moveYDesignplinary + "px", opacity: opacityValue, duration: 0.75, ease: "none" });
        gsap.to(heroDescription, { y: moveYDescription + "px", opacity: opacityValue, duration: 0.75, ease: "none" });
  
        // 🔥 Switch Button apenas faz fade out
        gsap.to(switchBtn, { opacity: opacityValue, duration: 0.1, ease: "none" });
  
        // 🔥 Se o usuário fizer scroll up, os elementos retornam ao estado inicial
        if (event.deltaY < 0) {
          gsap.to(heroDesigner, { y: "0px", opacity: 1, duration: 0.75, ease: "power2.out" });
          gsap.to(heroTitle01, { y: "0px", opacity: 1, duration: 0.75, ease: "power2.out" });
          gsap.to(heroTitle02, { y: "135px", opacity: 1, duration: 0.75, ease: "power2.out" });
          gsap.to(heroDescription, { y: "0px", opacity: 1, duration: 0.75, ease: "power2.out" });
          gsap.to(switchBtn, { opacity: 1, duration: 0.75, ease: "power2.out" });
  
          heroVideo.currentTime = Math.max(0, heroVideo.currentTime + scrollAmount);
        }
      }
    }

  });
  
  heroVideo.pause();
  heroVideo.currentTime = 0;  

  // ###################################### FUNÇÃO QUE ANIMA A SAÍDA DOS ELEMENTOS DA SEÇÃO 01 #################################### //  
  
  ScrollTrigger.create({
    trigger: exploreSection,
    start: "top bottom",
    end: "top top",
    markers: true, // 🔥 Isso adiciona marcadores visíveis para debug
    onEnter: () => console.log("🔥 SEÇÃO 02 ENTROU NA TELA!"),
    onLeave: () => console.log("👋 SEÇÃO 02 SAIU DA TELA!"),
    onEnterBack: () => console.log("⬆️ SEÇÃO 02 VOLTOU!"),
    onLeaveBack: () => console.log("⬇️ SEÇÃO 02 DESCEU!")
  });

  gsap.to(exploreSection, {
    y: "-100vh", // Move para cima
    duration: 1.5, // 🔥 Testando uma duração fixa para ver se anima
    ease: "power2.out",
    scrollTrigger: {
      trigger: exploreSection,
      start: "top bottom",
      end: "top top",
      scrub: true,
      markers: true, // 🔥 TEMPORÁRIO: Mostra os marcadores do ScrollTrigger na tela
      immediateRender: false // 🔥 Evita bugs quando começa fora da tela
    }
  });





});



