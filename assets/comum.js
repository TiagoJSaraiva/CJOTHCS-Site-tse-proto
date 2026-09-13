"use strict";
(() => {
  const pagina = document.body.dataset.page;
  const links = [
    ["inicio", "index.html", "Início"],
    ["candidaturas", "candidaturas.html", "Candidaturas e contas"],
    ["partidos", "partidos.html", "Partidos"],
    ["legislacao", "legislacao.html", "Legislação"],
    ["calendario", "calendario.html", "Calendário eleitoral"],
  ];
  document.getElementById("site-header").innerHTML = `
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header id="topo">
      <div class="utility"><div class="container"><span>Protótipo acadêmico · Dados fictícios · Sem vínculo oficial</span><a href="#conteudo">Ir para o conteúdo</a></div></div>
      <div class="container brand-row">
        <a class="brand" href="index.html" aria-label="TSE, protótipo acadêmico — início"><span class="brand-mark">TSE</span><span class="brand-name">Tribunal Superior<br>Eleitoral</span></a>
        <div class="brand-note"><strong>Justiça Eleitoral</strong>Informação e transparência</div>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links">Menu <span aria-hidden="true">☰</span></button>
      </div>
      <nav class="site-nav" aria-label="Navegação principal"><div class="container nav-links" id="nav-links">${links.map(([id, href, texto]) => `<a href="${href}"${id === pagina ? ' aria-current="page"' : ""}>${texto}</a>`).join("")}</div></nav>
    </header>`;
  document.getElementById("site-footer").innerHTML = `
    <footer class="site-footer"><div class="container">
      <div class="footer-top"><div><strong>Tribunal Superior Eleitoral</strong><p>Protótipo acadêmico inspirado no portal do TSE. Todos os registros, valores, normas e datas apresentados são ilustrativos.</p></div><a href="#topo">Voltar ao topo ↑</a></div>
      <div class="footer-bottom"><span>Sem vínculo oficial com a Justiça Eleitoral.</span><span>Consultas locais · Nenhum dado é enviado</span></div>
    </div></footer>`;
  const botao = document.querySelector(".menu-toggle");
  const menu = document.getElementById("nav-links");
  botao.addEventListener("click", () => {
    const aberto = botao.getAttribute("aria-expanded") === "true";
    botao.setAttribute("aria-expanded", String(!aberto));
    menu.classList.toggle("is-open", !aberto);
  });
  menu.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      botao.getAttribute("aria-expanded") === "true"
    ) {
      botao.setAttribute("aria-expanded", "false");
      menu.classList.remove("is-open");
      botao.focus();
    }
  });
})();
