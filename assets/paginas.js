"use strict";
(() => {
  const D = window.DadosTSE;
  const Q = window.ConsultasTSE;
  const page = document.body.dataset.page;
  const form = document.getElementById("filters");
  const listView = document.getElementById("list-view");
  const detailView = document.getElementById("detail-view");
  const results = document.getElementById("results");
  const count = document.getElementById("result-count");
  const notice = document.getElementById("route-notice");
  const order = document.getElementById("ordem");
  const categoryByCandidate = new Map();
  let applied = {};
  let lastId = "";
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const href = (id, aba = "") =>
    `#${new URLSearchParams({ id, ...(aba ? { aba } : {}) })}`;
  const party = (id) => D.partidos.find((p) => p.id === id);
  const empty = (
    title = "Nenhum resultado encontrado",
    message = "Tente outros termos ou limpe os filtros para consultar todos os registros.",
  ) => `<div class="empty"><h3>${title}</h3><p>${message}</p></div>`;
  const table = (headers, rows, caption) =>
    `<div class="table-wrap" role="region" aria-label="${escape(caption)}" tabindex="0"><table><caption class="sr-only">${escape(caption)}</caption><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
  const fact = (label, value) =>
    `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`;
  const date = (iso) => `<time datetime="${iso}">${Q.data(iso)}</time>`;
  const link = (id, name) =>
    `<a href="${href(id)}" data-record="${id}">${escape(name)}</a>`;
  const back = '<a class="back-link" href="#lista">← Voltar aos resultados</a>';
  const focus = (element) => {
    if (!element) return;
    if (!element.matches("a, button, input, select, textarea, [tabindex]"))
      element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: "nearest" });
  };
  const tabs = (item, active, sections) =>
    `<nav class="tabs" aria-label="Seções da ficha">${sections.map(([id, name]) => `<a href="${href(item.id, id)}"${active === id ? ' aria-current="true"' : ""}>${name}</a>`).join("")}</nav>`;

  function renderResults() {
    let items;
    if (page === "candidaturas") {
      items = Q.candidatos(D.candidatos, applied);
      results.innerHTML = items.length
        ? table(
            ["Candidatura", "Cargo / UF", "Partido", "Eleição", "Registro"],
            items.map(
              (c) =>
                `<tr><td>${link(c.id, c.nome)}<span class="subtext">Número ${c.numero}</span></td><td>${escape(c.cargo)}<span class="subtext">${c.uf}</span></td><td>${party(c.partido).sigla}</td><td>${c.ano}</td><td><span class="badge${c.situacao === "Em análise" ? " pending" : ""}">${c.situacao}</span></td></tr>`,
            ),
            "Candidaturas encontradas",
          )
        : empty();
    } else if (page === "partidos") {
      items = Q.partidos(D.partidos, applied);
      results.innerHTML = items.length
        ? table(
            ["Sigla", "Nome do partido", "Número", "Data de registro"],
            items.map(
              (p) =>
                `<tr><td><span class="badge neutral">${p.sigla}</span></td><td>${link(p.id, p.nome)}</td><td>${p.numero}</td><td>${date(p.registro)}</td></tr>`,
            ),
            "Partidos encontrados",
          )
        : empty();
    } else if (page === "legislacao") {
      items = Q.normas(D.normas, { ...applied, ordem: order.value });
      results.innerHTML = items.length
        ? items
            .map(
              (n) =>
                `<article class="record"><div class="record-meta"><span class="badge neutral">${n.tipo}</span><span>Publicação: ${date(n.data)}</span><span>${escape(n.assunto)}</span></div><h3>${link(n.id, `${n.tipo} nº ${n.numero}`)}</h3><p>${escape(n.ementa)}</p></article>`,
            )
            .join("")
        : empty();
    } else {
      items = Q.eventos(D.eventos, applied);
      const months = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];
      results.innerHTML = items.length
        ? items
            .map(
              (e) =>
                `<article class="record calendar-record"><div class="date-block" aria-hidden="true"><strong>${e.data.slice(8)}</strong><span>${months[Number(e.data.slice(5, 7)) - 1]}</span></div><div><div class="record-meta"><span class="badge neutral">${escape(e.tema)}</span><span>${date(e.data)}</span></div><h3>${escape(e.titulo)}</h3><p>${escape(e.publico)}</p></div><a href="${href(e.id)}" data-record="${e.id}">Ver detalhes <span class="sr-only">de ${escape(e.titulo)} em ${Q.data(e.data)}</span><span aria-hidden="true">→</span></a></article>`,
            )
            .join("")
        : empty();
    }
    const nouns = {
      candidaturas: ["candidatura encontrada", "candidaturas encontradas"],
      partidos: ["partido encontrado", "partidos encontrados"],
      legislacao: ["norma encontrada", "normas encontradas"],
      calendario: ["evento encontrado", "eventos encontrados"],
    };
    count.textContent = `${items.length} ${nouns[page][items.length === 1 ? 0 : 1]}`;
  }

  function expenses(c, category) {
    const filtered = Q.despesas(c.despesas, category);
    return `${
      filtered.length
        ? table(
            ["Descrição", "Fornecedor", "Categoria", "Valor"],
            filtered.map(
              (d) =>
                `<tr><td>${escape(d.descricao)}</td><td>${escape(d.fornecedor)}</td><td>${escape(d.categoria)}</td><td class="money">${Q.moeda(d.valor)}</td></tr>`,
            ),
            "Despesas declaradas",
          )
        : empty(
            "Nenhuma despesa nesta categoria",
            "Selecione outra categoria para consultar os lançamentos disponíveis.",
          )
    }
      <div class="total" role="status" aria-live="polite"><span>${category ? `Total em ${escape(category)}` : "Total das despesas declaradas"}</span><strong>${Q.moeda(Q.soma(filtered))}</strong></div>`;
  }

  function renderCandidate(c, section) {
    const active = ["bens", "contas"].includes(section)
      ? section
      : "informacoes";
    const p = party(c.partido);
    let content;
    if (active === "bens") {
      content = `<h3>Bens declarados</h3><p>Relação patrimonial informada pela candidatura para a eleição de ${c.ano}.</p>${
        c.bens.length
          ? table(
              ["Descrição", "Tipo", "Valor declarado"],
              c.bens.map(
                (b) =>
                  `<tr><td>${escape(b.descricao)}</td><td>${escape(b.tipo)}</td><td class="money">${Q.moeda(b.valor)}</td></tr>`,
              ),
              "Bens declarados",
            )
          : empty(
              "Nenhum bem declarado",
              "Não há bens informados para esta candidatura na base ilustrativa.",
            )
      }<div class="total"><span>Valor total dos bens</span><strong>${Q.moeda(Q.soma(c.bens))}</strong></div>`;
    } else if (active === "contas") {
      const category = categoryByCandidate.get(c.id) || "";
      content = `<h3>Contas de campanha</h3><div class="metric-grid"><div class="metric"><span>Receitas declaradas</span><strong>${Q.moeda(Q.soma(c.receitas))}</strong></div><div class="metric"><span>Despesas declaradas</span><strong>${Q.moeda(Q.soma(c.despesas))}</strong></div></div><h3>Origem dos recursos</h3>${
        c.receitas.length
          ? table(
              ["Origem", "Valor"],
              c.receitas.map(
                (r) =>
                  `<tr><td>${escape(r.descricao)}</td><td class="money">${Q.moeda(r.valor)}</td></tr>`,
              ),
              "Receitas declaradas",
            )
          : "<p>Não há receitas informadas para esta candidatura.</p>"
      }<hr class="section-divider"><h3>Despesas da campanha</h3><div class="field expense-filter"><label for="categoria">Categoria da despesa</label><select id="categoria"><option value="">Todas as categorias</option>${["Publicidade", "Estrutura", "Serviços", "Transporte"].map((cat) => `<option${cat === category ? " selected" : ""}>${cat}</option>`).join("")}</select></div><div id="expense-results">${expenses(c, category)}</div>`;
    } else {
      content = `<h3>Informações da candidatura</h3><dl class="facts">${fact("Nome", c.nome)}${fact("Número", c.numero)}${fact("Cargo", c.cargo)}${fact("Estado", c.uf)}${fact("Eleição", c.ano)}${fact("Situação do registro", c.situacao)}${fact("Partido", `${p.sigla} — ${p.nome}`)}${fact("Ocupação", c.ocupacao)}</dl>`;
    }
    detailView.innerHTML = `${back}<article class="detail-card"><header class="detail-header"><div class="initials" aria-hidden="true">${c.nome
      .split(" ")
      .map((s) => s[0])
      .slice(0, 2)
      .join(
        "",
      )}</div><div><h2 id="detail-title" tabindex="-1">${escape(c.nome)}</h2><p>${escape(c.cargo)} · ${c.uf} · Eleições ${c.ano} · ${p.sigla}</p></div><span class="badge${c.situacao === "Em análise" ? " pending" : ""}">${c.situacao}</span></header>${tabs(
      c,
      active,
      [
        ["informacoes", "Informações"],
        ["bens", "Bens"],
        ["contas", "Contas"],
      ],
    )}<div class="detail-body">${content}</div></article>`;
    const selector = document.getElementById("categoria");
    if (selector)
      selector.addEventListener("change", () => {
        categoryByCandidate.set(c.id, selector.value);
        document.getElementById("expense-results").innerHTML = expenses(
          c,
          selector.value,
        );
      });
  }

  function renderParty(p, section) {
    const active = section === "direcao" ? "direcao" : "cadastro";
    const content =
      active === "direcao"
        ? `<h3>Direção nacional</h3><dl class="facts">${fact("Presidente nacional", p.presidente)}${fact("Vice-presidente", p.vice)}${fact("Secretário(a)-geral", p.secretario)}${fact("Sede", p.sede)}</dl>`
        : `<h3>Dados de registro</h3><dl class="facts">${fact("Nome do partido", p.nome)}${fact("Sigla", p.sigla)}${fact("Número da legenda", p.numero)}${fact("Data de registro", Q.data(p.registro))}${fact("Abrangência", "Nacional")}${fact("Situação", "Registrado")}</dl>`;
    detailView.innerHTML = `${back}<article class="detail-card"><header class="detail-header"><div class="initials" aria-hidden="true">${p.sigla}</div><div><h2 id="detail-title" tabindex="-1">${escape(p.nome)}</h2><p>${p.sigla} · Número ${p.numero}</p></div><span class="badge">Registrado</span></header>${tabs(
      p,
      active,
      [
        ["cadastro", "Dados do partido"],
        ["direcao", "Direção nacional"],
      ],
    )}<div class="detail-body">${content}</div></article>`;
  }

  function renderLaw(n) {
    detailView.innerHTML = `${back}<article class="detail-card"><header class="detail-header"><div><p class="eyebrow">${escape(n.assunto)}</p><h2 id="detail-title" tabindex="-1">${n.tipo} nº ${n.numero}</h2><p>Publicação: ${date(n.data)}</p></div></header><div class="detail-body document-body"><p class="notice">Norma fictícia para avaliação acadêmica. Este texto não tem validade jurídica.</p><h3>Ementa</h3><p>${escape(n.ementa)}</p><hr class="section-divider"><h3>Texto da norma</h3>${n.texto.map((p) => `<p>${escape(p)}</p>`).join("")}<p class="document-label">Fim do texto ilustrativo · ${n.tipo} nº ${n.numero}</p></div></article>`;
  }

  function renderEvent(e) {
    detailView.innerHTML = `${back}<article class="detail-card"><header class="detail-header"><div><p class="eyebrow">Calendário ${e.ano} · ${escape(e.tema)}</p><h2 id="detail-title" tabindex="-1">${escape(e.titulo)}</h2><p>Data: ${date(e.data)}</p></div></header><div class="detail-body document-body"><p class="notice">Data ilustrativa do protótipo. Não representa orientação ou prazo oficial.</p><dl class="facts">${fact("Data do evento", Q.data(e.data))}${fact("Público", e.publico)}${fact("Tema", e.tema)}</dl><h3>Detalhes</h3><p>${escape(e.descricao)}</p><p class="document-label">Calendário eleitoral ilustrativo de ${e.ano}.</p></div></article>`;
  }

  function route(shouldFocus = false) {
    const hash = location.hash.slice(1);
    // Links de acessibilidade e de topo não fecham a ficha em exibição.
    if (hash === "conteudo" || hash === "topo") return;
    const params = new URLSearchParams(hash);
    const id = params.get("id");
    const sources = {
      candidaturas: D.candidatos,
      partidos: D.partidos,
      legislacao: D.normas,
      calendario: D.eventos,
    };
    const item = sources[page].find((item) => item.id === id);
    notice.hidden = true;
    if (!item) {
      listView.hidden = false;
      detailView.hidden = true;
      if (id) {
        notice.hidden = false;
        notice.textContent =
          "O registro solicitado não foi encontrado. Faça uma nova consulta abaixo.";
      }
      if (shouldFocus) {
        const previous = Array.from(
          results.querySelectorAll("[data-record]"),
        ).find((a) => a.dataset.record === lastId);
        focus(previous || count);
      }
      return;
    }
    const sameItem = !detailView.hidden && lastId === item.id;
    lastId = item.id;
    listView.hidden = true;
    detailView.hidden = false;
    if (page === "candidaturas") renderCandidate(item, params.get("aba"));
    else if (page === "partidos") renderParty(item, params.get("aba"));
    else if (page === "legislacao") renderLaw(item);
    else renderEvent(item);
    if (shouldFocus)
      focus(
        sameItem
          ? detailView.querySelector(".tabs a[aria-current]")
          : document.getElementById("detail-title"),
      );
  }

  function applyFilters(shouldFocus = false) {
    applied = Object.fromEntries(new FormData(form));
    notice.hidden = true;
    renderResults();
    if (shouldFocus) focus(count);
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters(true);
  });
  form.addEventListener("reset", () => {
    // O navegador restaura os campos após disparar o evento reset.
    setTimeout(() => {
      if (order) order.value = "antigas";
      applyFilters(true);
    }, 0);
  });
  if (order) order.addEventListener("change", renderResults);
  window.addEventListener("hashchange", () => route(true));
  applyFilters();
  route();
})();
