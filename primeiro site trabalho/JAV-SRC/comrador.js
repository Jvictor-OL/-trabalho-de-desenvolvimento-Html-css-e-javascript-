// js/comparador.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-comparador');
  const resultado = document.getElementById('resultado-comparador');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Obter valores do formulário
    const idade = parseInt(document.getElementById('idade').value);
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);

    // 2. Validar entradas
    if (isNaN(idade) || isNaN(peso) || isNaN(altura) || altura === 0) {
      resultado.innerHTML = '<p class="erro">Preencha todos os campos corretamente</p>';
      return;
    }

    // 3. Calcular IMC e fator de risco
    const imc = peso / (altura * altura);
    const fator = calcularFatorRisco(imc);

    // 4. Calcular planos
    const planosA = calcularPlanosOperadoraA(idade, imc);
    const planosB = calcularPlanosOperadoraB(fator, imc);
    const todosPlanos = [...planosA, ...planosB];
    const maisBarato = todosPlanos.reduce((min, p) => p.preco < min.preco ? p : min);

    // 5. Adicionar métricas de qualidade
    todosPlanos.forEach(plano => {
      plano.qualidade = calcularQualidade(plano, idade, imc);
      plano.tooltip = gerarTooltip(plano.nome);
    });

    // 6. Exibir resultados
    exibirResultados(planosA, planosB, maisBarato, todosPlanos);
  });

  // Funções auxiliares
  function calcularFatorRisco(imc) {
    if (imc < 18.5) return 10;
    if (imc < 25) return 1;
    if (imc < 30) return 6;
    if (imc < 35) return 10;
    if (imc < 40) return 20;
    return 30;
  }

  function calcularPlanosOperadoraA(idade, imc) {
    const base = 80 + (idade * 6) + (imc * 7);
    return [
      { nome: "Básico", preco: base, operadora: "A" },
      { nome: "Standard", preco: base * 1.7, operadora: "A" },
      { nome: "Premium", preco: base * 2.6, operadora: "A" }
    ];
  }

  function calcularPlanosOperadoraB(fator, imc) {
    const base = 100 + (fator * 12) + (imc * 6);
    return [
      { nome: "Básico", preco: base, operadora: "B" },
      { nome: "Standard", preco: base * 1.5, operadora: "B" },
      { nome: "Premium", preco: base * 2.3, operadora: "B" }
    ];
  }

  function calcularQualidade(plano, idade, imc) {
    const score = 5 - (plano.preco / (idade * 100 * imc));
    return Math.min(5, Math.max(1, Math.round(score)));
  }

  function gerarTooltip(nomePlano) {
    return nomePlano.includes('Premium') ? 'Cobertura completa' : 
           nomePlano.includes('Standard') ? 'Cobertura média' : 'Cobertura básica';
  }

  function exibirResultados(planosA, planosB, maisBarato, todosPlanos) {
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

    // Inicializar gráfico
    inicializarGrafico(todosPlanos);
    
    // Configurar botão de exportação
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
            ${planos.map(plano => `
              <tr>
                <td>${plano.nome}</td>
                <td>R$ ${plano.preco.toFixed(2)}</td>
                <td class="qualidade-estrelas">
                  ${'⭐'.repeat(plano.qualidade)}${'☆'.repeat(5 - plano.qualidade)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function calcularEconomiaAnual(planos, maisBarato) {
    const maisCaro = planos.reduce((max, p) => p.preco > max.preco ? p : max);
    return ((maisCaro.preco - maisBarato.preco) * 12).toFixed(2);
  }

  function inicializarGrafico(planos) {
    new Chart(document.getElementById('graficoPlanos'), {
      type: 'bar',
      data: {
        labels: planos.map(p => `${p.operadora} - ${p.nome}`),
        datasets: [{
          label: 'Preço Mensal (R$)',
          data: planos.map(p => p.preco),
          backgroundColor: planos.map(p => p.operadora === 'A' ? '#4299e1' : '#667eea'),
          borderColor: planos.map(p => p.operadora === 'A' ? '#2b6cb0' : '#4c51bf'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor (R$)'
            }
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
    
    // Tabela de planos
    doc.autoTable({
      startY: 40,
      head: [['Operadora', 'Plano', 'Preço Mensal', 'Qualidade']],
      body: planos.map(p => [
        p.operadora,
        p.nome,
        `R$ ${p.preco.toFixed(2)}`,
        '⭐'.repeat(p.qualidade)
      ]),
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle'
      },
      columnStyles: {
        3: { cellWidth: 30 }
      }
    });
    
    doc.save('comparacao_planos.pdf');
  }
});

// modo escuro
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle-btn';
  document.body.appendChild(toggleBtn);

  // Ícones
  const iconeSol = '☀️';
  const iconeLua = '🌙';

  // Aplica o tema salvo
  const temaSalvo = localStorage.getItem('tema');
  const isDark = temaSalvo === 'dark';
  if (isDark) {
    document.body.classList.add('dark-theme');
    toggleBtn.innerHTML = iconeSol;
  } else {
    toggleBtn.innerHTML = iconeLua;
  }

  // Alternância de tema
  toggleBtn.addEventListener('click', () => {
    const isAtivo = document.body.classList.toggle('dark-theme');
    toggleBtn.innerHTML = isAtivo ? iconeSol : iconeLua;
    localStorage.setItem('tema', isAtivo ? 'dark' : 'light');
  });
});
