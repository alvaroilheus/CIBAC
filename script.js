/* ============================================================
   SENAI SANTOS DUMONT — REVISTA DIGITAL
   Arquivo: script.js
   Descrição: Lógica de interatividade e animações da publicação
   
   MÓDULOS:
   1. Cursor Customizado
   2. Barra de Progresso de Leitura
   3. Navegação (scroll + hamburger mobile)
   4. Partículas de Fundo
   5. IntersectionObserver (animações de entrada)
   6. Modal de Artigo
   7. Contador Animado (estatísticas)
   8. Newsletter (simulação de envio)
   ============================================================ */

'use strict';
/* ──────────────────────────────────────────────
   2. BARRA DE PROGRESSO DE LEITURA
   Indica quanto o usuário já rolou a página
──────────────────────────────────────────────── */
(function initReadingProgress() {
  const bar = document.getElementById('reading-progress');
  if (!bar) return;

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.body.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width    = Math.min(progress, 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();


/* ──────────────────────────────────────────────
   3. NAVEGAÇÃO
   a) Efeito de blur/sombra ao rolar
   b) Menu hamburguer mobile
──────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');

  /* Efeito scrolled na navbar */
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* Menu hamburguer: abre/fecha */
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      /* Acessibilidade: aria-expanded */
      toggle.setAttribute('aria-expanded', isOpen);

      /* Animar as linhas do hamburguer → X */
      const spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    /* Fecha menu ao clicar em um link */
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', false);
        toggle.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity   = '';
        });
      });
    });
  }
})();


