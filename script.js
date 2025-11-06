// ========================================================
// SISTEMA DE CONTROLE DE MEDIÇÃO - M.A VIANA LOCAÇÕES
// VERSÃO SIMPLIFICADA E FUNCIONAL
// ========================================================

// Variáveis globais
let lancamentos = [];
let mesReferencia = new Date().getMonth() + 1;
let anoReferencia = new Date().getFullYear();

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema simplificado...');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Carregar dados salvos
    carregarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Atualizar resumo final na inicialização
    atualizarResumoFinal();
    
    console.log('✅ Sistema inicializado com sucesso!');
});

// Configurar todos os event listeners
function configurarEventListeners() {
    // Botão gerar medição
    const btnGerarMedicao = document.getElementById('gerar-medicao');
    if (btnGerarMedicao) {
        btnGerarMedicao.addEventListener('click', gerarMedicao);
    }
    
    // Botão pré-visualizar
    const btnPrevisualizar = document.getElementById('previsualizar');
    if (btnPrevisualizar) {
        btnPrevisualizar.addEventListener('click', previsualizar);
    }
    
    // Botão limpar tabela
    const btnLimparTabela = document.getElementById('limpar-tabela');
    if (btnLimparTabela) {
        btnLimparTabela.addEventListener('click', limparTabela);
    }
    
    // Botão gerar relatório
    const btnGerarRelatorio = document.getElementById('gerar-relatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', gerarRelatorio);
    }
    
    // Botão exportar PDF
    const btnExportarPDF = document.getElementById('exportar-pdf');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', exportarPDF);
    }
    
    // Botão toggle tabela
    const btnToggleTabela = document.getElementById('toggle-tabela');
    if (btnToggleTabela) {
        btnToggleTabela.addEventListener('click', toggleTabela);
    }
    
    // Configurar assinatura
    configurarAssinatura();
    
    // Configurar tipo de medição
    configurarTipoMedicao();
    
    // Configurar PWA
    configurarPWA();
    
    // Definir horário padrão da sexta-feira
    const horarioSaidaSexta = document.getElementById('horario-saida-sexta');
    if (horarioSaidaSexta && !horarioSaidaSexta.value) {
        horarioSaidaSexta.value = '16:00';
    }
    
    // Configurar campo de valor do contrato
    configurarCampoValorContrato();
    
    // Configurar modo noturno
    configurarModoNoturno();
}

// Configurar modo noturno
function configurarModoNoturno() {
    const btnToggleDarkMode = document.getElementById('toggle-dark-mode');
    if (!btnToggleDarkMode) return;
    
    // Carregar preferência salva
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        atualizarIconeModoNoturno(true);
    }
    
    // Event listener para alternar modo
    btnToggleDarkMode.addEventListener('click', function() {
        const temaAtual = document.documentElement.getAttribute('data-theme');
        const isDark = temaAtual === 'dark';
        
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
            atualizarIconeModoNoturno(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
            atualizarIconeModoNoturno(true);
        }
    });
}

