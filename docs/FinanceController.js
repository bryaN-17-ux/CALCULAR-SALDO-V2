// ============================================================
// CONTROLLER — conecta Model e View, responde aos eventos
// ============================================================

const FinanceController = {

  init() {
    // Vincula os botões principais
    document.getElementById('btn-dia').addEventListener('click', () => this.adicionarDia());
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
    FinanceView.renderHistorico(FinanceModel.getTransacoes(), (i) => this.remover(i));
  },

  adicionarDia() {
    FinanceModel.adicionarDia();
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
