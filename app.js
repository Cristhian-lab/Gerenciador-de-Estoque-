// Credenciais de Administração
const ADMIN_USER = "darcio.admin";
const ADMIN_PASS = "darcio75";

// Carrega o estoque do LocalStorage do navegador
let estoqueVeiculos = JSON.parse(localStorage.getItem('estoque_darcio')) || [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarRoteamento();
    inicializarLogin();
    inicializarNavegacao();
    inicializarFormulario();
    inicializarMotoresBusca();
    atualizarSistemaCompleto();
});

// ================= NAVEGAÇÃO DA ÁREA PÚBLICA / RESTREITA =================
function inicializarRoteamento() {
    const catalogContainer = document.getElementById('catalog-container');
    const loginContainer = document.getElementById('login-container');
    const mainSystem = document.getElementById('main-system');

    document.getElementById('go-to-login-btn').addEventListener('click', () => {
        catalogContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    document.getElementById('back-to-catalog-btn').addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        catalogContainer.classList.remove('hidden');
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        mainSystem.classList.add('hidden');
        catalogContainer.classList.remove('hidden');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
}

// ================= LOGIN ADM =================
function inicializarLogin() {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const mainSystem = document.getElementById('main-system');
    const errorMsg = document.getElementById('login-error');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value;

        if (user === ADMIN_USER && pass === ADMIN_PASS) {
            loginContainer.classList.add('hidden');
            mainSystem.classList.remove('hidden');
            errorMsg.textContent = "";
            atualizarSistemaCompleto();
        } else {
            errorMsg.textContent = "Acesso negado! Credenciais inválidas.";
        }
    });
}

// ================= CONTROLE DE ABAS DO ADM =================
function inicializarNavegacao() {
    const menuButtons = document.querySelectorAll('.menu-btn');
    const sections = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            menuButtons.forEach(b => b.classList.remove('active'));
            sections.forEach(s => s.classList.add('hidden'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.remove('hidden');
            pageTitle.textContent = btn.textContent.trim();
        });
    });
}

// ================= CADASTRO DE VEÍCULOS =================
function inicializarFormulario() {
    const form = document.getElementById('car-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const novoCarro = {
            id: Date.now(),
            marca: document.getElementById('car-brand').value,
            modelo: document.getElementById('car-model').value,
            ano: document.getElementById('car-year').value,
            cor: document.getElementById('car-color').value,
            placa: document.getElementById('car-plate').value.toUpperCase(),
            km: parseInt(document.getElementById('car-km').value),
            custo: parseFloat(document.getElementById('car-cost').value),
            venda: parseFloat(document.getElementById('car-price').value),
            notas: document.getElementById('car-notes').value
        };

        estoqueVeiculos.push(novoCarro);
        localStorage.setItem('estoque_darcio', JSON.stringify(estoqueVeiculos));
        atualizarSistemaCompleto();
        form.reset();
        
        // Joga o Admin direto na aba de estoque para ele ver o carro listado
        document.querySelector('[data-target="stock-section"]').click();
    });
}

function deletarVeiculo(id) {
    if (confirm("Deseja mesmo remover permanentemente esse veículo?")) {
        estoqueVeiculos = estoqueVeiculos.filter(car => car.id !== id);
        localStorage.setItem('estoque_darcio', JSON.stringify(estoqueVeiculos));
        atualizarSistemaCompleto();
    }
}

// ================= FILTROS DE BUSCA (CLIENTE E ADM) =================
function inicializarMotoresBusca() {
    // Busca do Cliente no Catálogo
    document.getElementById('search-catalog').addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = estoqueVeiculos.filter(car => 
            car.marca.toLowerCase().includes(termo) || 
            car.modelo.toLowerCase().includes(termo) || 
            car.ano.includes(termo)
        );
        renderizarCatalogoPublico(filtrados);
    });

    // Busca do Admin no Gerenciador
    document.getElementById('search-stock').addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = estoqueVeiculos.filter(car => 
            car.marca.toLowerCase().includes(termo) || 
            car.modelo.toLowerCase().includes(termo) || 
            car.placa.toLowerCase().includes(termo)
        );
        renderizarTabelaGerenciador(filtrados);
    });
}

