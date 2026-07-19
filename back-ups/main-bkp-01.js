window.addEventListener("load", () => {
  const switchBackground = document.querySelector("#elipse");
  const switchCircle = document.querySelector("#ciculo");
  const switchBtn = document.querySelector("#switch-btn");
  const heroDesigner = document.querySelector(".hero-designer");
  const heroTitle01 = document.querySelector(".hero-title-01");
  const heroTitle02 = document.querySelector(".hero-title-02");
  const blackOverlay = document.querySelector(".black-overlay"); // Seleciona o overlay
  const heroVideo = document.querySelector(".hero-video"); // Seleciona o vídeo

// Verifica se os elementos do botão foram carregados
  if (!switchBackground || !switchCircle || !switchBtn) {
    console.error("❌ Elementos do SVG não encontrados.");
    return;
  }

  let isOn = false; // Estado inicial do botão
  let autoplayStopped = false; // Controle para parar o autoplay após 3s

  switchBtn.addEventListener("click", () => {
    isOn = !isOn;

    // Anima o botão switch
    gsap.to(switchCircle, {
      x: isOn ? 95 : 0,
      duration: 0.3,
      ease: "power2.inOut",
    });

    gsap.to(switchBackground, {
      fill: isOn ? "#7ed957" : "transparent",  // Corrigido para "transparent"
      stroke: isOn ? "none" : "#fff",
      duration: 0.3,
      ease: "power2.inOut",
    });

    // Anima o overlay para desaparecer quando o botão for acionado
    gsap.to(blackOverlay, {
      opacity: isOn ? 0 : 1,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        if (isOn) {
          heroVideo.play(); // Só inicia o vídeo depois que o overlay some

          // Permite que o vídeo rode automaticamente até 3 segundos
          let checkVideoTime = setInterval(() => {
            if (heroVideo.currentTime >= 2 && !autoplayStopped) {
              heroVideo.pause();
              autoplayStopped = true;
              clearInterval(checkVideoTime); // Para o loop de verificação
            }
          }, 100); // Verifica a cada 100ms
        }
      }
    });
 

  // === Scroll para avançar o vídeo === //
  document.addEventListener("wheel", (event) => {
    if (isOn) { // Só funciona se o botão já foi ativado
      let progress = heroVideo.currentTime / heroVideo.duration;
      let scrollAmount = event.deltaY * 0.005; // Ajuste fino da velocidade do scroll
      heroVideo.currentTime = Math.min(heroVideo.duration, Math.max(0, heroVideo.currentTime + scrollAmount));

      // Quando o vídeo chega ao final, pode ativar outra animação ou mudar de seção
      if (progress >= 0.98) {
        console.log("🚀 O vídeo chegou ao fim!");
      }
    }
  });

  // ✅ Evita que o vídeo comece automaticamente antes do clique
  heroVideo.pause();
  heroVideo.currentTime = 0; // Reinicia o vídeo no começo

  console.log("✅ Botão pronto para uso!");

  if (isOn) {
    // Inicia a animação dos textos somente após o clique no botão  
    // Anima "PEDRO RIBEIRO" para cima
    gsap.to(heroDesigner, {
      y: 0,
      duration: 1,
      delay: 0.5,
      ease: "power2.out",
    });

  // Anima "MULTI" para baixo
    gsap.to(heroTitle01, {
      y: 0,
      duration: 1,
      delay: 0.5, // Mesmo delay para sincronizar com "PEDRO RIBEIRO"
      ease: "power2.out",
    });

  // Anima "DESIGNPLINARY" surgindo corretamente ao lado do "I" de "MULTI"
    gsap.to(heroTitle02, {
      x: "160%", // Agora se move corretamente sem sobrepor "MULTI"
      duration: 1.2,
      delay: 1,
      ease: "power2.out",
      onComplete: () => {
        // Depois que a animação lateral termina, move "DESIGNPLINARY" para baixo
        gsap.to(heroTitle02, {
          y: "135px", // Agora desce sem ser cortado
          duration: 1,
          ease: "power2.out",
        });
      }
    });
  }
});
});
