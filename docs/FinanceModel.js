// ============================================================
// MODEL — dados, regras de negócio e persistência (localStorage)
// ============================================================

const DIARIA = 50;                  // valor de cada dia trabalhado (em reais)
const STORAGE_KEY = 'pai_controle'; // mesma chave de sempre: os dados antigos continuam valendo

const pad = n => String(n).padStart(2, '0');
const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;   // AAAA-MM-DD

function estadoPadrao() {
  return { diasAntigos: 0, datas: [], transacoes: [] };
}

// Lê o localStorage com segurança: se estiver vazio, corrompido ou bloqueado, começa do zero
// em vez de quebrar a página inteira.
function carregarEstado() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!s || typeof s !== 'object') return estadoPadrao();

    // Versão antiga guardava só um contador chamado "dias" (botão +1 dia).
    // Ele vira "diasAntigos" e continua somando no total, então nenhum dia se perde.
    const antigos = Math.floor(Number(s.diasAntigos ?? s.dias ?? 0));

    // Só aceita datas no formato certo, sem repetidas, em ordem
    const datas = Array.isArray(s.datas)
      ? [...new Set(s.datas.filter(d => typeof d === 'string' && DATA_VALIDA.test(d)))].sort()
      : [];

    const transacoes = Array.isArray(s.transacoes)
      ? s.transacoes.filter(t => t && (t.tipo === 'entrada' || t.tipo === 'saida') && Number.isFinite(t.valor))
      : [];

    return { diasAntigos: antigos > 0 ? antigos : 0, datas, transacoes };
  } catch (e) {
    return estadoPadrao();
  }
}

const FinanceModel = {

  state: carregarEstado(),

  // Salva no navegador. Retorna false se não conseguiu (ex.: armazenamento bloqueado ou cheio)
  salvar() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      return true;
    } catch (e) {
      return false;
    }
  },

  // ---------- Datas (sempre no fuso local, formato AAAA-MM-DD) ----------

  // mes vai de 0 (janeiro) a 11 (dezembro), igual ao JavaScript
  iso(ano, mes, dia) { return `${ano}-${pad(mes + 1)}-${pad(dia)}`; },

  hojeISO() {
    const d = new Date();
    return this.iso(d.getFullYear(), d.getMonth(), d.getDate());
  },

  // ---------- Calendário: dias trabalhados ----------

  getDatas() { return this.state.datas; },

  temDia(iso) { return this.state.datas.includes(iso); },

  // Clicou num dia: marca se estava livre, desmarca se já estava marcado.
  // Retorna true se o dia ficou marcado, false se foi desmarcado (ou se a data era inválida).
  alternarDia(iso) {
    if (!DATA_VALIDA.test(iso)) return false;
    const i = this.state.datas.indexOf(iso);
    let marcado;
    if (i === -1) {
      this.state.datas.push(iso);
      this.state.datas.sort();
      marcado = true;
    } else {
      this.state.datas.splice(i, 1);
      marcado = false;
    }
    this.salvar();
    return marcado;
  },

  // Quantos dias foram trabalhados num mês (mes de 0 a 11)
  diasNoMes(ano, mes) {
    const prefixo = `${ano}-${pad(mes + 1)}-`;
    return this.state.datas.filter(d => d.startsWith(prefixo)).length;
  },

  // Total de dias trabalhados = dias do contador antigo + dias marcados no calendário
  getDias() { return this.state.diasAntigos + this.state.datas.length; },

  // ---------- Movimentações ----------

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

  getTransacoes() { return this.state.transacoes; },

  zerarTudo() {
    this.state = estadoPadrao();
    this.salvar();
  },

  // ---------- Cálculos financeiros ----------

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
  }
};