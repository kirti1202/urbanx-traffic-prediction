// Page entry animation
gsap.from(".page", {
  opacity: 0,
  y: 30,
  duration: 0.6,
  ease: "power3.out"
});

// Page exit animation on link click
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");

    // Ignore external links
    if (!href || href.startsWith("http")) return;

    e.preventDefault();

    gsap.to(".page", {
      opacity: 0,
      y: -30,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        window.location.href = href;
      }
    });
  });
});
