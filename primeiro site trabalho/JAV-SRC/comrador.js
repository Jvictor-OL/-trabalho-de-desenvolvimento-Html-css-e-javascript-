// ---------------------------------------------------------------------
// 1. GERAÇÃO DINÂMICA DOS CAMPOS DO FORMULÁRIO
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // ----- (1.1) Identifica tipo de plano -----
  const url = new URLSearchParams(window.location.search);
  const plano = (url.get('tipo-plano') || 'individual').toLowerCase();

  const form = document.getElementById('form-comparador');
  const resultado = document.getElementById('resultado-comparador');

  // Limpa qualquer markup anterior
  form.innerHTML = '';

  // ----- (1.2) Define campos comuns a todos os planos -----
  const camposComuns = [
    { id: 'nome', label: 'Nome completo', tipo: 'text' },
    { id: 'email', label: 'E‑mail', tipo: 'email' },
    { id: 'telefone', label: 'Telefone', tipo: 'tel', placeholder: '(99) 99999‑9999' }
  ];

  // ----- (1.3) Campos específicos por tipo de plano -----
  const camposEspecificos = {
    individual: [
      { id: 'cpf', label: 'CPF', tipo: 'text' },
      { id: 'idade', label: 'Idade', tipo: 'number', min: 0 },
      { id: 'peso', label: 'Peso (kg)', tipo: 'number', min: 0, step: '0.1' },
      { id: 'altura', label: 'Altura (m)', tipo: 'number', min: 0, step: '0.01' },
      { id: 'sexo', label: 'Sexo', tipo: 'select', opcoes: [
          { value: 'M', text: 'Masculino' },
          { value: 'F', text: 'Feminino' },
          { value: 'O', text: 'Outro' }
        ] },
      { id: 'fumante', label: 'Fumante?', tipo: 'select', opcoes: [
          { value: 'nao', text: 'Não' },
          { value: 'sim', text: 'Sim' }
        ] },
      { id: 'atividade', label: 'Pratica atividade física?', tipo: 'select', opcoes: [
          { value: 'nao', text: 'Não' },
          { value: '1-2', text: '1‑2×/sem' },
          { value: '3+', text: '3+×/sem' }
        ] },
      { id: 'acomodacao', label: 'Tipo de acomodação', tipo: 'select', opcoes: [
          { value: 'enfermaria', text: 'Enfermaria' },
          { value: 'apartamento', text: 'Apartamento' }
        ] },
      { id: 'plano-odonto', label: 'Incluir plano odontológico', tipo: 'checkbox', required: false }
    ],
    familiar: [
      { id: 'qtd-membros', label: 'Número de pessoas', tipo: 'number', min: 1 },
      { id: 'media-idade', label: 'Idade média', tipo: 'number', min: 0 },
      { id: 'acomodacao', label: 'Tipo de acomodação', tipo: 'select', opcoes: [
          { value: 'enfermaria', text: 'Enfermaria' },
          { value: 'apartamento', text: 'Apartamento' }
        ] },
      { id: 'plano-odonto', label: 'Incluir plano odontológico', tipo: 'checkbox', required: false }
    ],
    empresarial: [
      { id: 'cnpj', label: 'CNPJ', tipo: 'text' },
      { id: 'ramo', label: 'Ramo de atividade', tipo: 'text' },
      { id: 'qtd-func', label: 'Número de funcionários', tipo: 'number', min: 1 },
      { id: 'media-idade', label: 'Idade média dos funcionários', tipo: 'number', min: 0 },
      { id: 'cidade', label: 'Cidade', tipo: 'text' },
      { id: 'estado', label: 'Estado', tipo: 'text' },
      { id: 'coparticipacao', label: 'Coparticipação?', tipo: 'select', opcoes: [
          { value: 'nao', text: 'Não' },
          { value: 'sim', text: 'Sim' }
        ] },
      { id: 'plano-odonto', label: 'Incluir plano odontológico', tipo: 'checkbox', required: false }
    ],
    mei: [
      { id: 'cpf', label: 'CPF', tipo: 'text' },
      { id: 'ramo', label: 'Ramo de atividade', tipo: 'text' },
      { id: 'idade', label: 'Idade do titular', tipo: 'number', min: 0 },
      { id: 'plano-odonto', label: 'Incluir plano odontológico', tipo: 'checkbox', required: false }
    ]
  };

  // ----- (1.4) Função auxiliar para criar campo -----
  function criarCampo(c) {
    const wrapper = document.createElement('div');
    wrapper.className = 'campo';

    const label = document.createElement('label');
    label.setAttribute('for', c.id);
    label.textContent = c.label;
    wrapper.appendChild(label);

    let input;
    if (c.tipo === 'select') {
      input = document.createElement('select');
      c.opcoes.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op.value;
        opt.textContent = op.text;
        input.appendChild(opt);
      });
    } else if (c.tipo === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
    } else {
      input = document.createElement('input');
      input.type = c.tipo;
      if (c.min !== undefined) input.min = c.min;
      if (c.step) input.step = c.step;
      if (c.placeholder) input.placeholder = c.placeholder;
    }
    input.id = c.id;
    input.name = c.id;
    input.required = c.required !== false; // default true
    wrapper.appendChild(input);

    form.appendChild(wrapper);
  }

  // ----- (1.5) Monta todos os campos -----
  [...camposComuns, ...camposEspecificos[plano]].forEach(criarCampo);

  // Botão de envio
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'cta-button';
  submitBtn.textContent = 'Comparar Planos';
  form.appendChild(submitBtn);

  // Mostra no topo qual plano está sendo comparado
  const tituloPlano = document.getElementById('titulo-plano');
  if (tituloPlano) {
    tituloPlano.textContent = `Simulação: Plano ${plano.charAt(0).toUpperCase() + plano.slice(1)}`;
  }

  // -----------------------------------------------------------------
  // 2. SUBMISSÃO E CÁLCULOS
  // -----------------------------------------------------------------

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Obtém todos os dados em um objeto
    const dados = Object.fromEntries(new FormData(form).entries());
    // Corrige checkbox (FormData devolve undefined quando desmarcado)
    Array.from(form.querySelectorAll('input[type="checkbox"]')).forEach(cb => {
      dados[cb.name] = cb.checked;
    });

    // ------------ 2.1 Extração de valores numéricos de interesse -------------
    // Idade
    const idade = +dados.idade || +dados['media-idade'] || 30; // fallback
    // Peso / altura podem não existir em alguns planos
    const peso = +dados.peso || null;
    const altura = +dados.altura || null;

    // ---------- 2.2 Validações mínimas ----------
    if (idade <= 0 || isNaN(idade)) {
      resultado.innerHTML = '<p class="erro">Informe uma idade válida.</p>';
      return;
    }

    if ((peso && !altura) || (!peso && altura)) {
      resultado.innerHTML = '<p class="erro">Para cálculo do IMC, informe peso <em>e</em> altura.</p>';
      return;
    }

    // ---------- 2.3 Cálculo do IMC / fator de risco ----------
    const imcReal = peso && altura ? peso / (altura * altura) : 23; // IMC médio se não informado
    const fatorRisco = calcularFatorRisco(imcReal);

    // ---------- 2.4 Geração de planos ----------
    const planosA = calcularPlanosOperadoraA(idade, imcReal);
    const planosB = calcularPlanosOperadoraB(fatorRisco, imcReal);
    const todosPlanos = [...planosA, ...planosB];
    const maisBarato = todosPlanos.reduce((min, p) => (p.preco < min.preco ? p : min));

    // Métricas de qualidade 
    todosPlanos.forEach(planoObj => {
      planoObj.qualidade = calcularQualidade(planoObj, idade, imcReal);
      planoObj.tooltip = gerarTooltip(planoObj.nome);
    });

    exibirResultados(planosA, planosB, maisBarato, todosPlanos);
  });
});

