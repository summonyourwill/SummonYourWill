export function decodeHeroImgLazy(imgEl) {
  if (imgEl.src) return;
  const src = imgEl.dataset.src;
  if (!src) return;

  const tmp = new Image();
  tmp.src = src;
  tmp.decode?.()
    .then(() => {
      imgEl.src = src;
    })
    .catch(() => {
      imgEl.src = src;
    });
}

export function observeLazyImages(root) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        decodeHeroImgLazy(e.target);
        io.unobserve(e.target);
      }
    });
  }, { root });
  root.querySelectorAll('img[data-src]').forEach((img) => io.observe(img));
  return io;
}
