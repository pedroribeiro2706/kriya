// Garantindo que o GSAP e o ScrollTrigger estão carregados
gsap.registerPlugin(ScrollTrigger);

/* ABORDAGEM COM TIMELINE */

// 🔥 Seção 1 (Hero) - Título entra primeiro, descrição depois
gsap.timeline({
    scrollTrigger: {
        trigger: "#hero",
        start: "top 80%",
        end: "bottom 100%",
        scrub: 2,
    }
})
.to(".title-hero", { x: 0, opacity: 1, duration: 1, ease: "power2.out" })
.to(".description-hero", { x: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5");

// 🔥 Seção 2 (Explorer) - Da direita e esquerda para o centro
gsap.timeline({
    scrollTrigger: {
        trigger: "#explorer",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2,
    }
})
.to(".title-explorer", { x: 0, opacity: 1, duration: 1, ease: "power2.out" })
.to(".description-explorer", { x: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5");

// 🔥 Seção 3 (Featured) - Do canto inferior para o centro
gsap.timeline({
    scrollTrigger: {
        trigger: "#featured",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2,
    }
})
.to(".title-featured", { y: 0, opacity: 1, duration: 1, ease: "power3.out" })
.to(".description-featured", { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.5");

// 🔥 Seção 4 (About) - Do canto inferior esquerdo para o centro
gsap.timeline({
    scrollTrigger: {
        trigger: "#about",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2,
    }
})
.to(".title-about", { x: 0, opacity: 1, duration: 1, ease: "power2.out" })
.to(".description-about", { x: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5");

// 🔥 Seção 5 (Contact) - Scale Up
gsap.timeline({
    scrollTrigger: {
        trigger: "#contact",
        start: "top 80%",
        scrub: 2,
    }
})
.to(".title-contact", { scale: 1, opacity: 1, duration: 1, ease: "power2.out" })
.to(".description-contact", { scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5");