// -----------------------------------------------------------------
// 3. FUNÇÕES AUXILIARES
// -----------------------------------------------------------------
function calcularFatorRisco(imc) {
  if (imc < 18.5) return 10;
  if (imc < 25) return 1;
  if (imc < 30) return 6;
  if (imc < 35) return 10;
  if (imc < 40) return 20;
  return 30;
}

function calcularPlanosOperadoraA(idade, imc) {
  const base = 80 + idade * 6 + imc * 7;
  return [
    { nome: 'Básico', preco: base, operadora: 'A' },
    { nome: 'Standard', preco: base * 1.7, operadora: 'A' },
    { nome: 'Premium', preco: base * 2.6, operadora: 'A' }
  ];
}

function calcularPlanosOperadoraB(fator, imc) {
  const base = 100 + fator * 12 + imc * 6;
  return [
    { nome: 'Básico', preco: base, operadora: 'B' },
    { nome: 'Standard', preco: base * 1.5, operadora: 'B' },
    { nome: 'Premium', preco: base * 2.3, operadora: 'B' }
  ];
}

function calcularQualidade(plano, idade, imc) {
  const score = 5 - plano.preco / (idade * 100 * imc);
  return Math.min(5, Math.max(1, Math.round(score)));
}

function gerarTooltip(nomePlano) {
  return nomePlano.includes('Premium')
    ? 'Cobertura completa'
    : nomePlano.includes('Standard')
    ? 'Cobertura média'
    : 'Cobertura básica';
}

