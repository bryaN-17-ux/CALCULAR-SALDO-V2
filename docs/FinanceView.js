// ============================================================
// VIEW — renderização da interface, sem lógica de negócio
// ============================================================

const FinanceView = {

  fmt(v) {
    return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  renderSaldo(saldo) {
    const el = document.getElementById('saldo-display');
    el.textContent = this.fmt(saldo);
    el.className = 'saldo-valor ' + (saldo >= 0 ? 'positivo' : 'negativo');
  },

  renderDiasInfo(dias) {
    const plural = dias !== 1;
    document.getElementById('dias-info').textContent =
      dias + ' dia' + (plural ? 's' : '') +
      ' trabalhado' + (plural ? 's' : '') +
      ' · R$ 50,00/dia';
  },

  renderTotais(entradas, saidas) {
    document.getElementById('total-entradas').textContent = this.fmt(entradas);
    document.getElementById('total-saidas').textContent = this.fmt(saidas);
  },

  renderHistorico(transacoes, onRemover) {
    const lista = document.getElementById('historico');

    if (transacoes.length === 0) {
      lista.innerHTML = '<li class="vazio">Nenhuma movimentação registrada ainda.</li>';
      return;
    }

    lista.innerHTML = [...transacoes].reverse().map((t, ri) => {
      const i = transacoes.length - 1 - ri;
      return `<li class="historico-item">
        <span class="desc">${t.desc || 'Sem descrição'}</span>
        <span class="data">${t.data}</span>
        <span class="${t.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">
          ${t.tipo === 'entrada' ? '+' : '-'}${this.fmt(t.valor)}
        </span>
        <button class="btn-remover" data-index="${i}" aria-label="Remover lançamento">
          <i class="ti ti-x"></i>
        </button>
      </li>`;
    }).join('');

    // Vincula eventos dos botões de remover após renderizar
    lista.querySelectorAll('.btn-remover').forEach(btn => {
      btn.addEventListener('click', () => onRemover(Number(btn.dataset.index)));
    });
  },

  limparInputs() {
    document.getElementById('desc-input').value = '';
    document.getElementById('valor-input').value = '';
  },

  focarInputValor() {
    document.getElementById('valor-input').focus();
  },

  getDescricao() {
    return document.getElementById('desc-input').value.trim();
  },

  getValor() {
    return parseFloat(document.getElementById('valor-input').value);
  }
};
