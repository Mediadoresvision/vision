let lucros = JSON.parse(localStorage.getItem('lucrosSemanais')) || [0, 0, 0, 0, 0, 0, 0];
let lucroDiarioHoje = parseFloat(localStorage.getItem('lucroDiarioHoje')) || 0;
let historico = JSON.parse(localStorage.getItem('historicoLucros')) || [];
let modoAutenticacao = 'login';
let meuGrafico;

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem('usuarioLogado')) {
        const user = localStorage.getItem('usuarioLogado');
        const loginEl = document.getElementById('tela-login');
        const principalEl = document.getElementById('sistema-principal');
        const userEl = document.getElementById('nome-usuario-logado');
        
        if(loginEl) loginEl.style.display = 'none';
        if(principalEl) principalEl.style.display = 'flex';
        if(userEl) userEl.innerText = user.toUpperCase();
        
        inicializarGrafico();
        atualizarInterface();
    }
    
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
});

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
    
    inicializarGrafico();
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
    
    document.querySelectorAll('.menu-items button').forEach(btn => btn.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + idTela);
    if (navBtn) navBtn.classList.add('active');
    
    if (idTela === 'tela-dashboard') {
        setTimeout(inicializarGrafico, 100);
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
    if(elHora) elHora.innerText = agora.toLocaleTimeString('pt-BR');
    
    if(elTempo) {
        const totalSegundosNoDia = 24 * 60 * 60;
        const segundosPassados = (agora.getHours() * 3600) + (agora.getMinutes() * 60) + agora.getSeconds();
        const segundosRestantes = totalSegundosNoDia - segundosPassados;
        
        const hrs = Math.floor(segundosRestantes / 3600);
        const mins = Math.floor((segundosRestantes % 3600) / 60);
        const segs = segundosRestantes % 60;
        
        elTempo.innerText = `Faltam ${hrs}h ${mins}min ${segs}s para encerrar o dia`;
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
            labels: ['Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg'],
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
    const valor = parseFloat(input.value);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor válido.');
        return;
    }

    lucroDiarioHoje += valor;
    
    const diaDaSemanaIndex = new Date().getDay(); 
    let layoutIndex = diaDaSemanaIndex - 2;
    if (layoutIndex < 0) layoutIndex += 7;

    lucros[layoutIndex] += valor;

    const horaFormatada = new Date().toLocaleTimeString('pt-BR');
    historico.unshift({ valor: valor, hora: horaFormatada });

    salvarEAtualizar();
    input.value = '';
}

function abrirModal(nomeDia, indice) {
    diaAtualSelecionado = indice;
    document.getElementById('modalTitulo').innerText = `Editar: ${nomeDia}`;
    document.getElementById('modalInput').value = lucros[indice] || '';
    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() { document.getElementById('modal').style.display = 'none'; }

function salvarLucroModal() {
    const valor = parseFloat(document.getElementById('modalInput').value) || 0;
    lucros[diaAtualSelecionado] = valor;
    salvarEAtualizar();
    fecharModal();
}

function salvarEAtualizar() {
    localStorage.setItem('lucrosSemanais', JSON.stringify(lucros));
    localStorage.setItem('lucroDiarioHoje', lucroDiarioHoje);
    localStorage.setItem('historicoLucros', JSON.stringify(historico));
    atualizarInterface();
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

    if(document.getElementById('lucroDiario')) {
        document.getElementById('lucroDiario').innerText = `R$ ${lucroDiarioHoje.toFixed(2).replace('.', ',')}`;
        document.getElementById('lucroSemanalPrincipal').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        document.getElementById('totalSemana').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
        document.getElementById('mediaDiaria').innerText = `R$ ${media.toFixed(2).replace('.', ',')}`;
        document.getElementById('diasLucro').innerText = `${diasComLucro}/7`;
    }

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

    if (meuGrafico) {
        meuGrafico.data.datasets.data = lucros;
        meuGrafico.update();
    }
}

function zerarDados() {
    if (confirm("Tem certeza de que deseja apagar o histórico e todos os lucros armazenados?")) {
        lucros = [0, 0, 0, 0, 0, 0, 0];
        lucroDiarioHoje = 0;
        historico = [];
        salvarEAtualizar();
    }
}