// ================= RENDERIZADORES DE TELAS =================
function atualizarSistemaCompleto() {
    renderizarCatalogoPublico(estoqueVeiculos);
    renderizarDashboardInterno();
    renderizarTabelaGerenciador(estoqueVeiculos);
    renderizarValoresRelatorio();
}

function formatarMoeda(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

// 1. Gera o catálogo aberto para o cliente ver
function renderizarCatalogoPublico(lista) {
    const grid = document.getElementById('catalog-grid-list');
    document.getElementById('catalog-count').textContent = lista.length;
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#757575; padding: 40px;">Nenhum carro encontrado no estoque no momento.</p>`;
        return;
    }

    lista.forEach(car => {
        const card = document.createElement('div');
        card.className = "car-card";
        
        // Link direto do whatsapp customizado com mensagem para o modelo exato do carro
        const msgWhats = encodeURIComponent(`Olá Dárcio Veículos, gostaria de mais informações sobre o ${car.marca} ${car.modelo} ${car.ano}.`);
        const linkWhats = `https://api.whatsapp.com/send?phone=5575988698486&text=${msgWhats}`;

        card.innerHTML = `
            <div class="car-img-placeholder"><i class="fas fa-car-side"></i></div>
            <div class="car-infos">
                <h3>${car.marca} <span class="blue-text">${car.modelo}</span></h3>
                <div class="car-tags">
                    <span class="tag"><i class="fas fa-calendar-alt"></i> ${car.ano}</span>
                    <span class="tag"><i class="fas fa-tachometer-alt"></i> ${car.km.toLocaleString()} KM</span>
                    <span class="tag"><i class="fas fa-palette"></i> ${car.cor}</span>
                </div>
                <div class="car-price-tag">${formatarMoeda(car.venda)}</div>
                <p class="car-notes-text">${car.notas ? car.notas : 'Nenhuma observação cadastrada.'}</p>
                <a href="${linkWhats}" target="_blank" class="btn-whatsapp"><i class="fab fa-whatsapp"></i> Negociar no WhatsApp</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 2. Gera os dados internos do Dashboard Admin
function renderizarDashboardInterno() {
    const custo = estoqueVeiculos.reduce((acc, c) => acc + c.custo, 0);
    const venda = estoqueVeiculos.reduce((acc, c) => acc + c.venda, 0);

    document.getElementById('total-cars').textContent = estoqueVeiculos.length;
    document.getElementById('total-investment').textContent = formatarMoeda(custo);
    document.getElementById('total-sale-potential').textContent = formatarMoeda(venda);

    // Tabela resumida de novidades
    const tabela = document.getElementById('recent-cars-table');
    tabela.innerHTML = "";
    [...estoqueVeiculos].reverse().slice(0, 5).forEach(car => {
        tabela.innerHTML += `
            <tr>
                <td><strong>${car.marca}</strong> ${car.modelo}</td>
                <td>${car.ano}</td>
                <td>${car.cor}</td>
                <td>${car.placa}</td>
                <td class="blue-text">${formatarMoeda(car.venda)}</td>
            </tr>
        `;
    });
}

// 3. Gera a listagem com botões de deletar e preços de custo para o Admin
function renderizarTabelaGerenciador(lista) {
    const tabela = document.getElementById('full-stock-table');
    tabela.innerHTML = "";

    lista.forEach(car => {
        tabela.innerHTML += `
            <tr>
                <td><strong>${car.marca}</strong> ${car.modelo}</td>
                <td>${car.ano}</td>
                <td><span style="font-family: monospace;">${car.placa}</span></td>
                <td>${car.km.toLocaleString()} KM</td>
                <td>${formatarMoeda(car.custo)}</td>
                <td class="blue-text">${formatarMoeda(car.venda)}</td>
                <td>
                    <button onclick="deletarVeiculo(${car.id})" class="btn-delete"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
    });
}

// 4. Financeiro do Admin
function renderizarValoresRelatorio() {
    const custo = estoqueVeiculos.reduce((acc, c) => acc + c.custo, 0);
    const venda = estoqueVeiculos.reduce((acc, c) => acc + c.venda, 0);

    document.getElementById('rep-total-cost').textContent = formatarMoeda(custo);
    document.getElementById('rep-total-sale').textContent = formatarMoeda(venda);
    document.getElementById('rep-total-profit').textContent = formatarMoeda(venda - custo);
}