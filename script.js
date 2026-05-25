let lucros = JSON.parse(localStorage.getItem('lucrosSemanais')) || [0, 0, 0, 0, 0, 0, 0];
let lucroDiarioHoje = parseFloat(localStorage.getItem('lucroDiarioHoje')) || 0;
let historico = JSON.parse(localStorage.getItem('historicoLucros')) || [];
let modoAutenticacao = 'login';
let meuGrafico;
let diaAtualSelecionado = 0;

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('usuarioLogado')) {
        const user = localStorage.getItem('usuarioLogado');
        const loginEl = document.getElementById('tela-login');
        const principalEl = document.getElementById('sistema-principal');
        const userEl = document.getElementById('nome-usuario-logado');
        
        if(loginEl) loginEl.style.display = 'none';
        if(principalEl) principalEl.style.display = 'flex';
        if(userEl) userEl.innerText = user.toUpperCase();
        
        atualizarInterface();
    }
    
    // Atualiza o relógio a cada 30 segundos (muito mais leve para evitar lag)
    atualizarRelogio();
    setInterval(atualizarRelogio, 30000);

    window.addEventListener('click', (e) => {
        if (!e.target.matches('.btn-dropdown-gatilho')) {
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        }
    });
});

function alternarDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
}

function abrirModalPorMenu() {
    alternarDropdown();
    navegarPara('tela-dashboard');
}

function mudarTabLogin(modo) {
    modoAutenticacao = modo;
    const tabLogin = document.getElementById('btn-tab-login');
    const tabCadastro = document.getElementById('btn-tab-cadastro');
    const btnEntrar = document.getElementById('btn-entrar');
    
    if(tabLogin) tabLogin.classList.toggle('active', modo === 'login');
    if(tabCadastro) tabCadastro.classList.toggle('active', modo === 'cadastro');
    if(btnEntrar) btnEntrar.innerText = modo === 'login' ? 'Entrar no Sistema' : 'Criar Conta e Entrar';
}

function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('usuario').value.trim();
    const pass = document.getElementById('senha').value;

    if (!user || !pass) return;

    let usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosSistema')) || {};

    if (modoAutenticacao === 'cadastro') {
        if (usuariosCadastrados[user]) {
            alert('Este usuário já existe!');
            return;
        }
        usuariosCadastrados[user] = pass;
        localStorage.setItem('usuariosSistema', JSON.stringify(usuariosCadastrados));
        alert('Conta criada com sucesso!');
    } else {
        if (!usuariosCadastrados[user] || usuariosCadastrados[user] !== pass) {
            alert('Usuário ou senha incorretos!');
            return;
        }
    }

    localStorage.setItem('usuarioLogado', user);
    
    const loginEl = document.getElementById('tela-login');
    const principalEl = document.getElementById('sistema-principal');
    const userEl = document.getElementById('nome-usuario-logado');
    
    if(loginEl) loginEl.style.display = 'none';
    if(principalEl) principalEl.style.display = 'flex';
    if(userEl) userEl.innerText = user.toUpperCase();
    
    atualizarInterface();
}

function deslogar() {
    localStorage.removeItem('usuarioLogado');
    location.reload();
}

function navegarPara(idTela) {
    document.querySelectorAll('.aba-conteudo').forEach(tela => tela.style.display = 'none');
    const telaEl = document.getElementById(idTela);
    if(telaEl) telaEl.style.display = 'block';
    
    document.querySelectorAll('.dropdown-menu-box button').forEach(btn => btn.classList.remove('active'));
    
    const dropdown = document.getElementById('dropdown-menu');
    if (dropdown) dropdown.style.display = 'none';
    
    if (idTela === 'tela-dashboard') {
        setTimeout(inicializarGrafico, 50);
    }
}

function atualizarRelogio() {
    const agora = new Date();
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    
    const elDia = document.getElementById('diaDaSemana');
    const elData = document.getElementById('dataAtual');
    const elHora = document.getElementById('horaAtual');
    const elTempo = document.getElementById('tempoRestante');

    if(elDia) elDia.innerText = dias[agora.getDay()];
    if(elData) elData.innerText = agora.toLocaleDateString('pt-BR');
    
    // Mostra apenas Hora e Minuto (Ex: 19:23)
    if(elHora) elHora.innerText = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if(elTempo) {
        const totalMinutosNoDia = 1440;
        const minutosPassados = (agora.getHours() * 60) + agora.getMinutes();
        const minutosRestantes = totalMinutosNoDia - minutosPassados;
        
        const hrs = Math.floor(minutosRestantes / 60);
        const mins = minutosRestantes % 60;
        
        elTempo.innerText = `Faltam ${hrs}h ${mins}min para encerrar o dia`;
    }
}

