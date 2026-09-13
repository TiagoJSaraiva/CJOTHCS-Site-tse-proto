"use strict";
/* Funções puras: consultas locais, sem rede nem dependências. */
window.ConsultasTSE = (() => {
  const normalizar = (valor) =>
    String(valor || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  const contem = (texto, busca) =>
    normalizar(texto).includes(normalizar(busca));
  const igual = (valor, filtro) => !filtro || valor === filtro;
  const soma = (itens) => itens.reduce((total, item) => total + item.valor, 0);
  const moeda = (centavos) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(centavos / 100);
  const data = (iso) => iso.split("-").reverse().join("/");
  const candidatos = (itens, f) =>
    itens
      .filter(
        (c) =>
          igual(c.ano, f.ano) &&
          igual(c.uf, f.uf) &&
          igual(c.cargo, f.cargo) &&
          contem(c.nome, f.nome),
      )
      .sort(
        (a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR") || b.ano.localeCompare(a.ano),
      );
  const partidos = (itens, f) =>
    itens
      .filter((p) => contem(`${p.nome} ${p.sigla}`, f.busca))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  const normas = (itens, f) =>
    itens
      .filter(
        (n) =>
          igual(n.tipo, f.tipo) &&
          igual(n.data.slice(0, 4), f.ano) &&
          contem(`${n.assunto} ${n.ementa} ${n.numero}`, f.busca),
      )
      .sort((a, b) =>
        f.ordem === "recentes"
          ? b.data.localeCompare(a.data)
          : a.data.localeCompare(b.data),
      );
  const eventos = (itens, f) =>
    itens
      .filter((e) => igual(e.ano, f.ano) && igual(e.tema, f.tema))
      .sort((a, b) => a.data.localeCompare(b.data));
  const despesas = (itens, categoria) =>
    itens.filter((d) => igual(d.categoria, categoria));
  return {
    normalizar,
    soma,
    moeda,
    data,
    candidatos,
    partidos,
    normas,
    eventos,
    despesas,
  };
})();