// Atualizar ícone do modo noturno
function atualizarIconeModoNoturno(isDark) {
    const btnToggleDarkMode = document.getElementById('toggle-dark-mode');
    if (!btnToggleDarkMode) return;
    
    const icon = btnToggleDarkMode.querySelector('i');
    if (icon) {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

// Configurar tipo de medição
function configurarTipoMedicao() {
    const tiposMedicao = document.querySelectorAll('input[name="tipo-medicao"]');
    const configSections = document.querySelectorAll('.config-section');
    
    tiposMedicao.forEach(tipo => {
        tipo.addEventListener('change', function() {
            // Remover classe active de todas as seções
            configSections.forEach(section => section.classList.remove('active'));
            
            // Adicionar classe active na seção correspondente
            const configId = `config-${this.value}`;
            const configElement = document.getElementById(configId);
            if (configElement) {
                configElement.classList.add('active');
            }
        });
    });
}

// Gerar medição baseada no tipo selecionado
function gerarMedicao() {
    console.log('🎯 Gerando medição...');
    
    const tipoMedicao = document.querySelector('input[name="tipo-medicao"]:checked')?.value || 'mensal';
    
    switch (tipoMedicao) {
        case 'mensal':
            gerarMedicaoMensal();
            break;
        case 'quinzenal':
            gerarMedicaoQuinzenal();
            break;
        case 'diaria':
            gerarMedicaoDiaria();
            break;
        case 'semanal':
            gerarMedicaoSemanal();
            break;
        case 'personalizado':
            gerarMedicaoPersonalizada();
            break;
        default:
            gerarMedicaoMensal();
    }
    
    atualizarTabela();
    atualizarResumoFinal(); // Garantir que o resumo seja atualizado após gerar medição
    salvarDados();
    mostrarNotificacao('Medição gerada com sucesso!', 'success');
}

// Gerar medição mensal
function gerarMedicaoMensal() {
    const dataInput = document.getElementById('data-mensal');
    if (!dataInput || !dataInput.value) {
        mostrarNotificacao('Selecione o mês/ano para a medição mensal', 'error');
            return;
        }
        
    const [ano, mes] = dataInput.value.split('-');
    const diasNoMes = new Date(ano, mes, 0).getDate();
    
    lancamentos = [];
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const data = new Date(ano, mes - 1, dia);
        const diaSemana = data.getDay();
        
        // Pular domingos (0) e sábados (6) se não for feriado
        if (diaSemana === 0 || diaSemana === 6) {
            if (!ehFeriado(dataStr)) {
                continue;
            }
        }
        
        // Pular feriados
        if (ehFeriado(dataStr)) {
                continue;
            }
            
        const lancamento = criarLancamento(dataStr, dia, obterDiaSemana(dataStr));
        lancamentos.push(lancamento);
    }
    
    console.log(`📅 Gerada medição mensal: ${lancamentos.length} dias`);
}

// Gerar medição quinzenal
function gerarMedicaoQuinzenal() {
    const dataInput = document.getElementById('data-quinzenal');
    const quinzenaSelect = document.getElementById('quinzena');
    
    if (!dataInput || !dataInput.value || !quinzenaSelect) {
        mostrarNotificacao('Selecione o mês/ano e quinzena', 'error');
            return;
        }
        
    const [ano, mes] = dataInput.value.split('-');
    const quinzena = parseInt(quinzenaSelect.value);
    
    const inicioDia = quinzena === 1 ? 1 : 16;
    const fimDia = quinzena === 1 ? 15 : new Date(ano, mes, 0).getDate();
    
    lancamentos = [];
    
    for (let dia = inicioDia; dia <= fimDia; dia++) {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const data = new Date(ano, mes - 1, dia);
        const diaSemana = data.getDay();
        
        // Pular domingos e sábados se não for feriado
        if (diaSemana === 0 || diaSemana === 6) {
            if (!ehFeriado(dataStr)) {
                continue;
            }
        }
        
        // Pular feriados
        if (ehFeriado(dataStr)) {
                continue;
            }
            
        const lancamento = criarLancamento(dataStr, dia, obterDiaSemana(dataStr));
        lancamentos.push(lancamento);
    }
    
    console.log(`📅 Gerada medição quinzenal: ${lancamentos.length} dias`);
}

// Gerar medição diária
function gerarMedicaoDiaria() {
    const dataInput = document.getElementById('data-diaria');
    if (!dataInput || !dataInput.value) {
        mostrarNotificacao('Selecione a data para a medição diária', 'error');
        return;
    }
    
    const dataStr = dataInput.value;
    const data = new Date(dataStr);
    const dia = data.getDate();
    
        lancamentos = [];
    const lancamento = criarLancamento(dataStr, dia, obterDiaSemana(dataStr));
    lancamentos.push(lancamento);
    
    console.log(`📅 Gerada medição diária: 1 dia`);
}

// Gerar medição semanal
function gerarMedicaoSemanal() {
    const dataInput = document.getElementById('data-semanal');
    if (!dataInput || !dataInput.value) {
        mostrarNotificacao('Selecione a semana para a medição semanal', 'error');
            return;
        }
        
    const [ano, semana] = dataInput.value.split('-W');
    const dataInicio = new Date(ano, 0, 1);
    const diasParaInicio = (semana - 1) * 7;
    dataInicio.setDate(dataInicio.getDate() + diasParaInicio);
    
    lancamentos = [];
    
    for (let i = 0; i < 7; i++) {
        const data = new Date(dataInicio);
        data.setDate(dataInicio.getDate() + i);
        const dataStr = data.toISOString().split('T')[0];
        const dia = data.getDate();
        
        const lancamento = criarLancamento(dataStr, dia, obterDiaSemana(dataStr));
        lancamentos.push(lancamento);
    }
    
    console.log(`📅 Gerada medição semanal: 7 dias`);
}

// Gerar medição personalizada
function gerarMedicaoPersonalizada() {
    const dataInput = document.getElementById('data-personalizado');
    const diasSemana = document.querySelectorAll('#config-personalizado input[type="checkbox"]:checked');
    const quantidadeDias = parseInt(document.getElementById('quantidade-dias')?.value) || 5;
    
    if (!dataInput || !dataInput.value || diasSemana.length === 0) {
        mostrarNotificacao('Configure a medição personalizada', 'error');
            return;
    }
    
    const [ano, mes] = dataInput.value.split('-');
    const diasSelecionados = Array.from(diasSemana).map(cb => parseInt(cb.value));
    
    lancamentos = [];
    let diasAdicionados = 0;
    
    for (let dia = 1; dia <= 31 && diasAdicionados < quantidadeDias; dia++) {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const data = new Date(ano, mes - 1, dia);
        const diaSemana = data.getDay();
        
        // Verificar se o dia da semana está selecionado
        if (diasSelecionados.includes(diaSemana)) {
            const lancamento = criarLancamento(dataStr, dia, obterDiaSemana(dataStr));
            lancamentos.push(lancamento);
            diasAdicionados++;
        }
    }
    
    console.log(`📅 Gerada medição personalizada: ${lancamentos.length} dias`);
}

// Criar lançamento padrão
function criarLancamento(dataStr, dia, diaSemana) {
    // Verificar se é sexta-feira para usar horário específico
    const data = new Date(dataStr);
    const diaSemanaIndex = data.getDay();
    
    let horarioEntrada, horarioAlmoco, horarioRetorno, horarioSaida;
    
    if (diaSemanaIndex === 5) { // Sexta-feira - 8 horas trabalhadas (07:00 às 16:00)
        horarioEntrada = '07:00';
        horarioAlmoco = '12:00';
        horarioRetorno = '13:00';
        horarioSaida = '16:00';
    } else {
        horarioEntrada = document.getElementById('horario-entrada')?.value || '07:00';
        horarioAlmoco = document.getElementById('horario-almoco')?.value || '12:00';
        horarioRetorno = document.getElementById('horario-retorno')?.value || '13:00';
        horarioSaida = document.getElementById('horario-saida')?.value || '17:00';
    }
    
    const horasTrabalhadas = calcularHorasTrabalhadas(horarioEntrada, horarioAlmoco, horarioRetorno, horarioSaida);
    const horasContrato = obterHorasContrato(diaSemanaIndex);
    
    // Calcular horas extras
    const [hTrab, mTrab] = horasTrabalhadas.split(':').map(Number);
    const totalTrabMin = hTrab * 60 + mTrab;
    const totalContMin = horasContrato * 60;
    const horasExtrasMin = Math.max(0, totalTrabMin - totalContMin);
    const horasExtras = `${Math.floor(horasExtrasMin / 60).toString().padStart(2, '0')}:${(horasExtrasMin % 60).toString().padStart(2, '0')}`;
    
    return {
        data: dataStr,
        dia: dia,
        diaSemana: diaSemana,
        entrada: horarioEntrada,
        almoco: horarioAlmoco,
        retorno: horarioRetorno,
        saida: horarioSaida,
        horasTrabalhadas: horasTrabalhadas,
        horasContrato: horasContrato,
        horasExtra: horasExtras,
        adcNot: '00:00' // Inicialmente vazio, será editável
    };
}

// Calcular horas trabalhadas
function calcularHorasTrabalhadas(entrada, almoco, retorno, saida) {
    if (!entrada || !saida) return '00:00';
    
    const entradaMin = converterParaMinutos(entrada);
    const almocoMin = converterParaMinutos(almoco);
    const retornoMin = converterParaMinutos(retorno);
    const saidaMin = converterParaMinutos(saida);
    
    // Calcular horas antes e depois do almoço
    const horasAntesAlmoco = almocoMin - entradaMin;
    const horasDepoisAlmoco = saidaMin - retornoMin;
    const totalMinutos = horasAntesAlmoco + horasDepoisAlmoco;
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

// Converter hora para minutos
function converterParaMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

// Obter horas do contrato baseado no dia da semana
function obterHorasContrato(diaSemana) {
    const horasSexta = parseInt(document.getElementById('horas-sexta')?.value) || 8;
    const horasDiaUtil = parseInt(document.getElementById('horas-dia-util')?.value) || 9;
    
    // Sexta-feira (5) tem horário diferente - 8 horas (7 às 16)
    return diaSemana === 5 ? horasSexta : horasDiaUtil;
}

// Obter dia da semana
function obterDiaSemana(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    const data = new Date(ano, mes - 1, dia);
    const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    return dias[data.getDay()];
}

// Verificar se é feriado
function ehFeriado(dataStr) {
    const feriados = [
        '2025-01-01', '2025-04-20', '2025-05-01', '2025-09-07',
        '2025-10-12', '2025-11-02', '2025-11-15', '2025-12-25'
    ];
    return feriados.includes(dataStr);
}

// Atualizar tabela
function atualizarTabela() {
    const tbody = document.getElementById('tabela-principal');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    lancamentos.forEach((lancamento, index) => {
        const tr = document.createElement('tr');
        
        // Aplicar classes baseadas no dia da semana
        if (lancamento.diaSemana === 'DOM') {
            tr.classList.add('domingo');
        } else if (lancamento.diaSemana === 'SÁB') {
            tr.classList.add('sabado');
        } else if (lancamento.diaSemana === 'SEX') {
            tr.classList.add('sexta-feira');
        }
        
        tr.innerHTML = `
            <td>
                <input type="date" value="${lancamento.data}" class="data-editavel" onchange="atualizarDataLancamento(${index}, this.value)">
                <br><small>${lancamento.diaSemana}</small>
            </td>
            <td><input type="time" value="${lancamento.entrada}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'entrada', this.value)"></td>
            <td><input type="time" value="${lancamento.almoco}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'almoco', this.value)"></td>
            <td><input type="time" value="${lancamento.retorno}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'retorno', this.value)"></td>
            <td><input type="time" value="${lancamento.saida}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'saida', this.value)"></td>
            <td class="soma-diaria">${lancamento.horasTrabalhadas}</td>
            <td class="contrato">${lancamento.horasContrato}:00</td>
            <td class="horas-extra"><input type="time" value="${lancamento.horasExtra || '00:00'}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'horasExtra', this.value)"></td>
            <td class="adc-not"><input type="time" value="${lancamento.adcNot || '00:00'}" class="horario-editavel" onchange="atualizarHorarioLancamento(${index}, 'adcNot', this.value)"></td>
        `;
        
        tbody.appendChild(tr);
    });
    
    atualizarTotais();
}

// Adicionar uma hora ao horário
function adicionarUmaHora(horario) {
    const [h, m] = horario.split(':').map(Number);
    const novaHora = h + 1;
    return `${novaHora.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Obter porcentagem da hora
function obterPorcentagemHora() {
    const porcentagemInput = document.getElementById('porcentagem-hora');
    if (!porcentagemInput) return 100;
    const valor = parseFloat(porcentagemInput.value);
    if (isNaN(valor) || valor <= 0) return 100;
    return Math.max(0, Math.min(200, valor)); // Limitar entre 0% e 200%
}

// Obter tipo de medição formatado
function obterTipoMedicaoFormatado() {
    const tipoMedicao = document.querySelector('input[name="tipo-medicao"]:checked')?.value || 'mensal';
    const tiposFormatados = {
        'mensal': 'MENSAL',
        'quinzenal': 'QUINZENAL',
        'diaria': 'DIÁRIA',
        'semanal': 'SEMANAL',
        'personalizado': 'PERSONALIZADO'
    };
    return tiposFormatados[tipoMedicao] || 'MENSAL';
}

// Calcular valor por hora com porcentagem
function calcularValorPorHora(valorContrato, totalHorasMinutos) {
    if (!valorContrato || valorContrato <= 0 || !totalHorasMinutos || totalHorasMinutos <= 0) {
        return 0;
    }
    const porcentagemHora = obterPorcentagemHora();
    const valorPorHoraBase = valorContrato / (totalHorasMinutos / 60);
    const valorPorHoraAjustado = valorPorHoraBase * (porcentagemHora / 100);
    return isNaN(valorPorHoraAjustado) ? 0 : valorPorHoraAjustado;
}

// Obter valor unitário editável
function obterValorUnitarioEditavel(id) {
    const input = document.getElementById(id);
    if (!input || !input.value) return null;
    let valor = input.value.replace(/[^\d,.-]/g, '');
    if (valor.includes('.') && valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
        valor = valor.replace(',', '.');
    }
    const num = parseFloat(valor);
    return isNaN(num) ? null : num;
}

// Atualizar totais
function atualizarTotais() {
    // Calcular totais de horas
    const totalHoras = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasTrabalhadas) return acc;
        const [h, m] = l.horasTrabalhadas.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    
    const totalContrato = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasContrato) return acc;
        return acc + (l.horasContrato || 0) * 60;
    }, 0);
    
    const totalHorasExtra = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasExtra) return acc;
        const [h, m] = l.horasExtra.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    
    const totalAdcNot = lancamentos.reduce((acc, l) => {
        if (!l || !l.adcNot) return acc;
        const [h, m] = l.adcNot.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    
    const valorContrato = obterValorContrato() || 0;
    const porcentagemHora = obterPorcentagemHora();
    const valorContratoAjustado = valorContrato * (porcentagemHora / 100);
    const valorPorHora = totalHoras > 0 ? calcularValorPorHora(valorContrato, totalHoras) : 0;
    const valorUnitContrato = lancamentos.length > 0 ? valorContratoAjustado / lancamentos.length : 0;
    
    // Obter valores unitários editáveis ou usar calculados
    const valorUnitHoraEditavel = obterValorUnitarioEditavel('valor-unit-hora');
    const valorUnitContratoEditavel = obterValorUnitarioEditavel('valor-unit-contrato');
    const valorUnitHorasExtraEditavel = obterValorUnitarioEditavel('valor-unit-horas-extra');
    const valorUnitAdcNotEditavel = obterValorUnitarioEditavel('valor-unit-adc-not');
    
    const valorPorHoraFinal = valorUnitHoraEditavel !== null ? valorUnitHoraEditavel : valorPorHora;
    const valorUnitContratoFinal = valorUnitContratoEditavel !== null ? valorUnitContratoEditavel : valorUnitContrato;
    // Calcular horas extras usando valor do contrato com porcentagem da hora
    const valorPorHoraComPorcentagem = totalHoras > 0 ? valorContratoAjustado / (totalHoras / 60) : 0;
    const valorUnitHorasExtraFinal = valorUnitHorasExtraEditavel !== null ? valorUnitHorasExtraEditavel : (valorPorHoraComPorcentagem * 1.5);
    const valorUnitAdcNotFinal = valorUnitAdcNotEditavel !== null ? valorUnitAdcNotEditavel : (valorPorHoraComPorcentagem * 0.2);
    
    const valorHorasExtra = (totalHorasExtra / 60) * valorUnitHorasExtraFinal;
    const valorAdcNot = (totalAdcNot / 60) * valorUnitAdcNotFinal;
    
    // Calcular valores totais usando os valores unitários
    const valorTotalSomaCalculado = totalHoras > 0 ? valorPorHoraFinal * (totalHoras / 60) : 0;
    // Usar valor do contrato ajustado com porcentagem da hora
    const valorTotalContratoCalculado = lancamentos.length > 0 ? valorUnitContratoFinal * lancamentos.length : valorContratoAjustado;
    
    // Atualizar elementos da tabela
    const totalSomaDiaria = document.getElementById('total-soma-diaria');
    const totalContratoElement = document.getElementById('total-contrato');
    const totalHorasExtraElement = document.getElementById('total-horas-extra');
    const totalAdcNotElement = document.getElementById('total-adc-not');
    
    const valorUnitHora = document.getElementById('valor-unit-hora');
    const valorUnitContratoElement = document.getElementById('valor-unit-contrato');
    const valorUnitHorasExtra = document.getElementById('valor-unit-horas-extra');
    const valorUnitAdcNot = document.getElementById('valor-unit-adc-not');
    
    const valorTotalSoma = document.getElementById('valor-total-soma');
    const valorTotalContrato = document.getElementById('valor-total-contrato');
    const valorTotalHorasExtra = document.getElementById('valor-total-horas-extra');
    const valorTotalAdcNot = document.getElementById('valor-total-adc-not');
    
    if (totalSomaDiaria) {
        totalSomaDiaria.innerHTML = `<strong>${formatarHora(totalHoras)}</strong>`;
    }
    
    if (totalContratoElement) {
        totalContratoElement.innerHTML = `<strong>${formatarHora(totalContrato)}</strong>`;
    }
    
    if (totalHorasExtraElement) {
        totalHorasExtraElement.innerHTML = `<strong>${formatarHora(totalHorasExtra)}</strong>`;
    }
    
    if (totalAdcNotElement) {
        totalAdcNotElement.innerHTML = `<strong>${formatarHora(totalAdcNot)}</strong>`;
    }
    
    // Atualizar campos editáveis apenas se não tiverem valor manual
    if (valorUnitHora && valorUnitHora.tagName === 'INPUT') {
        if (valorUnitHoraEditavel === null || valorUnitHora.value === '' || valorUnitHora.value === '0,00') {
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(valorPorHora);
            valorUnitHora.value = valorFormatado;
        }
    } else if (valorUnitHora) {
        valorUnitHora.innerHTML = `<strong>${formatarMoeda(valorPorHoraFinal)}</strong>`;
    }
    
    if (valorUnitContratoElement && valorUnitContratoElement.tagName === 'INPUT') {
        if (valorUnitContratoEditavel === null || valorUnitContratoElement.value === '' || valorUnitContratoElement.value === '0,00') {
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(valorUnitContrato);
            valorUnitContratoElement.value = valorFormatado;
        }
    } else if (valorUnitContratoElement) {
        valorUnitContratoElement.innerHTML = `<strong>${formatarMoeda(valorUnitContratoFinal)}</strong>`;
    }
    
    if (valorUnitHorasExtra && valorUnitHorasExtra.tagName === 'INPUT') {
        if (valorUnitHorasExtraEditavel === null || valorUnitHorasExtra.value === '' || valorUnitHorasExtra.value === '0,00') {
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(valorUnitHorasExtraFinal);
            valorUnitHorasExtra.value = valorFormatado;
        }
    } else if (valorUnitHorasExtra) {
        valorUnitHorasExtra.innerHTML = `<strong>${formatarMoeda(valorUnitHorasExtraFinal)}</strong>`;
    }
    
    if (valorUnitAdcNot && valorUnitAdcNot.tagName === 'INPUT') {
        if (valorUnitAdcNotEditavel === null || valorUnitAdcNot.value === '' || valorUnitAdcNot.value === '0,00') {
            const valorFormatado = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(valorUnitAdcNotFinal);
            valorUnitAdcNot.value = valorFormatado;
        }
    } else if (valorUnitAdcNot) {
        valorUnitAdcNot.innerHTML = `<strong>${formatarMoeda(valorUnitAdcNotFinal)}</strong>`;
    }
    
    // Atualizar valores totais calculados
    if (valorTotalSoma) {
        valorTotalSoma.innerHTML = `<strong>${formatarMoeda(valorTotalSomaCalculado)}</strong>`;
    }
    
    if (valorTotalContrato) {
        valorTotalContrato.innerHTML = `<strong>${formatarMoeda(valorTotalContratoCalculado)}</strong>`;
    }
    
    if (valorTotalHorasExtra) {
        valorTotalHorasExtra.innerHTML = `<strong>${formatarMoeda(valorHorasExtra)}</strong>`;
    }
    
    if (valorTotalAdcNot) {
        valorTotalAdcNot.innerHTML = `<strong>${formatarMoeda(valorAdcNot)}</strong>`;
    }
    
    // Atualizar resumo final
    atualizarResumoFinal();
}

// Atualizar resumo final
function atualizarResumoFinal() {
    try {
        // Calcular totais de horas
        const totalHoras = lancamentos.reduce((acc, l) => {
            if (!l || !l.horasTrabalhadas) return acc;
            const [h, m] = l.horasTrabalhadas.split(':').map(Number);
            return acc + (h || 0) * 60 + (m || 0);
        }, 0);
        
        // Obter valores da tabela se disponíveis, senão calcular
        const valorTotalSomaElement = document.getElementById('valor-total-soma');
        const valorTotalContratoElement = document.getElementById('valor-total-contrato');
        const valorTotalHorasExtraElement = document.getElementById('valor-total-horas-extra');
        const valorTotalAdcNotElement = document.getElementById('valor-total-adc-not');
        
        let valorTotalContratoCalculado = 0;
        if (valorTotalContratoElement) {
            const texto = valorTotalContratoElement.textContent || valorTotalContratoElement.innerText || '';
            // Remover R$, espaços e outros caracteres não numéricos
            let valorTexto = texto.replace(/[R$\s]/g, '');
            
            // Se tem ponto como separador de milhares e vírgula como decimal
            if (valorTexto.includes('.') && valorTexto.includes(',')) {
                // Remover pontos (separadores de milhares) e substituir vírgula por ponto
                valorTexto = valorTexto.replace(/\./g, '').replace(',', '.');
            } else if (valorTexto.includes(',')) {
                // Se tem apenas vírgula, substituir por ponto
                valorTexto = valorTexto.replace(',', '.');
            }
            
            valorTotalContratoCalculado = parseFloat(valorTexto) || 0;
        }
        
        // Se não tiver valor da tabela ou se o valor for 0 ou muito pequeno (menor que 1), calcular baseado no valor do contrato
        if (!valorTotalContratoElement || valorTotalContratoCalculado < 1) {
            const valorContrato = obterValorContrato() || 0;
            const porcentagemHora = obterPorcentagemHora();
            // Valor total = valor do contrato ajustado pela porcentagem da hora (sem dividir por dias)
            valorTotalContratoCalculado = valorContrato * (porcentagemHora / 100);
        }
        
        const valorHorasExtrasManual = obterValorHorasExtrasManual() || 0;
        const valorAdcNoturnoManual = obterValorAdcNoturnoManual() || 0;
        const totalDescontos = obterTotalDescontos() || 0;
        const totalMobilizacao = obterTotalMobilizacao() || 0;
        const valorFinal = valorTotalContratoCalculado + valorHorasExtrasManual + valorAdcNoturnoManual + totalMobilizacao - totalDescontos;
        
        const totalHorasFinal = document.getElementById('total-horas-final');
        const totalDiasFinal = document.getElementById('total-dias-final');
        const valorTotalFinal = document.getElementById('valor-total-final');
        const totalMedicaoFinal = document.getElementById('total-medicao-final');
        const totalHorasExtrasManualSpan = document.getElementById('total-horas-extras-manual');
        const totalAdcNoturnoManualSpan = document.getElementById('total-adc-noturno-manual');
        
        // Atualizar campos da seção MEDIÇÃO
        if (totalHorasFinal) {
            totalHorasFinal.textContent = formatarHora(totalHoras);
        } else {
            console.warn('Elemento total-horas-final não encontrado');
        }
        
        if (totalDiasFinal) {
            totalDiasFinal.textContent = lancamentos.length || 0;
        } else {
            console.warn('Elemento total-dias-final não encontrado');
        }
        
        if (valorTotalFinal) {
            valorTotalFinal.textContent = formatarMoeda(valorTotalContratoCalculado);
        } else {
            console.warn('Elemento valor-total-final não encontrado');
        }
        
        if (totalHorasExtrasManualSpan) {
            totalHorasExtrasManualSpan.textContent = formatarMoeda(valorHorasExtrasManual);
        }
        
        if (totalAdcNoturnoManualSpan) {
            totalAdcNoturnoManualSpan.textContent = formatarMoeda(valorAdcNoturnoManual);
        }
        
        if (totalMedicaoFinal) {
            totalMedicaoFinal.textContent = formatarMoeda(Math.max(0, valorFinal));
        }
        
        // Debug: log dos valores calculados
        console.log('📊 Resumo Final atualizado:', {
            totalHoras: formatarHora(totalHoras),
            totalDias: lancamentos.length,
            valorContrato: obterValorContrato(),
            porcentagemHora: obterPorcentagemHora(),
            valorTotalContrato: formatarMoeda(valorTotalContratoCalculado),
            valorFinal: formatarMoeda(valorFinal),
            valorTabela: valorTotalContratoElement ? (valorTotalContratoElement.textContent || valorTotalContratoElement.innerText) : 'não encontrado'
        });
    } catch (error) {
        console.error('Erro ao atualizar resumo final:', error);
    }
}

// Obter valor do combustível
function obterValorCombustivel() {
    const valorInput = document.getElementById('valor-combustivel');
    if (!valorInput) return 0;
    
    const valor = valorInput.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(valor) || 0;
}

// Obter valor de outros descontos
function obterValorOutrosDescontos() {
    const valorInput = document.getElementById('valor-outros-descontos');
    if (!valorInput) return 0;
    
    const valor = valorInput.value.replace(/[^\d,.-]/g, '').replace(',', '.');
    return parseFloat(valor) || 0;
}

// Obter total de descontos
function obterTotalDescontos() {
    return obterValorCombustivel() + obterValorOutrosDescontos();
}

// Atualizar descontos
function atualizarDescontos() {
    const valorCombustivel = obterValorCombustivel();
    const valorOutrosDescontos = obterValorOutrosDescontos();
    const totalDescontos = valorCombustivel + valorOutrosDescontos;
    
    // Atualizar exibição dos valores
    const totalCombustivel = document.getElementById('total-combustivel');
    const totalOutrosDescontos = document.getElementById('total-outros-descontos');
    const totalDescontosFinal = document.getElementById('total-descontos-final');
    
    if (totalCombustivel) {
        totalCombustivel.textContent = formatarMoeda(valorCombustivel);
    }
    
    if (totalOutrosDescontos) {
        totalOutrosDescontos.textContent = formatarMoeda(valorOutrosDescontos);
    }
    
    if (totalDescontosFinal) {
        totalDescontosFinal.textContent = formatarMoeda(totalDescontos);
    }
    
    // Atualizar total da medição
    atualizarResumoFinal();
}

// Obter valor manual de horas extras
function obterValorHorasExtrasManual() {
    const valorInput = document.getElementById('valor-horas-extras-manual');
    if (!valorInput || !valorInput.value) return 0;
    let valor = valorInput.value.replace(/[^\d,.-]/g, '');
    if (valor.includes('.') && valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
        valor = valor.replace(',', '.');
    }
    const num = parseFloat(valor);
    return isNaN(num) ? 0 : num;
}

// Obter valor manual de ADC noturno
function obterValorAdcNoturnoManual() {
    const valorInput = document.getElementById('valor-adc-noturno-manual');
    if (!valorInput || !valorInput.value) return 0;
    let valor = valorInput.value.replace(/[^\d,.-]/g, '');
    if (valor.includes('.') && valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
        valor = valor.replace(',', '.');
    }
    const num = parseFloat(valor);
    return isNaN(num) ? 0 : num;
}

// Obter valor de mobilização ida
function obterMobilizacaoIda() {
    const valorInput = document.getElementById('mobilizacao-ida');
    if (!valorInput || !valorInput.value) return 0;
    let valor = valorInput.value.replace(/[^\d,.-]/g, '');
    if (valor.includes('.') && valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
        valor = valor.replace(',', '.');
    }
    const num = parseFloat(valor);
    return isNaN(num) ? 0 : num;
}

// Obter valor de mobilização volta
function obterMobilizacaoVolta() {
    const valorInput = document.getElementById('mobilizacao-volta');
    if (!valorInput || !valorInput.value) return 0;
    let valor = valorInput.value.replace(/[^\d,.-]/g, '');
    if (valor.includes('.') && valor.includes(',')) {
        valor = valor.replace(/\./g, '').replace(',', '.');
    } else if (valor.includes(',')) {
        valor = valor.replace(',', '.');
    }
    const num = parseFloat(valor);
    return isNaN(num) ? 0 : num;
}

// Obter total de mobilização
function obterTotalMobilizacao() {
    return obterMobilizacaoIda() + obterMobilizacaoVolta();
}

// Atualizar data do lançamento
function atualizarDataLancamento(index, novaData) {
    if (index >= 0 && index < lancamentos.length) {
        lancamentos[index].data = novaData;
        const [ano, mes, dia] = novaData.split('-');
        lancamentos[index].dia = parseInt(dia);
        lancamentos[index].diaSemana = obterDiaSemana(novaData);
        
        // Obter o índice correto do dia da semana (0=DOM, 1=SEG, ..., 5=SEX, 6=SÁB)
        const data = new Date(ano, mes - 1, dia);
        const diaSemanaIndex = data.getDay();
        lancamentos[index].horasContrato = obterHorasContrato(diaSemanaIndex);
        
        // Atualizar horários se for sexta-feira (8 horas: 07:00 às 16:00)
        if (diaSemanaIndex === 5) { // Sexta-feira
            lancamentos[index].entrada = '07:00';
            lancamentos[index].almoco = '12:00';
            lancamentos[index].retorno = '13:00';
            lancamentos[index].saida = '16:00';
        } else {
            // Manter horários existentes ou usar padrão
            if (!lancamentos[index].entrada) {
                lancamentos[index].entrada = document.getElementById('horario-entrada')?.value || '07:00';
            }
            if (!lancamentos[index].almoco) {
                lancamentos[index].almoco = document.getElementById('horario-almoco')?.value || '12:00';
            }
            if (!lancamentos[index].retorno) {
                lancamentos[index].retorno = document.getElementById('horario-retorno')?.value || '13:00';
            }
            if (!lancamentos[index].saida) {
                lancamentos[index].saida = document.getElementById('horario-saida')?.value || '17:00';
            }
        }
        
        // Recalcular horas trabalhadas
        lancamentos[index].horasTrabalhadas = calcularHorasTrabalhadas(
            lancamentos[index].entrada,
            lancamentos[index].almoco,
            lancamentos[index].retorno,
            lancamentos[index].saida
        );
        
        atualizarTabela();
        salvarDados();
        mostrarNotificacao('Data atualizada com sucesso!', 'success');
    }
}

// Atualizar horário do lançamento
function atualizarHorarioLancamento(index, tipo, novoHorario) {
    if (index >= 0 && index < lancamentos.length) {
        lancamentos[index][tipo] = novoHorario;
        
        // Se for um horário de trabalho, recalcular horas trabalhadas e horas extras
        if (['entrada', 'almoco', 'retorno', 'saida'].includes(tipo)) {
            lancamentos[index].horasTrabalhadas = calcularHorasTrabalhadas(
                lancamentos[index].entrada,
                lancamentos[index].almoco,
                lancamentos[index].retorno,
                lancamentos[index].saida
            );
            
            // Recalcular horas de contrato baseado no dia da semana
            const data = new Date(lancamentos[index].data);
            const diaSemanaIndex = data.getDay();
            lancamentos[index].horasContrato = obterHorasContrato(diaSemanaIndex);
            
            // Recalcular horas extras automaticamente
            const [hTrab, mTrab] = lancamentos[index].horasTrabalhadas.split(':').map(Number);
            const totalTrabMin = hTrab * 60 + mTrab;
            const totalContMin = lancamentos[index].horasContrato * 60;
            const horasExtrasMin = Math.max(0, totalTrabMin - totalContMin);
            lancamentos[index].horasExtra = `${Math.floor(horasExtrasMin / 60).toString().padStart(2, '0')}:${(horasExtrasMin % 60).toString().padStart(2, '0')}`;
        }
        
        // Se for edição manual de horas extras ou ADC NOT, manter o valor editado
        if (tipo === 'horasExtra' || tipo === 'adcNot') {
            // Manter o valor editado pelo usuário
            lancamentos[index][tipo] = novoHorario;
        }
        
        atualizarTabela();
        atualizarTotais();
        salvarDados();
        mostrarNotificacao('Horário atualizado com sucesso!', 'success');
    }
}

// Formatar input de moeda
function formatarMoedaInput(input) {
    // Se o campo já está formatado corretamente, não fazer nada
    if (input.value.match(/^\d{1,3}(\.\d{3})*,\d{2}$/)) {
    return;
    }
    
    let valor = input.value.replace(/\D/g, '');
    
    if (valor === '') {
        input.value = '';
        return;
    }
    
    // Converter para número
    let numero = parseInt(valor);
    
    // Formatar com separadores de milhares e decimais
    let formatado = (numero / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    input.value = formatado;
}

// Obter valor do contrato
function obterValorContrato() {
    const valorInput = document.getElementById('valor-contrato');
    if (!valorInput) return 2500;
    
    let valor = valorInput.value;
    
    // Se estiver vazio, retornar valor padrão
    if (!valor || valor.trim() === '') return 2500;
    
    // Remover R$, espaços e outros caracteres não numéricos
    valor = valor.replace(/[R$\s]/g, '');
    
    // Se tem vírgula como separador decimal, substituir por ponto
    if (valor.includes(',') && !valor.includes('.')) {
        valor = valor.replace(',', '.');
    }
    
    // Se tem ponto como separador de milhares e vírgula como decimal
    if (valor.includes('.') && valor.includes(',')) {
        // Remover pontos (separadores de milhares) e substituir vírgula por ponto
        valor = valor.replace(/\./g, '').replace(',', '.');
    }
    
    // Converter para número
    const numero = parseFloat(valor);
    
    // Se não conseguir converter ou for inválido, retornar valor padrão
    if (isNaN(numero) || numero <= 0) return 2500;
    
    return numero;
}

// Formatar hora
function formatarHora(minutos) {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Formatar moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Pré-visualizar
function previsualizar() {
    if (lancamentos.length === 0) {
        mostrarNotificacao('Gere uma medição primeiro', 'warning');
        return;
    }
    
    mostrarNotificacao('Pré-visualização: ' + lancamentos.length + ' dias gerados', 'info');
}

// Limpar tabela
function limparTabela() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        lancamentos = [];
        atualizarTabela();
        salvarDados();
        mostrarNotificacao('Tabela limpa com sucesso', 'success');
    }
}

// Gerar relatório
function gerarRelatorio() {
    if (lancamentos.length === 0) {
        mostrarNotificacao('Gere uma medição primeiro', 'warning');
        return;
    }
    
    mostrarNotificacao('Relatório gerado com sucesso!', 'success');
}

// Função removida - agora carregamos a imagem diretamente no PDF

// Exportar PDF
async function exportarPDF() {
    if (lancamentos.length === 0) {
        mostrarNotificacao('Gere uma medição primeiro', 'warning');
        return;
    }
    
    mostrarNotificacao('Exportando PDF...', 'info');
    
    // Verificar se a biblioteca jsPDF está carregada
    if (typeof window.jspdf === 'undefined') {
        mostrarNotificacao('Erro: Biblioteca jsPDF não carregada. Recarregue a página.', 'error');
        return;
    }
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            mostrarNotificacao('Erro: Biblioteca jsPDF não encontrada', 'error');
            return;
        }
        
        const doc = new jsPDF('portrait', 'mm', 'a4');
        
        // Configurações otimizadas para A4 em pé - uma folha só
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 8;
        const tableStartY = 50;
        const rowHeight = 4;
    
    // Obter dados do formulário
    const cnpjEmpresa = document.getElementById('cnpj-empresa')?.value || '14.251.442/0001-15';
    const nomeEmpresa = document.getElementById('nome-empresa')?.value || 'M.A VIANA LOCAÇÕES E SERVIÇOS - ME';
    const enderecoObra = document.getElementById('endereco-obra')?.value || '';
    const ruaEmpresa = document.getElementById('rua-empresa')?.value || 'Rua Desembargador Auro Cerqueira Leite, 36';
    const cidadeEmpresa = document.getElementById('cidade-empresa')?.value || 'Cidade Kemel - São Paulo, SP';
    const cepEmpresa = document.getElementById('cep-empresa')?.value || '08130-410';
    const cnpjCliente = document.getElementById('cnpj-cliente')?.value || '';
    const equipamento = obterEquipamento();
    const nomeContrato = document.getElementById('nome-contrato')?.value || 'Cons Vila Romana';
    const valorContrato = obterValorContrato();
    const tipoMedicao = obterTipoMedicaoFormatado();
    const operador = document.getElementById('operador')?.value || 'ANTONIO PEREIRA';
    const valorHorasExtrasManual = obterValorHorasExtrasManual();
    const valorAdcNoturnoManual = obterValorAdcNoturnoManual();
    const mobilizacaoIda = obterMobilizacaoIda();
    const mobilizacaoVolta = obterMobilizacaoVolta();
    const totalMobilizacao = obterTotalMobilizacao();
    
        // Cabeçalho profissional com sua imagem PNG personalizada
        console.log('🔄 Carregando sua imagem PNG para o PDF...');
        
        // Aguardar o carregamento da imagem antes de continuar
        await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                console.log('✅ Imagem gerar_icone.png carregada!');
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    const dataURL = canvas.toDataURL('image/png');
                    console.log('✅ Convertendo para DataURL...');
                    
                    // Adicionar imagem ao PDF (centralizada e maior)
                    const logoWidth = 30;
                    const logoHeight = 30;
                    const logoX = pageWidth / 2 - logoWidth / 2;
                    const logoY = 8;
                    doc.addImage(dataURL, 'PNG', logoX, logoY, logoWidth, logoHeight);
                    console.log('✅ Sua imagem PNG foi adicionada ao PDF!');
                    resolve();
                } catch (error) {
                    console.log('❌ Erro ao processar imagem:', error);
                    resolve();
                }
            };
            
            img.onerror = function() {
                console.log('❌ Erro ao carregar images/gerar_icone.png');
                resolve();
            };
            
            console.log('📁 Carregando: images/gerar_icone.png');
            img.src = 'images/gerar_icone.png';
        });
        
        // Título principal (abaixo do logo)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('CONTROLE DE MEDIÇÃO', pageWidth / 2, 45, { align: 'center' });
        
        // Nome da empresa
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('M.A VIANA LOCAÇÕES E SERVIÇOS - ME', pageWidth / 2, 50, { align: 'center' });
        
        // Linha separadora elegante
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(1);
        doc.line(margin, 53, pageWidth - margin, 53);
        
        // Informações da empresa (lado esquerdo) - mais organizadas
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('DADOS DA EMPRESA', margin, 60);
        
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text(`CNPJ: ${cnpjEmpresa}`, margin, 65);
        doc.text(ruaEmpresa, margin, 69);
        doc.text(cidadeEmpresa, margin, 73);
        doc.text(`CEP: ${cepEmpresa}`, margin, 77);
        
        // Caixa OBRA (lado direito) - mais elegante
        doc.setFillColor(248, 249, 250);
        doc.rect(margin + 100, 58, 90, 25, 'F');
        doc.setDrawColor(0, 123, 255);
        doc.setLineWidth(0.5);
        doc.rect(margin + 100, 58, 90, 25, 'S');
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('DADOS DA OBRA', margin + 105, 64);
        
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.text(`Equipamento: ${equipamento}`, margin + 105, 69);
        doc.text(`Contrato: ${formatarMoeda(valorContrato)}`, margin + 105, 73);
        doc.text(`Tipo: ${tipoMedicao}`, margin + 105, 77);
        
        // Seção DADOS DO CLIENTE
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('DADOS DO CLIENTE', margin, 85);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        if (cnpjCliente) {
            doc.text(`CNPJ Cliente: ${cnpjCliente}`, margin, 90);
        }
        doc.text(`Nome do Contrato/Empresa: ${nomeContrato}`, margin, 94);
        
        if (enderecoObra) {
            doc.text(`Endereço: ${enderecoObra}`, margin, 98);
        }
        
        // Seção MOBILIZAÇÃO
        let mobilizacaoY = 98;
        if (enderecoObra) {
            mobilizacaoY = 102;
        }
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.text('MOBILIZAÇÃO', margin, mobilizacaoY);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(`Mobilização Ida: ${formatarMoeda(mobilizacaoIda)}`, margin, mobilizacaoY + 4);
        doc.text(`Mobilização Volta: ${formatarMoeda(mobilizacaoVolta)}`, margin, mobilizacaoY + 8);
        doc.setFont(undefined, 'bold');
        doc.text(`Total de Mobilização: ${formatarMoeda(totalMobilizacao)}`, margin, mobilizacaoY + 12);
    
    // Cabeçalho da tabela profissional
    let tableY = mobilizacaoY + 18;
    
    // Cabeçalho principal com gradiente simulado
    doc.setFillColor(0, 123, 255);
    doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('MÊS', margin + 3, tableY + 5);
    doc.text('APONTAMENTO', margin + 25, tableY + 5);
    doc.text('DESCONTOS', margin + 120, tableY + 5);
    
    // Sub-cabeçalho com fundo branco e bordas elegantes
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, tableY + 8, pageWidth - 2 * margin, 8, 'F');
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.3);
    doc.rect(margin, tableY + 8, pageWidth - 2 * margin, 8, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    
    // Coluna MÊS
    doc.text('MÊS', margin + 3, tableY + 13);
    
    // Colunas APONTAMENTO
    doc.text('ENTRADA', margin + 25, tableY + 13);
    doc.text('ALMOÇO', margin + 45, tableY + 13);
    doc.text('SAÍDA', margin + 65, tableY + 13);
    doc.text('SOMA DIARIA', margin + 85, tableY + 13);
    doc.text('CONTRATO', margin + 105, tableY + 13);
    
    // Colunas DESCONTOS
    doc.text('HORAS EXTRA', margin + 120, tableY + 13);
    doc.text('ADC NOT', margin + 140, tableY + 13);
    doc.text('HORAS', margin + 160, tableY + 13);
    doc.text('DIARIA', margin + 175, tableY + 13);
    
    // Dados da tabela com design profissional
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.setFont(undefined, 'normal');
    
    let currentY = tableY + 16;
    const maxY = pageHeight - 80;
    
    // Gerar apenas os dias que têm lançamentos
    // Ordenar lançamentos por dia
    const lancamentosOrdenados = [...lancamentos].sort((a, b) => a.dia - b.dia);
    
    // Se não houver lançamentos, não gerar tabela
    if (lancamentosOrdenados.length === 0) {
        doc.text('Nenhum lançamento encontrado', margin, tableY + 20);
    } else {
        // Usar o mês do primeiro lançamento
        let mesAtual = mesReferencia || new Date().getMonth() + 1;
        let anoAtual = anoReferencia || new Date().getFullYear();
        
        if (lancamentosOrdenados[0].data) {
            const [ano, mes] = lancamentosOrdenados[0].data.split('-');
            anoAtual = parseInt(ano);
            mesAtual = parseInt(mes);
        }
        
        // Gerar apenas os dias com lançamentos
        for (const lancamento of lancamentosOrdenados) {
            // Verificar se precisa de nova página
            if (currentY > maxY) {
                doc.addPage();
                currentY = 20;
            }
            
            // Obter dados do lançamento
            const [ano, mes, dia] = lancamento.data.split('-');
            const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            const diaSemana = data.getDay();
            const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            const diaSemanaNome = diasSemana[diaSemana];
            
            // Fundo da linha com design profissional
            if (diaSemana === 0 || diaSemana === 6) {
                // Fins de semana com fundo cinza claro
                doc.setFillColor(248, 249, 250);
            } else {
                // Dias úteis com fundo branco
                doc.setFillColor(255, 255, 255);
            }
            doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'F');
            
            // Borda da linha elegante
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'S');
            
            // Coluna MÊS - formato "03 sex"
            doc.text(`${parseInt(dia).toString().padStart(2, '0')} ${diaSemanaNome.toLowerCase()}`, margin + 1, currentY + 2);
            
            // Colunas APONTAMENTO com design melhorado
            doc.setFont(undefined, 'bold');
            doc.text(lancamento.entrada || '00:00', margin + 25, currentY + 2);
            doc.text(lancamento.almoco || '00:00', margin + 45, currentY + 2);
            doc.text(lancamento.saida || '00:00', margin + 65, currentY + 2);
            doc.text(lancamento.horasTrabalhadas || '00:00', margin + 85, currentY + 2);
            doc.text(`${lancamento.horasContrato || 0}:00`, margin + 105, currentY + 2);
            doc.setFont(undefined, 'normal');
            
            // Colunas DESCONTOS com cores profissionais
            // Coluna HORAS EXTRA - fundo azul claro
            doc.setFillColor(230, 244, 255);
            doc.rect(margin + 120, currentY - 1, 15, rowHeight, 'F');
            doc.setDrawColor(0, 123, 255);
            doc.setLineWidth(0.2);
            doc.rect(margin + 120, currentY - 1, 15, rowHeight, 'S');
            doc.text(lancamento.horasExtra || '00:00', margin + 122, currentY + 2);
            
            // Coluna ADC NOT - fundo verde claro
            doc.setFillColor(230, 255, 230);
            doc.rect(margin + 140, currentY - 1, 15, rowHeight, 'F');
            doc.setDrawColor(40, 167, 69);
            doc.setLineWidth(0.2);
            doc.rect(margin + 140, currentY - 1, 15, rowHeight, 'S');
            doc.text(lancamento.adcNot || '00:00', margin + 142, currentY + 2);
            
            // Coluna HORAS - fundo amarelo claro
            doc.setFillColor(255, 248, 220);
            doc.rect(margin + 160, currentY - 1, 10, rowHeight, 'F');
            doc.setDrawColor(255, 193, 7);
            doc.setLineWidth(0.2);
            doc.rect(margin + 160, currentY - 1, 10, rowHeight, 'S');
            doc.text('00:00', margin + 162, currentY + 2);
            
            // Coluna DIARIA
            doc.text('0,00', margin + 175, currentY + 2);
            
            currentY += rowHeight;
        }
    }
    
    // Linhas de totais compactas
    currentY += 1;
    
    // Calcular totais
    const totalHoras = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasTrabalhadas) return acc;
        const [h, m] = l.horasTrabalhadas.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    
    const totalContrato = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasContrato) return acc;
        return acc + (l.horasContrato || 0) * 60;
    }, 0);
    
    const totalHorasExtras = lancamentos.reduce((acc, l) => {
        if (!l || !l.horasTrabalhadas || !l.horasContrato) return acc;
        const [hTrab, mTrab] = l.horasTrabalhadas.split(':').map(Number);
        const totalTrabMin = (hTrab || 0) * 60 + (mTrab || 0);
        const totalContMin = (l.horasContrato || 0) * 60;
        return acc + Math.max(0, totalTrabMin - totalContMin);
    }, 0);
    
    const totalAdcNot = lancamentos.reduce((acc, l) => {
        if (!l || !l.adcNot) return acc;
        const [h, m] = l.adcNot.split(':').map(Number);
        return acc + (h || 0) * 60 + (m || 0);
    }, 0);
    
    const porcentagemHora = obterPorcentagemHora();
    const valorContratoAjustado = valorContrato * (porcentagemHora / 100);
    const valorPorHora = calcularValorPorHora(valorContrato, totalHoras);
    const valorTotal = valorPorHora * (totalHoras / 60);
    // Calcular valor por hora com porcentagem para horas extras
    const valorPorHoraComPorcentagem = totalHoras > 0 ? valorContratoAjustado / (totalHoras / 60) : 0;
    // Usar valores manuais se disponíveis, senão usar valor do contrato com porcentagem da hora
    const valorHorasExtra = valorHorasExtrasManual > 0 ? valorHorasExtrasManual : ((totalHorasExtras / 60) * (valorPorHoraComPorcentagem * 1.5));
    const valorAdcNot = valorAdcNoturnoManual > 0 ? valorAdcNoturnoManual : ((totalAdcNot / 60) * (valorPorHoraComPorcentagem * 0.2));
    
    // Linha TOTAL com design profissional
    doc.setFillColor(0, 123, 255);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'F');
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL', margin + 3, currentY + 2);
    doc.text(formatarHora(totalHoras), margin + 85, currentY + 2);
    doc.text(lancamentos.length.toString(), margin + 105, currentY + 2);
    doc.text(formatarHora(totalHorasExtras), margin + 122, currentY + 2);
    doc.text(formatarHora(totalAdcNot), margin + 142, currentY + 2);
    doc.text('0', margin + 162, currentY + 2);
    doc.text('0,00', margin + 175, currentY + 2);
    
    currentY += rowHeight;
    
    // Linha UNIT com design elegante
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'S');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.setFont(undefined, 'bold');
    doc.text('UNIT', margin + 3, currentY + 2);
    doc.text(formatarMoeda(valorPorHora), margin + 85, currentY + 2);
    doc.text(formatarMoeda(valorPorHora), margin + 105, currentY + 2);
    doc.text(formatarMoeda(valorPorHoraComPorcentagem * 1.5), margin + 122, currentY + 2);
    doc.text(formatarMoeda(valorPorHoraComPorcentagem * 0.2), margin + 142, currentY + 2);
    doc.text('0,00', margin + 162, currentY + 2);
    doc.text('0,00', margin + 175, currentY + 2);
    
    currentY += rowHeight;
    
    // Linha R$ TOTAL com destaque
    doc.setFillColor(40, 167, 69);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'F');
    doc.setDrawColor(40, 167, 69);
    doc.setLineWidth(0.3);
    doc.rect(margin, currentY - 1, pageWidth - 2 * margin, rowHeight, 'S');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.text('R$ TOTAL', margin + 3, currentY + 2);
    doc.text(formatarMoeda(valorTotal), margin + 85, currentY + 2);
    doc.text(formatarMoeda(valorContratoAjustado), margin + 105, currentY + 2);
    doc.text(formatarMoeda(valorHorasExtra), margin + 122, currentY + 2);
    doc.text(formatarMoeda(valorAdcNot), margin + 142, currentY + 2);
    doc.text('0,00', margin + 162, currentY + 2);
    doc.text('0,00', margin + 175, currentY + 2);
    
    // Caixas de resumo compactas
    currentY += 3;
    
    // Caixa MEDIÇÃO (esquerda) - azul
    doc.setFillColor(230, 244, 255);
    doc.rect(margin, currentY, 55, 18, 'F');
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY, 55, 18, 'S');
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text('MEDIÇÃO', margin + 3, currentY + 5);
    
    doc.setTextColor(0, 0, 0); // Preto
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.text(`${tipoMedicao}: ${formatarMoeda(valorContratoAjustado)}`, margin + 3, currentY + 8);
    doc.text(`HORAS EXTRAS: ${formatarMoeda(valorHorasExtrasManual)}`, margin + 3, currentY + 11);
    doc.text(`ADC NOTURNO: ${formatarMoeda(valorAdcNoturnoManual)}`, margin + 3, currentY + 14);
    if (totalMobilizacao > 0) {
        doc.text(`MOBILIZAÇÃO: ${formatarMoeda(totalMobilizacao)}`, margin + 3, currentY + 17);
    }
    
    const totalMedicao = valorContratoAjustado + valorHorasExtrasManual + valorAdcNoturnoManual + totalMobilizacao;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(7);
    const totalY = totalMobilizacao > 0 ? currentY + 20 : currentY + 17;
    doc.text(`TOTAL R$ ${formatarMoeda(totalMedicao)}`, margin + 3, totalY);
    
    // Caixa DESCONTOS (centro) - laranja
    doc.setFillColor(255, 248, 220);
    doc.rect(margin + 60, currentY, 55, 18, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.setLineWidth(0.5);
    doc.rect(margin + 60, currentY, 55, 18, 'S');
    
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text('DESCONTOS', margin + 63, currentY + 5);
    
    doc.setTextColor(0, 0, 0); // Preto
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    const valorCombustivel = obterValorCombustivel();
    const valorOutrosDescontos = obterValorOutrosDescontos();
    const totalDescontos = obterTotalDescontos();
    
    doc.text(`COMBUSTÍVEL: ${formatarMoeda(valorCombustivel)}`, margin + 63, currentY + 8);
    doc.text(`OUTROS: ${formatarMoeda(valorOutrosDescontos)}`, margin + 63, currentY + 11);
    doc.text(`TOTAL: ${formatarMoeda(totalDescontos)}`, margin + 63, currentY + 14);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(7);
    doc.text(`TOTAL R$ ${formatarMoeda(totalDescontos)}`, margin + 63, currentY + 17);
    
    // Caixa TOTAL MEDIÇÃO (direita) - verde
    doc.setFillColor(230, 255, 230);
    doc.rect(margin + 120, currentY, 55, 18, 'F');
    doc.setDrawColor(40, 167, 69);
    doc.setLineWidth(0.5);
    doc.rect(margin + 120, currentY, 55, 18, 'S');
    
    doc.setTextColor(0, 0, 0); // Preto
    doc.setFontSize(7);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL MEDIÇÃO', margin + 123, currentY + 5);
    
    const valorFinal = totalMedicao - totalDescontos;
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(`R$ ${formatarMoeda(valorFinal)}`, margin + 123, currentY + 15);
    
    // Rodapé profissional com assinaturas
    currentY += 25;
    
    // Linha separadora elegante
    doc.setDrawColor(0, 123, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    
    currentY += 5;
    
    // Linhas para assinaturas com design melhorado
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, margin + 80, currentY);
    doc.line(margin + 100, currentY, margin + 180, currentY);
    
    // Nomes das empresas com destaque
    doc.setFontSize(6);
    doc.setFont(undefined, 'bold');
    doc.text('M.A VIANA LOCAÇÕES E SERVIÇOS', margin, currentY + 4);
    doc.text('HABRAS', margin + 100, currentY + 4);
    
    // Data e local com formatação elegante
    const dataFormatada = new Date().toLocaleDateString('pt-BR');
    doc.setFontSize(5);
    doc.setFont(undefined, 'normal');
    doc.text(`SÃO PAULO, ${dataFormatada}`, pageWidth / 2, currentY + 8, { align: 'center' });
    
        // Salvar
        const nomeArquivo = `controle-medicao-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
        mostrarNotificacao('PDF exportado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        mostrarNotificacao('Erro ao exportar PDF: ' + error.message, 'error');
    }
}

// Toggle tabela
function toggleTabela() {
    const tabelaContainer = document.getElementById('tabela-container');
    const btnToggle = document.getElementById('toggle-tabela');
    
    if (tabelaContainer && btnToggle) {
        if (tabelaContainer.classList.contains('oculta')) {
            tabelaContainer.classList.remove('oculta');
            btnToggle.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar';
        } else {
            tabelaContainer.classList.add('oculta');
            btnToggle.innerHTML = '<i class="fas fa-eye"></i> Mostrar';
        }
    }
}

// Configurar assinatura
function configurarAssinatura() {
    const canvas = document.getElementById('assinatura-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let desenhando = false;
    
    // Event listeners para desenhar
    canvas.addEventListener('mousedown', (e) => {
        desenhando = true;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!desenhando) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    });
    
    canvas.addEventListener('mouseup', () => {
        desenhando = false;
    });
    
    
    // Carregar assinatura salva
    const assinaturaSalva = localStorage.getItem('assinatura');
    if (assinaturaSalva) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = assinaturaSalva;
    }
}

// Salvar dados
function salvarDados() {
    const dados = {
        lancamentos: lancamentos,
        mesReferencia: mesReferencia,
        anoReferencia: anoReferencia
    };
    
    localStorage.setItem('controleMedicao', JSON.stringify(dados));
}

// Carregar dados
function carregarDados() {
    const dados = localStorage.getItem('controleMedicao');
    if (dados) {
        try {
            const parsed = JSON.parse(dados);
            lancamentos = parsed.lancamentos || [];
            mesReferencia = parsed.mesReferencia || new Date().getMonth() + 1;
            anoReferencia = parsed.anoReferencia || new Date().getFullYear();
            
            // Atualizar tabela e resumo após carregar dados
            if (lancamentos.length > 0) {
                atualizarTabela();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
}

// Atualizar interface
function atualizarInterface() {
    // Definir data atual nos campos
    const hoje = new Date();
    const dataAtual = hoje.toISOString().split('T')[0];
    const mesAtual = hoje.toISOString().substring(0, 7);
    
    // Campos de data
    const camposData = ['data-mensal', 'data-quinzenal', 'data-diaria', 'data-semanal', 'data-personalizado'];
    camposData.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            if (id === 'data-diaria') {
                campo.value = dataAtual;
    } else {
                campo.value = mesAtual;
            }
        }
    });
    
    // Atualizar data no rodapé
    const dataFooter = document.getElementById('data-footer');
    if (dataFooter) {
        dataFooter.textContent = hoje.toLocaleDateString('pt-BR');
    }
    
    // Atualizar tabela se houver dados
    if (lancamentos.length > 0) {
        atualizarTabela();
    }
    
    // Inicializar campos de desconto
    atualizarDescontos();
    
    // Inicializar formatação do campo de contrato
    const valorContratoInput = document.getElementById('valor-contrato');
    if (valorContratoInput) {
        formatarMoedaInput(valorContratoInput);
    }
    
    // Inicializar formatação dos campos de desconto
    const valorCombustivelInput = document.getElementById('valor-combustivel');
    if (valorCombustivelInput) {
        formatarMoedaInput(valorCombustivelInput);
    }
    
    const valorOutrosDescontosInput = document.getElementById('valor-outros-descontos');
    if (valorOutrosDescontosInput) {
        formatarMoedaInput(valorOutrosDescontosInput);
    }
    
    // Atualizar totais na inicialização
    atualizarTotais();
    
    // Configurar equipamento personalizado
    verificarEquipamentoCustomizado();
}

// Mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificação existente
    const notificacaoExistente = document.querySelector('.notificacao');
    if (notificacaoExistente) {
        notificacaoExistente.remove();
    }
    
    // Criar nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <div class="notificacao-mensagem">${mensagem}</div>
            <button class="notificacao-fechar">&times;</button>
        </div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notificacao);
    
    // Event listener para fechar
    const btnFechar = notificacao.querySelector('.notificacao-fechar');
    btnFechar.addEventListener('click', () => {
        notificacao.remove();
    });
    
    // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.remove();
            }
        }, 5000);
}