function inicializarGrafico() {
    const canvas = document.getElementById('graficoLucros');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
            datasets: [{
                data: lucros,
                backgroundColor: '#007bff',
                borderColor: '#00d2ff',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#242424' }, ticks: { color: '#aaa' } },
                x: { grid: { display: false }, ticks: { color: '#aaa' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

function adicionarLucroRapido() {
    const input = document.getElementById('valorInput');
    if (!input) return;
    const valor = parseFloat(input.value);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    lucroDiarioHoje += valor;
    
    const diaDaSemanaIndex = new Date().getDay(); 
    let layoutIndex = diaDaSemanaIndex - 1; 
    if (layoutIndex < 0) layoutIndex = 6; 

    lucros[layoutIndex] += valor;

    const horaFormatada = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    historico.unshift({ valor: valor, hora: horaFormatada });

    varEReceber();
    input.value = '';
}

function varEReceber() {
    localStorage.setItem('lucrosSemanais', JSON.stringify(lucros));
    localStorage.setItem('lucroDiarioHoje', lucroDiarioHoje);
    localStorage.setItem('historicoLucros', JSON.stringify(historico));
    atualizarInterface();
}

function abrirModal(nomeDia, indice) {
    diaAtualSelecionado = indice;
    const modalTitulo = document.getElementById('modalTitulo');
    const modalInput = document.getElementById('modalInput');
    const modal = document.getElementById('modal');
    
    if(modalTitulo) modalTitulo.innerText = `Editar: ${nomeDia}`;
    if(modalInput) modalInput.value = lucros[indice] || '';
    if(modal) modal.style.display = 'flex';
}

function fecharModal() { 
    const modal = document.getElementById('modal');
    if(modal) modal.style.display = 'none'; 
}

function salvarLucroModal() {
    const input = document.getElementById('modalInput');
    if (!input) return;
    const valor = parseFloat(input.value) || 0;
    lucros[diaAtualSelecionado] = valor;
    varEReceber();
    fecharModal();
}

function atualizarInterface() {
    let total = 0;
    let diasComLucro = 0;

    lucros.forEach((valor, indice) => {
        const el = document.getElementById(`v-${indice}`);
        if (el) el.innerText = `R$ ${valor.toFixed(2).replace('.', ',')}`;
        total += valor;
        if (valor > 0) diasComLucro++;
    });

    const media = total / 7;

    const lucroDiarioEl = document.getElementById('lucroDiario');
    const lucroSemanalEl = document.getElementById('lucroSemanalPrincipal');
    const totalSemanaEl = document.getElementById('totalSemana');
    const mediaDiariaEl = document.getElementById('mediaDiaria');
    const diasLucroEl = document.getElementById('diasLucro');

    if(lucroDiarioEl) lucroDiarioEl.innerText = `R$ ${lucroDiarioHoje.toFixed(2).replace('.', ',')}`;
    if(lucroSemanalEl) lucroSemanalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if(totalSemanaEl) totalSemanaEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if(mediaDiariaEl) mediaDiariaEl.innerText = `R$ ${media.toFixed(2).replace('.', ',')}`;
    if(diasLucroEl) diasLucroEl.innerText = `${diasComLucro}/7`;

    const listaHtml = document.getElementById('historicoLista');
    if (listaHtml) {
        if (historico.length === 0) {
            listaHtml.innerHTML = '<p style="color: #888; font-size: 14px;">Nenhum lucro adicionado ainda.</p>';
        } else {
            listaHtml.innerHTML = historico.map(item => `
                <div class="item-historico">
                    <span style="color: #4ade80; font-weight: bold;">+ R$ ${item.valor.toFixed(2).replace('.', ',')}</span>
                    <span style="color: #888;">Lançado às ${item.hora}</span>
                </div>
            `).join('');
        }
    }

    if (meuGrafico && meuGrafico.data && meuGrafico.data.datasets) {
        meuGrafico.data.datasets.data = lucros;
        meuGrafico.update();
    }
}

function zerarDados() {
    if (confirm("Tem certeza de que deseja apagar o histórico e todos os lucros armazenados?")) {
