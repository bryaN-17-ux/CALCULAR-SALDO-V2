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
    document.getElementById('dias-total').textContent = dias;
    document.getElementById('dias-info').textContent =
      dias + ' dia' + (plural ? 's' : '') +
      ' trabalhado' + (plural ? 's' : '') +
      ' · R$ 50,00/dia';
  },

  renderCalendario(ano, mes, datas, hojeISO, diasNoMes, onToggle) {
    const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const pad = n => String(n).padStart(2, '0');
    const primeiro = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();

    let html = '<span></span>'.repeat(primeiro);
    for (let d = 1; d <= total; d++) {
      const iso = `${ano}-${pad(mes + 1)}-${pad(d)}`;
      const trab = datas.includes(iso);
      html += `<button class="cal-dia${trab ? ' trab' : ''}${iso === hojeISO ? ' hoje' : ''}" data-iso="${iso}" aria-pressed="${trab}">${d}</button>`;
    }
    const grid = document.getElementById('cal-grid');
    grid.innerHTML = html;
    grid.querySelectorAll('.cal-dia').forEach(b => b.addEventListener('click', () => onToggle(b.dataset.iso)));

    document.getElementById('cal-titulo').textContent = `${MESES[mes]} de ${ano}`;
    document.getElementById('cal-info').textContent =
      `${diasNoMes} dia${diasNoMes !== 1 ? 's' : ''} trabalhado${diasNoMes !== 1 ? 's' : ''} neste mês · clique num dia para marcar ou desmarcar`;
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
