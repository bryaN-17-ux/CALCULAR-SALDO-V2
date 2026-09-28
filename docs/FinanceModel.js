// ============================================================
// MODEL — dados, regras de negócio e persistência (localStorage)
// ============================================================

const DIARIA = 50;
const STORAGE_KEY = 'pai_controle';

const FinanceModel = {

  // Carrega o estado do localStorage (mantém dados já existentes)
  state: JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || {
    dias: 0,
    transacoes: []
  },

  salvar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  adicionarDia() {
    this.state.dias++;
    this.salvar();
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
    this.state = { dias: 0, transacoes: [] };
    this.salvar();
  },

  // Cálculos financeiros
  calcSaldo() {
    let total = this.state.dias * DIARIA;
    this.state.transacoes.forEach(t => {
      total += t.tipo === 'entrada' ? t.valor : -t.valor;
    });
    return total;
  },

  calcEntradas() {
    let s = this.state.dias * DIARIA;
    this.state.transacoes.forEach(t => { if (t.tipo === 'entrada') s += t.valor; });
    return s;
  },

  calcSaidas() {
    let s = 0;
    this.state.transacoes.forEach(t => { if (t.tipo === 'saida') s += t.valor; });
    return s;
  },

  getDias() { return this.state.dias; },
  getTransacoes() { return this.state.transacoes; }
};
