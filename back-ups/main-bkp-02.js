gsap.registerPlugin(ScrollTrigger);

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
  const heroSection = document.querySelector(".hero-section"); // Primeira seção
  let isOn = false; //Garante que o botão foi pressionado antes de liberar o scroll.
  let autoplayStopped = false; //Garante que o vídeo chegou aos 3 segundos antes de permitir o scroll.
  let transitionStarted = false; // 🔥 Evita que a transição aconteça várias vezes

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

              setTimeout(() => {
                heroVideo.play();

                let checkVideoTime = setInterval(() => {
                  if (heroVideo.currentTime >= 3 && !autoplayStopped) {
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
  });

  // === Scroll para avançar o vídeo === //
  document.addEventListener("wheel", (event) => {
    if (isOn && autoplayStopped && !transitionStarted) {
      let progress = heroVideo.currentTime / heroVideo.duration;
      let scrollAmount = event.deltaY * 0.005;
      heroVideo.currentTime = Math.min(heroVideo.duration, Math.max(0, heroVideo.currentTime + scrollAmount));

      if (progress >= 0.95 && !transitionStarted) {
        transitionStarted = true; // 🔥 Impede que a animação rode várias vezes
        //fadeOutHeroSection();
      }
    }
  });

  // === 🔥 Animação de saída da primeira seção === //
  function fadeOutHeroSection() {
    // Anima "PEDRO RIBEIRO" e "MULTI" para a esquerda
    gsap.to([heroDesigner, heroTitle01], {
      x: "-100vw",
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut"
    });
  
    // Anima "DESIGNPLINARY" e a descrição para a direita
    gsap.to([heroTitle02, heroDescription], {
      x: "100vw",
      opacity: 0,
      duration: 1.5,
      ease: "power2.inOut"
    });
  
    // Anima o botão de switch
    gsap.to(switchBtn, {
      x: "100vw",
      opacity: 0,
      duration: 2,
      ease: "power2.inOut"
    });
  
    setTimeout(() => {
      gsap.to("#explore", { // 🔥 Agora move a seção para cima!
        top: "0vh",
        duration: 1.5,
        ease: "power2.inOut"
      });
    }, 1600);
  }

  heroVideo.pause();
  heroVideo.currentTime = 0;
});




// ############################ SEÇÃO 02 #########################################

// Quando o vídeo da seção anterior termina
gsap.to(".hero-section", {
  opacity: 0,
  duration: 1,
  ease: "power2.out",
  onComplete: () => {
    document.querySelector(".hero-section").style.display = "none";
    
    // Faz a seção "Explore" aparecer
    gsap.to(".explore-overlay", {
      opacity: 0,
      duration: 1.5,
      ease: "power2.out"
    });

    // Luminária entra com slide da direita
    gsap.from(".lamp-placeholder", {
      x: 200,
      duration: 1.5,
      ease: "power2.out"
    });

    // Título e descrição entram
    gsap.to(".explore-content", {
      opacity: 1,
      y: 0,
      duration: 1.5,
      ease: "power2.out",
      delay: 1
    });

    // Máscara da luz aparece (simulando o acender)
    gsap.to(".light-mask", {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out",
      delay: 2
    });
  }
});