// ============================================================
// VIEW — renderização da interface, sem lógica de negócio
// ============================================================

const FinanceView = {

  meses: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],

  // ---------- Utilitários ----------

  fmt(v) {
    const n = Number.isFinite(v) ? v : 0;
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  // "1 dia" / "2 dias"
  plural(n, singular, plural) {
    return n + ' ' + (n === 1 ? singular : plural);
  },

  // Impede que texto digitado (ex.: <b>, <script>) seja interpretado como HTML
  esc(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  // ---------- Saldo e contadores ----------

  renderSaldo(saldo) {
    const el = document.getElementById('saldo-display');
    el.textContent = this.fmt(saldo);
    el.className = 'saldo-valor ' + (saldo >= 0 ? 'positivo' : 'negativo');
  },

  // Contador total de dias trabalhados (selo grande + linha abaixo do saldo)
  renderDiasInfo(dias, diaria = 50) {
    document.getElementById('dias-total').textContent = dias;
    document.getElementById('dias-info').textContent =
      dias + (dias === 1 ? ' dia trabalhado' : ' dias trabalhados') + ' · ' + this.fmt(diaria) + '/dia';
  },

  renderTotais(entradas, saidas) {
    document.getElementById('total-entradas').textContent = this.fmt(entradas);
    document.getElementById('total-saidas').textContent = this.fmt(saidas);
  },

  // ---------- Calendário ----------
  // mes vai de 0 a 11; datas é a lista de dias trabalhados (AAAA-MM-DD);
  // onToggle(iso) é chamado quando o usuário clica (ou aperta Enter) num dia.
  renderCalendario(ano, mes, datas, hojeISO, diasNoMes, onToggle) {
    const grid = document.getElementById('cal-grid');
    const pad = n => String(n).padStart(2, '0');
    const trabalhados = new Set(datas);
    const primeiro = new Date(ano, mes, 1).getDay();      // 0 = domingo
    const total = new Date(ano, mes + 1, 0).getDate();    // dias do mês

    // Lembra qual dia estava com o foco do teclado, pois redesenhar apaga os botões
    const focoIso = grid.contains(document.activeElement) ? document.activeElement.dataset.iso : null;

    let html = '<span aria-hidden="true"></span>'.repeat(primeiro);
    for (let d = 1; d <= total; d++) {
      const iso = `${ano}-${pad(mes + 1)}-${pad(d)}`;
      const trab = trabalhados.has(iso);
      const rotulo = `${d} de ${this.meses[mes]} de ${ano}${trab ? ', trabalhado' : ''}`;
      html += `<button type="button" class="cal-dia${trab ? ' trab' : ''}${iso === hojeISO ? ' hoje' : ''}"` +
              ` data-iso="${iso}" aria-pressed="${trab}" aria-label="${rotulo}">${d}</button>`;
    }
    grid.innerHTML = html;

    // Um único ouvinte para o calendário inteiro (não acumula a cada redesenho)
    grid.onclick = (e) => {
      const btn = e.target.closest('.cal-dia');
      if (btn) onToggle(btn.dataset.iso);
    };

    if (focoIso) {
      const btn = grid.querySelector(`[data-iso="${focoIso}"]`);
      if (btn) btn.focus();
    }

    document.getElementById('cal-titulo').textContent = `${this.meses[mes]} de ${ano}`;
    document.getElementById('cal-info').textContent =
      `${this.plural(diasNoMes, 'dia trabalhado', 'dias trabalhados')} neste mês · clique num dia para marcar ou desmarcar`;
  },

  // ---------- Histórico ----------

  renderHistorico(transacoes, onRemover) {
    const lista = document.getElementById('historico');

    lista.onclick = (e) => {
      const btn = e.target.closest('.btn-remover');
      if (btn) onRemover(Number(btn.dataset.index));
    };

    if (transacoes.length === 0) {
      lista.innerHTML = '<li class="vazio">Nenhuma movimentação registrada ainda.</li>';
      return;
    }

    // Mostra da mais recente para a mais antiga, mas guarda o índice real de cada uma
    lista.innerHTML = [...transacoes].reverse().map((t, ri) => {
      const i = transacoes.length - 1 - ri;
      const desc = this.esc(t.desc) || 'Sem descrição';
      const entrada = t.tipo === 'entrada';
      return `<li class="historico-item">
        <span class="desc">${desc}</span>
        <span class="data">${this.esc(t.data)}</span>
        <span class="${entrada ? 'val-pos' : 'val-neg'}">
          ${entrada ? '+' : '-'}${this.fmt(t.valor)}
        </span>
        <button type="button" class="btn-remover" data-index="${i}" aria-label="Remover lançamento: ${desc}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </li>`;
    }).join('');
  },

  // ---------- Formulário ----------

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