/* ──────────────────────────────────────────────
   4. PARTÍCULAS DE FUNDO
   Canvas com pontos animados conectados por linhas
   (efeito "teia neural" futurista)
──────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* === CONFIGURAÇÕES DAS PARTÍCULAS (editar aqui) === */
  const CONFIG = {
    count:        60,    /* número de partículas */
    maxRadius:    2.5,   /* tamanho máximo das partículas */
    speed:        0.4,   /* velocidade de movimento */
    connectDist:  150,   /* distância máxima para conectar */
    colorPrimary: '255, 128, 0',   /* Laranja (RGB) */
    colorAccent:  '0, 212, 255',   /* Ciano (RGB) */
  };

  let particles = [];

  /* Ajusta canvas ao tamanho da janela */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /* Cria partícula com propriedades aleatórias */
  function createParticle() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * CONFIG.speed * 2,
      vy: (Math.random() - 0.5) * CONFIG.speed * 2,
      r:  Math.random() * CONFIG.maxRadius + 0.5,
      /* alterna entre cor primária e acento */
      color: Math.random() > 0.5 ? CONFIG.colorPrimary : CONFIG.colorAccent,
    };
  }

  /* Inicializa array de partículas */
  function initParticlesArray() {
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  /* Loop de animação principal */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      /* Move a partícula */
      p.x += p.vx;
      p.y += p.vy;

      /* Rebate nas bordas */
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      /* Desenha a partícula */
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, 0.6)`;
      ctx.fill();

      /* Conecta com partículas próximas */
      for (let j = i + 1; j < particles.length; j++) {
        const q    = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);

        if (dist < CONFIG.connectDist) {
          const opacity = (1 - dist / CONFIG.connectDist) * 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${p.color}, ${opacity})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  }

  /* Inicializa e inicia */
  resize();
  initParticlesArray();
  animate();

  window.addEventListener('resize', () => {
    resize();
    initParticlesArray();
  });
})();


/* ──────────────────────────────────────────────
   5. INTERSECTION OBSERVER — Animações de Entrada
   Observa elementos com a classe .animate-on-scroll
   e adiciona .visible quando entram no viewport
──────────────────────────────────────────────── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          /* Para de observar após animar (performance) */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,  /* elemento precisa ter 12% visível */
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   6. MODAL DE ARTIGO EXPANDIDO
   Abre um modal fullscreen com o conteúdo completo
   do artigo quando o usuário clica em um card
──────────────────────────────────────────────── */
(function initModal() {
  const overlay     = document.getElementById('article-modal');
  const closeBtn    = document.getElementById('modal-close-btn');
  const modalTitle  = document.getElementById('modal-title');
  const modalBody   = document.getElementById('modal-body');

  if (!overlay) return;

  /* 
    DADOS DOS ARTIGOS — Editar aqui para substituir conteúdo fictício
    Cada objeto representa um artigo completo
    Adicionar/remover artigos conforme necessário
  */
  const articles = {
    /* Artigo 1 — Formação Técnica */
    'art-1': {
      title: 'SENAI Forma Nova Turma em Mecatrônica com Foco em Indústria 4.0',
      category: 'Formação Técnica',
      author: 'Equipe Editorial SENAI',
      date: '25 Mar 2026',
      /* Editar: substituir pelo texto completo do artigo */
      content: `
        <p class="dropcap">A unidade SENAI Santos Dumont concluiu mais uma turma do curso técnico em Mecatrônica, 
        com ênfase especial em tecnologias da Indústria 4.0. Os 32 formandos desenvolveram projetos práticos 
        que incluem automação de processos, programação de CLPs e integração de sistemas IoT.</p>
        
        <p>"O mercado de trabalho em São José dos Campos é extremamente competitivo e exigente. 
        Nossos alunos saem daqui prontos para atuar no polo tecnológico da região", afirmou 
        a coordenadora pedagógica.</p>
        
        <blockquote class="article-quote">
          <p>"A educação técnica de qualidade é o caminho mais rápido para a inserção no mercado de trabalho."</p>
          <cite>— Coordenadora do Curso de Mecatrônica</cite>
        </blockquote>
        
        <p>Entre os projetos desenvolvidos pelos alunos, destaca-se um braço robótico de baixo custo 
        controlado por visão computacional, que já despertou interesse de empresas parceiras da unidade. 
        O protótipo utiliza componentes de código aberto e pode ser reproduzido por menos de R$ 2.000.</p>
        
        <p>A próxima turma tem início previsto para maio de 2026, com vagas limitadas. 
        As inscrições estão abertas no portal da instituição.</p>
      `,
    },

    /* Artigo 2 — Inovação & Tecnologia */
    'art-2': {
      title: 'Laboratório de IoT do SENAI Santos Dumont Recebe Equipamentos de Última Geração',
      category: 'Inovação & Tecnologia',
      author: 'Redação',
      date: '18 Mar 2026',
      /* Editar: substituir pelo texto completo do artigo */
      content: `
        <p class="dropcap">O laboratório de Internet das Coisas (IoT) da unidade recebeu um investimento 
        de R$ 380.000 em novos equipamentos, transformando o espaço em um dos mais modernos da rede 
        SENAI no Estado de São Paulo.</p>
        
        <p>Os novos equipamentos incluem kits de desenvolvimento de edge computing, sensores industriais 
        de precisão, painéis solares para projetos de energia renovável e uma estação de manufatura 
        aditiva com impressão 3D de metais.</p>
        
        <blockquote class="article-quote">
          <p>"Com essa estrutura, nossos alunos têm contato com a mesma tecnologia usada nas grandes indústrias do Vale do Paraíba."</p>
          <cite>— Diretor da Unidade SENAI Santos Dumont</cite>
        </blockquote>
        
        <p>O espaço já está disponível para uso pelos alunos de todos os cursos técnicos da unidade, 
        além de servir como hub de inovação para empresas parceiras que buscam desenvolver projetos 
        de automação industrial.</p>
      `,
    },

    /* Artigo 3 — Projetos & Parceiros */
    'art-3': {
      title: 'Parceria com Embraer Amplia Oportunidades de Estágio para Alunos',
      category: 'Projetos & Parceiros',
      author: 'Departamento de Relacionamento Empresarial',
      date: '10 Mar 2026',
      /* Editar: substituir pelo texto completo do artigo */
      content: `
        <p class="dropcap">A renovação e ampliação do convênio com a Embraer S.A. garantirá 
        45 novas vagas de estágio remunerado para alunos dos cursos técnicos de Mecatrônica, 
        Manutenção Aeronáutica e Desenvolvimento de Sistemas a partir do segundo semestre de 2026.</p>
        
        <p>O acordo prevê também a realização de workshops mensais ministrados por engenheiros da empresa 
        dentro da unidade do SENAI, além de visitas técnicas às instalações de fabricação de aeronaves 
        em São José dos Campos.</p>
        
        <p>Para os alunos selecionados, além da bolsa mensal de R$ 1.200, a parceria oferece 
        vale-transporte, plano de saúde básico e possibilidade de efetivação após a conclusão do curso.</p>
      `,
    },
  };

  /* Abre o modal com o artigo selecionado */
  function openModal(articleId) {
    const article = articles[articleId];
    if (!article) return;

    if (modalTitle) modalTitle.textContent = article.title;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex;gap:1rem;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;">
          <span style="font-family:var(--font-display);font-size:0.55rem;letter-spacing:0.2em;color:var(--color-primary);text-transform:uppercase">${article.category}</span>
          <span style="color:var(--color-text-dim);font-size:0.8rem">${article.author}</span>
          <span style="color:var(--color-text-dim);font-size:0.8rem">${article.date}</span>
        </div>
        ${article.content}
      `;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; /* Bloqueia scroll da página */
  }

  /* Fecha o modal */
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* Event listeners para abrir modal */
  document.querySelectorAll('[data-article]').forEach((el) => {
    el.addEventListener('click', () => openModal(el.dataset.article));
  });

  /* Fecha ao clicar no botão X */
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  /* Fecha ao clicar no overlay (fora do conteúdo) */
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  /* Fecha com tecla Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();


/* ──────────────────────────────────────────────
   7. CONTADOR ANIMADO
   Anima os números das estatísticas de 0 até o valor alvo
   quando entram no viewport
──────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  /* 
    CONFIGURAÇÃO: editar os valores no HTML via data-count="NUMERO"
    Ex: <span class="stat-number" data-count="1200">0</span>
  */
  const DURATION = 2000; /* duração da animação em ms */

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const start  = Date.now();

    function update() {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / DURATION, 1);
      /* Easing: ease-out cubic */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      /* Formata número com separadores de milhar */
      el.textContent = current.toLocaleString('pt-BR');

      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('pt-BR');
    }

    requestAnimationFrame(update);
  }

  /* Observa quando o elemento entra no viewport */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();