// --------------------------- RENDERIZAÇÃO ---------------------------
function exibirResultados(planosA, planosB, maisBarato, todosPlanos) {
  const resultado = document.getElementById('resultado-comparador');
  resultado.innerHTML = `
    <h3>Resultado da Comparação</h3>
    <div class="grafico-container">
      <canvas id="graficoPlanos"></canvas>
    </div>
    <div class="tabelas-comparativas">
      ${gerarTabelaOperadora(planosA, 'A')}
      ${gerarTabelaOperadora(planosB, 'B')}
    </div>
    <p class="destaque">
      <strong>Plano mais vantajoso:</strong>
      ${maisBarato.operadora} - ${maisBarato.nome}
      <span class="qualidade-estrelas">
        ${'⭐'.repeat(maisBarato.qualidade)}${'☆'.repeat(5 - maisBarato.qualidade)}
      </span>
      por R$ ${maisBarato.preco.toFixed(2)}
      <span class="tooltip">ℹ️
        <span class="tooltiptext">${maisBarato.tooltip}</span>
      </span>
    </p>
    <div class="economia">
      <h4>Economia anual: R$ ${calcularEconomiaAnual(todosPlanos, maisBarato)}</h4>
    </div>
    <button id="exportarBtn" class="cta-button secundario">Exportar PDF</button>
  `;

  inicializarGrafico(todosPlanos);
  document.getElementById('exportarBtn').addEventListener('click', () => exportarPDF(todosPlanos));
}

function gerarTabelaOperadora(planos, operadora) {
  return `
    <div class="tabela-container">
      <h4>Operadora ${operadora}</h4>
      <table>
        <thead>
          <tr>
            <th>Plano</th>
            <th>Preço</th>
            <th>Qualidade</th>
          </tr>
        </thead>
        <tbody>
          ${planos
            .map(
              p => `
            <tr>
              <td>${p.nome}</td>
              <td>R$ ${p.preco.toFixed(2)}</td>
              <td class="qualidade-estrelas">
                ${'⭐'.repeat(p.qualidade)}${'☆'.repeat(5 - p.qualidade)}
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function calcularEconomiaAnual(planos, maisBarato) {
  const maisCaro = planos.reduce((max, p) => (p.preco > max.preco ? p : max));
  return ((maisCaro.preco - maisBarato.preco) * 12).toFixed(2);
}

function inicializarGrafico(planos) {
  new Chart(document.getElementById('graficoPlanos'), {
    type: 'bar',
    data: {
      labels: planos.map(p => `${p.operadora} - ${p.nome}`),
      datasets: [
        {
          label: 'Preço Mensal (R$)',
          data: planos.map(p => p.preco),
          backgroundColor: planos.map(p => (p.operadora === 'A' ? '#4299e1' : '#667eea')),
          borderColor: planos.map(p => (p.operadora === 'A' ? '#2b6cb0' : '#4c51bf')),
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Valor (R$)' }
        }
      }
    }
  });
}

function exportarPDF(planos) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Comparação de Planos de Saúde', 10, 20);

  doc.setFontSize(12);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 10, 30);

  doc.autoTable({
    startY: 40,
    head: [['Operadora', 'Plano', 'Preço Mensal', 'Qualidade']],
    body: planos.map(p => [p.operadora, p.nome, `R$ ${p.preco.toFixed(2)}`, '⭐'.repeat(p.qualidade)]),
    styles: { cellPadding: 5, fontSize: 10, valign: 'middle' },
    columnStyles: { 3: { cellWidth: 30 } }
  });

  doc.save('comparacao_planos.pdf');
}

// -----------------------------------------------------------------
// 4. MODO ESCURO 
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle-btn';
  document.body.appendChild(toggleBtn);

  const iconeSol = '☀️';
  const iconeLua = '🌙';

  const temaSalvo = localStorage.getItem('tema');
  const isDark = temaSalvo === 'dark';
  if (isDark) {
    document.body.classList.add('dark-theme');
    toggleBtn.innerHTML = iconeSol;
  } else {
    toggleBtn.innerHTML = iconeLua;
  }

  toggleBtn.addEventListener('click', () => {
    const ativo = document.body.classList.toggle('dark-theme');
    toggleBtn.innerHTML = ativo ? iconeSol : iconeLua;
    localStorage.setItem('tema', ativo ? 'dark' : 'light');
  });
});