// Configurar PWA
function configurarPWA() {
    let deferredPrompt;
    const installButton = document.getElementById('install-app');
    
    // Event listener para beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    deferredPrompt = null;
                    installButton.style.display = 'none';
                }
            });
        }
    });
    
    // Event listener para appinstalled
    window.addEventListener('appinstalled', () => {
        console.log('PWA foi instalado');
        mostrarNotificacao('App instalado com sucesso!', 'success');
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
    
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        if (installButton) {
            installButton.style.display = 'none';
        }
    }
}

// Configurar campo de valor do contrato
function configurarCampoValorContrato() {
    const valorContratoInput = document.getElementById('valor-contrato');
    if (valorContratoInput) {
        // Event listener para mudanças no valor do contrato
        valorContratoInput.addEventListener('input', function() {
            // Formatar o valor enquanto digita
            formatarMoedaInput(this);
            // Atualizar totais automaticamente
            atualizarTotais();
        });
        
        // Event listener para quando o campo perde o foco
        valorContratoInput.addEventListener('blur', function() {
            // Garantir que o valor está formatado corretamente
            formatarMoedaInput(this);
            // Atualizar totais
            atualizarTotais();
        });
    }
}

// Verificar se equipamento personalizado foi selecionado
function verificarEquipamentoCustomizado() {
    const equipamentoSelect = document.getElementById('equipamento');
    const equipamentoCustomizado = document.getElementById('equipamento-customizado');
    
    if (equipamentoSelect && equipamentoCustomizado) {
        if (equipamentoSelect.value === 'OUTRO') {
            equipamentoCustomizado.style.display = 'block';
            equipamentoCustomizado.focus();
        } else {
            equipamentoCustomizado.style.display = 'none';
            equipamentoCustomizado.value = '';
        }
    }
}

// Obter equipamento selecionado (incluindo personalizado)
function obterEquipamento() {
    const equipamentoSelect = document.getElementById('equipamento');
    const equipamentoCustomizado = document.getElementById('equipamento-customizado');
    
    if (equipamentoSelect && equipamentoCustomizado) {
        if (equipamentoSelect.value === 'OUTRO' && equipamentoCustomizado.value.trim() !== '') {
            return equipamentoCustomizado.value.trim();
        } else if (equipamentoSelect.value !== 'OUTRO') {
            return equipamentoSelect.value;
        }
    }
    
    return 'BOB CAT'; // Valor padrão
}

console.log('✅ Script simplificado carregado com sucesso!');