async function injectComponentesNoHeader() {

  const header = document.querySelector("header");
  if (!header) {
    console.error("Nenhum <header> encontrado na página.");
    return;
  }

  try {
    const res = await fetch("header.html");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    header.innerHTML = await res.text();

    // Inicializa tudo que depende do HTML injetado
    await window.initComponentes?.();
  } catch (err) {
    console.error("Falha ao injetar componentes.html no header:", err);
  }
}

document.addEventListener("DOMContentLoaded", injectComponentesNoHeader);