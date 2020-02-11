(async () => {
  const addElectric = (i: number) =>
    (localStorage.electric = +localStorage.electric + i);
  setInterval(() => {
    if (!localStorage.electric) localStorage.electric = 0;
    document.getElementById("bois")!.innerText = `Bois: ${
      localStorage.electric
    }`;
  });
  const electricboi = document.getElementById("eleboi");
  if (!electricboi) return;
  electricboi.addEventListener("click", () => {
    addElectric(1);
  });
})();
