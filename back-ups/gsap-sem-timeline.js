/* ABORDAGEM SEM TIMELINE */

gsap.registerPlugin(ScrollTrigger);

// Seção 1 (Hero) - Da esquerda para o centro
gsap.to(".title-hero", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#hero",
        start: "top 80%",
        scrub: 2
    }
});

gsap.to(".description-hero", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#hero",
        start: "top 80%",
        scrub: 2
    }
});

// Seção 2 (Explorer) - Da direita para o centro
gsap.to(".title-explorer", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#explorer",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});
gsap.to(".description-explorer", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#explorer",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});

// Seção 3 (Featured) - Do canto inferior direito para o centro
gsap.to(".title-featured", { 
    y: 0, opacity: 1, duration: 1, ease: "power3.out",
    scrollTrigger: {
        trigger: "#featured",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});
gsap.to(".description-featured", { 
    y: 0, opacity: 1, duration: 1, ease: "power3.out",
    scrollTrigger: {
        trigger: "#featured",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});

// Seção 4 (About) - Do canto inferior esquerdo para o centro
gsap.to(".title-about", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#about",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});
gsap.to(".description-about", { 
    x: 0, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#about",
        start: "top 50%",
        end: "bottom 100%",
        scrub: 2
    }
});

// Seção 5 (Contact) - Scale Up
gsap.to(".title-contact", { 
    scale: 1, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#contact",
        start: "top 80%",
        scrub: true
    }
});
gsap.to(".description-contact", { 
    scale: 1, opacity: 1, duration: 1, ease: "power2.out",
    scrollTrigger: {
        trigger: "#contact",
        start: "top 80%",
        scrub: true
    }
});