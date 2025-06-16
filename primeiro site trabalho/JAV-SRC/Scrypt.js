// Alternar Tema
document.addEventListener('DOMContentLoaded', () => {
  // Cria botão dinamicamente
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle-btn';
  document.body.appendChild(toggleBtn);

  const iconSun = '☀️';
  const iconMoon = '🌙';

  // Aplica tema salvo
  const temaSalvo = localStorage.getItem('tema');
  const isDark = temaSalvo === 'dark';
  if (isDark) {
    document.body.classList.add('dark-theme');
    toggleBtn.innerHTML = iconSun;
  } else {
    toggleBtn.innerHTML = iconMoon;
  }

  // Alternância de tema
  toggleBtn.addEventListener('click', () => {
    const ativo = document.body.classList.toggle('dark-theme');
    toggleBtn.innerHTML = ativo ? iconSun : iconMoon;
    localStorage.setItem('tema', ativo ? 'dark' : 'light');
  });
});

// Cabeçalho Hamburgue
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            // Alterna o menu
            menu.classList.toggle('show');
            
            // Animação do hambúrguer
            toggle.classList.toggle('active');
            
            // Acessibilidade
            const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Fecha o menu ao clicar em um link
        document.querySelectorAll('#menu a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('show');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    } else {
        console.error('Elementos do menu não encontrados!');
    }
});

// Faq
// Agora cada FAQ expande independentemente
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
  const question = item.querySelector('.faq-question');

  question.addEventListener('mouseenter', () => {
    item.classList.add('active');
  });

  question.addEventListener('mouseleave', () => {
    item.classList.remove('active');
  });
});


// Planos Hover Effect
document.addEventListener('DOMContentLoaded', function () {
  const planos = document.querySelectorAll('.plano');

  planos.forEach(plano => {
    plano.addEventListener('mouseenter', () => {
      plano.classList.add('expandido');
    });

    plano.addEventListener('mouseleave', () => {
      plano.classList.remove('expandido');
    });
  });
});
// Melhora a experiência em touch devices
document.querySelectorAll('.plano').forEach(plano => {
    plano.addEventListener('touchstart', function() {
        this.classList.add('active');
    });
    
    plano.addEventListener('touchend', function() {
        this.classList.remove('active');
    });
});
