// ============================================================
// MODEL — dados, regras de negócio e persistência (localStorage)
// ============================================================

const DIARIA = 50;
const STORAGE_KEY = 'pai_controle';

const pad = n => String(n).padStart(2, '0');

function carregarEstado() {
  const padrao = { diasAntigos: 0, datas: [], transacoes: [] };
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!s) return padrao;
    return {
      // "dias" era o contador antigo (+1 dia): vira diasAntigos e continua somando no total
      diasAntigos: s.diasAntigos ?? s.dias ?? 0,
      datas: Array.isArray(s.datas) ? s.datas : [],
      transacoes: Array.isArray(s.transacoes) ? s.transacoes : []
    };
  } catch (e) {
    return padrao;
  }
}

const FinanceModel = {

  state: carregarEstado(),

  salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  // Datas no formato AAAA-MM-DD (data local, sem fuso)
  iso(ano, mes, dia) { return `${ano}-${pad(mes + 1)}-${pad(dia)}`; },

  hojeISO() {
    const d = new Date();
    return this.iso(d.getFullYear(), d.getMonth(), d.getDate());
  },

  temDia(iso) { return this.state.datas.includes(iso); },

  // Clicou no calendário: marca ou desmarca o dia trabalhado
  alternarDia(iso) {
    const i = this.state.datas.indexOf(iso);
    if (i === -1) { this.state.datas.push(iso); this.state.datas.sort(); }
    else this.state.datas.splice(i, 1);
    this.salvar();
  },

  diasNoMes(ano, mes) {
    const prefixo = `${ano}-${pad(mes + 1)}-`;
    return this.state.datas.filter(d => d.startsWith(prefixo)).length;
  },

  adicionarTransacao(tipo, valor, desc) {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR') + ' ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.state.transacoes.push({ tipo, valor, desc, data });
    this.salvar();
  },

  removerTransacao(index) {
    this.state.transacoes.splice(index, 1);
    this.salvar();
  },

  zerarTudo() {
    this.state = { diasAntigos: 0, datas: [], transacoes: [] };
    this.salvar();
  },

  // Total de dias trabalhados = dias antigos (contador) + dias marcados no calendário
  getDias() { return this.state.diasAntigos + this.state.datas.length; },

  calcSaldo() {
    let total = this.getDias() * DIARIA;
    this.state.transacoes.forEach(t => {
      total += t.tipo === 'entrada' ? t.valor : -t.valor;
    });
    return total;
  },

  calcEntradas() {
    let s = this.getDias() * DIARIA;
    this.state.transacoes.forEach(t => { if (t.tipo === 'entrada') s += t.valor; });
    return s;
  },

  calcSaidas() {
    let s = 0;
    this.state.transacoes.forEach(t => { if (t.tipo === 'saida') s += t.valor; });
    return s;
  },

  getTransacoes() { return this.state.transacoes; }
};
