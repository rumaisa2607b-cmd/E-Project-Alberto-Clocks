
// Scroll Reveal Animation

const revealElements = document.querySelectorAll(
  '.section, .feature-card, .product-card'
);

revealElements.forEach(element => {
  element.classList.add('reveal');
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(element => {
  revealObserver.observe(element);
});
