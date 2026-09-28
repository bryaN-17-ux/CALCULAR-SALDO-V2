// ============================================================
// CONTROLLER — conecta Model e View, responde aos eventos
// ============================================================

const FinanceController = {

  // Mês exibido no calendário
  mes: new Date().getMonth(),
  ano: new Date().getFullYear(),

  init() {
    // Vincula os botões principais
    document.getElementById('cal-prev').addEventListener('click', () => this.mudarMes(-1));
    document.getElementById('cal-next').addEventListener('click', () => this.mudarMes(1));
    document.getElementById('btn-entrada').addEventListener('click', () => this.registrar('entrada'));
    document.getElementById('btn-saida').addEventListener('click', () => this.registrar('saida'));
    document.getElementById('btn-zerar').addEventListener('click', () => this.zerarTudo());

    // Renderiza o estado inicial (dados do localStorage já carregados no Model)
    this.render();
  },

  render() {
    FinanceView.renderSaldo(FinanceModel.calcSaldo());
    FinanceView.renderDiasInfo(FinanceModel.getDias());
    FinanceView.renderTotais(FinanceModel.calcEntradas(), FinanceModel.calcSaidas());
    FinanceView.renderCalendario(this.ano, this.mes, FinanceModel.state.datas, FinanceModel.hojeISO(),
      FinanceModel.diasNoMes(this.ano, this.mes), (iso) => this.alternarDia(iso));
    FinanceView.renderHistorico(FinanceModel.getTransacoes(), (i) => this.remover(i));
  },

  alternarDia(iso) {
    FinanceModel.alternarDia(iso);
    this.render();
  },

  mudarMes(delta) {
    this.mes += delta;
    if (this.mes < 0) { this.mes = 11; this.ano--; }
    if (this.mes > 11) { this.mes = 0; this.ano++; }
    this.render();
  },

  registrar(tipo) {
    const desc = FinanceView.getDescricao();
    const raw = FinanceView.getValor();

    if (isNaN(raw) || raw <= 0) {
      FinanceView.focarInputValor();
      return;
    }

    const valor = Math.round(raw * 100) / 100;
    FinanceModel.adicionarTransacao(tipo, valor, desc);
    FinanceView.limparInputs();
    this.render();
  },

  remover(i) {
    if (!confirm('Remover este lançamento?')) return;
    FinanceModel.removerTransacao(i);
    this.render();
  },

  zerarTudo() {
    if (!confirm('Tem certeza que quer zerar tudo? Isso apaga os dias e todo o histórico.')) return;
    FinanceModel.zerarTudo();
    this.render();
  }
};

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => FinanceController.init());