/* ──────────────────────────────────────────────
   8. NEWSLETTER — Simulação de envio
   Valida o email e simula envio com feedback visual
   
   TODO: Substituir a simulação por uma chamada real à API
   Ex: fetch('/api/newsletter', { method: 'POST', body: ... })
──────────────────────────────────────────────── */
(function initNewsletter() {
  const form    = document.getElementById('newsletter-form');
  const input   = document.getElementById('newsletter-email');
  const btn     = document.getElementById('newsletter-btn');

  if (!form || !input || !btn) return;

  /* Validação simples de formato de email */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!isValidEmail(email)) {
      input.style.borderColor = 'var(--color-pink)';
      input.placeholder = 'Digite um email válido';
      setTimeout(() => {
        input.style.borderColor = '';
        input.placeholder = 'seu@email.com';
      }, 2000);
      return;
    }

    /* Estado de carregamento */
    btn.textContent = 'Enviando...';
    btn.disabled    = true;

    /* 
      === INTEGRAÇÃO COM BACKEND ===
      Substituir o setTimeout abaixo por uma chamada fetch real:
      
      fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => { ... tratamento de sucesso ... })
      .catch(err => { ... tratamento de erro ... });
    */
    setTimeout(() => {
      btn.textContent     = '✓ Inscrito!';
      btn.style.background = 'var(--color-green)';
      input.value          = '';
      input.placeholder    = 'Obrigado pela inscrição!';

      /* Reseta após 3 segundos */
      setTimeout(() => {
        btn.textContent      = 'Inscrever';
        btn.style.background = '';
        btn.disabled         = false;
        input.placeholder    = 'seu@email.com';
      }, 3000);
    }, 1200);
  });
})();


/* ──────────────────────────────────────────────
   9. SMOOTH SCROLL com offset para navbar fixa
──────────────────────────────────────────────── */
(function initSmoothScroll() {
  const NAVBAR_HEIGHT = 80; /* altura da navbar em px */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ──────────────────────────────────────────────
   10. EFEITO TILT nos cards (3D hover)
   Inclina sutilmente os cards ao passar o mouse
──────────────────────────────────────────────── */
(function initTilt() {
  const tiltCards = document.querySelectorAll('.editorial-card, .hero-card, .stat-item');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const centerX = rect.width  / 2;
      const centerY = rect.height / 2;
      const rotX   = ((y - centerY) / centerY) * -6; /* máx 6deg */
      const rotY   = ((x - centerX) / centerX) *  6;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ──────────────────────────────────────────────
   INICIALIZAÇÃO
   Log de debug — remover em produção
──────────────────────────────────────────────── */
console.log(
  '%c SENAI SANTOS DUMONT — REVISTA DIGITAL ',
  'background: #FF8000; color: #000; font-weight: bold; font-size: 12px; padding: 4px 8px; border-radius: 2px;'
);
console.log('%c MVP v1.0 | Laboratório HTML ', 'color: #00D4FF; font-size: 11px;');