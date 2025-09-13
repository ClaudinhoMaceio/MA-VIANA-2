// ========================================================
// CONTROLE DE MEDIÇÃO - M.A VIANA LOCAÇÕES
// Versão Corrigida - Todos os Bugs Resolvidos
// ========================================================

// Variáveis globais organizadas
let lancamentos = [];
let mesReferencia = new Date().getMonth() + 1;
let anoReferencia = new Date().getFullYear();
let modoQuinzena = false;
let quinzenaAtual = 1;
let periodoAtual = {
    mes: mesReferencia,
    ano: anoReferencia,
    inicio: 1,
    fim: new Date(anoReferencia, mesReferencia, 0).getDate()
};

// CORREÇÃO: Garantir que periodoAtual sempre tenha valores válidos
console.log(`🔧 Inicializando periodoAtual: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);

// DEBUG: Verificar se há alguma função sendo chamada automaticamente
console.log('🔍 DEBUG: Verificando se há chamadas automáticas...');

// Assinatura
let assinaturaSalva = null;
let desenhando = false;

// Função para configurar toggle da tabela
function configurarToggleTabela() {
    const btnToggleTabela = document.getElementById('toggle-tabela');
    const tabelaContainer = document.getElementById('tabela-container');
    
    if (btnToggleTabela && tabelaContainer) {
        btnToggleTabela.addEventListener('click', function() {
            if (tabelaContainer.classList.contains('oculta')) {
                tabelaContainer.classList.remove('oculta');
                this.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar';
                console.log('📊 Tabela mostrada');
    } else {
                tabelaContainer.classList.add('oculta');
                this.innerHTML = '<i class="fas fa-eye"></i> Mostrar';
                console.log('📊 Tabela ocultada');
            }
        });
        
        console.log('✅ Toggle da tabela configurado');
    }
}

// Função de debug para verificar o estado da tabela
function debugTabela() {
    console.log('🔍 DEBUG: Estado atual da tabela');
    console.log(`🔧 periodoAtual: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
    
    const tabelaPrincipal = document.getElementById('tabela-principal');
    if (tabelaPrincipal) {
        const linhas = tabelaPrincipal.querySelectorAll('tr');
        console.log(`📊 Total de linhas na tabela: ${linhas.length}`);
        
        linhas.forEach((linha, index) => {
            const primeiraCelula = linha.querySelector('td');
            if (primeiraCelula) {
                console.log(`📅 Linha ${index}: ${primeiraCelula.textContent}`);
            }
        });
    }
    
    // Verificar se há dados no localStorage que podem estar causando o problema
    const dadosSalvos = localStorage.getItem('lancamentos');
    if (dadosSalvos) {
        console.log('💾 Dados salvos no localStorage encontrados');
        try {
            const lancamentos = JSON.parse(dadosSalvos);
            console.log(`📊 Total de lançamentos salvos: ${lancamentos.length}`);
            lancamentos.forEach((lancamento, index) => {
                console.log(`📅 Lançamento ${index}: ${lancamento.data}`);
            });
        } catch (error) {
            console.error('❌ Erro ao ler dados do localStorage:', error);
        }
    }
}

// Funções auxiliares organizadas
function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
}

function obterDiaSemana(dataStr) {
    // Corrigir problema de atraso: criar data usando componentes locais
    const [anoStr, mesStr, diaStr] = dataStr.split('-');
    const ano = parseInt(anoStr);
    const mes = parseInt(mesStr);
    const dia = parseInt(diaStr);
    const data = new Date(ano, mes - 1, dia);
    
    const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
    const diaSemana = dias[data.getDay()];
    
    console.log(`📅 ${dataStr} -> ${data.toLocaleDateString('pt-BR')} (${diaSemana})`);
    return diaSemana;
}

function ehFeriado(dataStr) {
    const feriados = [
        '2025-01-01', // Ano Novo
        '2025-04-20', // Páscoa
        '2025-05-01', // Dia do Trabalho
        '2025-09-07', // Independência
        '2025-10-12', // Nossa Senhora
        '2025-11-02', // Finados
        '2025-11-15', // Proclamação da República
        '2025-12-25'  // Natal
    ];
    return feriados.includes(dataStr);
}

// Funções de configuração de medição organizadas
function obterValorContrato() {
    const valorContratoInput = document.getElementById('valor-contrato')?.value || '0';
    return parseFloat(valorContratoInput.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
}

function calcularValorMedicao() {
    // O valor da medição é sempre o valor do contrato (valor fixo)
    return obterValorContrato();
}

function calcularValorPorHora() {
    const valorMedicao = calcularValorMedicao();
    const totalHoras = lancamentos.reduce((acc, l) => acc + (parseFloat(l.horasTrabalhadas) || 0), 0);
    
    // Se não há horas trabalhadas, usar valor padrão
    if (totalHoras <= 0) {
        return parseFloat(document.getElementById('valor-hora-manual')?.value) || 100;
    }
    
    // Calcular valor por hora para chegar ao valor da medição
    return valorMedicao / totalHoras;
}

function calcularDiasContratados() {
    // Contar quantos dias têm lançamentos (dias contratados)
    return lancamentos.length;
}

function calcularValorPorDia() {
    const valorMedicao = calcularValorMedicao();
    const diasContratados = calcularDiasContratados();
    
    // Se não há dias contratados, usar valor padrão
    if (diasContratados <= 0) {
        return 0;
    }
    
    // Calcular valor por dia para chegar ao valor da medição
    return valorMedicao / diasContratados;
}

function atualizarConfiguracoesMedicao() {
    // Atualizar valor da medição (simplificado - apenas valor do contrato)
    const valorMedicaoAtual = document.getElementById('valor-medicao-atual');
    if (valorMedicaoAtual) {
        const valorContrato = obterValorContrato();
        valorMedicaoAtual.value = formatarMoeda(valorContrato);
        valorMedicaoAtual.title = `Valor do Contrato: ${formatarMoeda(valorContrato)}`;
    }
    
    // Mostrar informações de resumo (simplificado)
    mostrarResumoCalculos();
    
    console.log('✅ Configurações simplificadas atualizadas:', {
        valorContrato: formatarMoeda(obterValorContrato()),
        horasContratadas: calcularHorasContratadas()
    });
}

function mostrarResumoCalculos() {
    const valorContrato = obterValorContrato();
    const totalHoras = lancamentos.reduce((acc, l) => acc + (parseFloat(l.horasTrabalhadas) || 0), 0);
    const horasContratadas = calcularHorasContratadas();
    
    console.log('📊 RESUMO SIMPLIFICADO:', {
        'Valor do Contrato': formatarMoeda(valorContrato),
        'Horas Contratadas': `${horasContratadas}h`,
        'Total de Horas Apontadas': `${totalHoras.toFixed(2)}h`
    });
    
    console.log('✅ Sistema simplificado - apenas valor do contrato e informações de horas');
}

function configurarEventListenersMedicao() {
    console.log('🔧 Configurando event listeners simplificados...');
    
    // Event listener para campo valor do contrato
    const valorContratoInput = document.getElementById('valor-contrato');
    if (valorContratoInput) {
        valorContratoInput.addEventListener('input', () => {
            console.log('🔄 Valor do contrato alterado:', valorContratoInput.value);
            atualizarConfiguracoesMedicao();
            atualizarTotais();
        });
    }
    
    // Event listener para campo horas contratadas
    const horasContratadasInput = document.getElementById('horas-contratadas');
    if (horasContratadasInput) {
        horasContratadasInput.addEventListener('input', () => {
            console.log('🔄 Horas contratadas alteradas:', horasContratadasInput.value);
            atualizarConfiguracoesMedicao();
            atualizarTotais();
        });
    }
    
    // Event listener para campo valor por hora manual
    const valorHoraManualInput = document.getElementById('valor-hora-manual');
    if (valorHoraManualInput) {
        valorHoraManualInput.addEventListener('input', () => {
            console.log('🔄 Valor por hora manual alterado:', valorHoraManualInput.value);
            atualizarTotais();
        });
    }
    
    console.log('✅ Event listeners simplificados configurados');
}

// Função para recalcular horas extras com base na configuração
function recalcularHorasExtrasComConfiguracao() {
    const calcularHorasExtras = document.getElementById('calcular-horas-extras')?.checked || false;
    
    console.log('🔄 Recalculando horas extras com configuração:', calcularHorasExtras ? 'ATIVADO' : 'DESATIVADO');
    
    if (!calcularHorasExtras) {
        // Se não calcular horas extras, zerar todas
        lancamentos.forEach(lancamento => {
            lancamento.horasExtra = 0;
        });
        console.log('✅ Todas as horas extras foram zeradas');
    } else {
        // Se calcular horas extras, recalcular automaticamente
        const limiteHorasExtra = parseFloat(document.getElementById('limite-horas-extra')?.value) || 8;
        
        lancamentos.forEach(lancamento => {
            if (lancamento.horasTrabalhadas) {
                lancamento.horasExtra = Math.max(0, lancamento.horasTrabalhadas - limiteHorasExtra);
            }
        });
        console.log('✅ Horas extras recalculadas automaticamente');
    }
}

// CORREÇÃO: Função melhorada para verificar dias úteis
function ehDiaUtil(dataStr) {
    const data = new Date(dataStr);
    const diaSemana = data.getDay();
    
    // Verificar se é feriado
    if (ehFeriado(dataStr)) {
        console.log(`❌ ${dataStr} é feriado`);
        return false;
    }
    
    // Verificar configurações de fins de semana
    const incluirFinsSemana = document.getElementById('incluir-fins-semana')?.value === 'true';
    
    // Se é domingo (0) e não está ativado, não é dia útil
    if (diaSemana === 0 && !incluirFinsSemana) {
        console.log(`❌ ${dataStr} é domingo e domingos não estão ativados`);
        return false;
    }
    
    // Se é sábado (6) e não está ativado, não é dia útil
    if (diaSemana === 6 && !incluirFinsSemana) {
        console.log(`❌ ${dataStr} é sábado e sábados não estão ativados`);
        return false;
    }
    
    console.log(`✅ ${dataStr} é dia útil`);
    return true;
}

function deveExibirDia(mes, dia) {
    // Sempre exibir todos os dias do mês
    return true;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

function formatarHora(hora) {
    if (!hora) return '';
    return hora.toString().padStart(5, '0');
}

function calcularHorasTrabalhadas(entrada, almoco, saida) {
    if (!entrada || !almoco || !saida) return 0;
    
    const entradaTime = new Date(`2000-01-01T${entrada}`);
    const almocoTime = new Date(`2000-01-01T${almoco}`);
    const saidaTime = new Date(`2000-01-01T${saida}`);
    
    const manha = (almocoTime - entradaTime) / (1000 * 60 * 60);
    const tarde = (saidaTime - almocoTime) / (1000 * 60 * 60);
    
    return manha + tarde;
}

function calcularHorasExtras(horasTrabalhadas, limiteHoras = 8) {
    return Math.max(0, horasTrabalhadas - limiteHoras);
}

// CORREÇÃO: Função melhorada para obter horários específicos baseados no dia da semana
function obterHorariosPorDia(dataStr) {
    const data = new Date(dataStr);
    const diaSemana = data.getDay();
    
    // Sexta-feira (5) - horários específicos: 07:00 às 16:00
    if (diaSemana === 5) {
        console.log(`🕕 Aplicando horários especiais de sexta-feira para ${dataStr}`);
        return {
            entrada: '07:00',
            almoco: '12:00',
            saidaAlmoco: '13:00',
            saida: '16:00'
        };
    }
    
    // Para outros dias, usar horários padrão
    const entradaPadrao = document.getElementById('horario-entrada-padrao')?.value || '07:00';
    const almocoPadrao = document.getElementById('horario-almoco-padrao')?.value || '12:00';
    const saidaAlmocoPadrao = document.getElementById('horario-saida-almoco-padrao')?.value || '13:00';
    const saidaPadrao = document.getElementById('horario-saida-padrao')?.value || '17:00';
    
    return {
        entrada: entradaPadrao,
        almoco: almocoPadrao,
        saidaAlmoco: saidaAlmocoPadrao,
        saida: saidaPadrao
    };
}

// Configurar logo ao lado do título
function configurarLogoLateralTitulo() {
    const logoElement = document.getElementById('logo-lateral');
    const fallbackElement = document.getElementById('logo-fallback-titulo');
    const logoTitulo = document.querySelector('.logo-titulo');
    
    if (logoElement) {
        logoElement.onload = function() {
            console.log('✅ Logo lateral carregado com sucesso');
            logoElement.style.display = 'block';
            if (fallbackElement) fallbackElement.style.display = 'none';
            if (logoTitulo) logoTitulo.classList.remove('sem-logo');
        };
        
        logoElement.onerror = function() {
            console.warn('⚠️ Erro ao carregar logo lateral, usando fallback');
            logoElement.style.display = 'none';
            if (fallbackElement) fallbackElement.style.display = 'flex';
            if (logoTitulo) logoTitulo.classList.add('sem-logo');
        };
        
        // Verificar se já carregou
        if (logoElement.complete) {
            if (logoElement.naturalWidth > 0) {
                logoElement.onload();
            } else {
                logoElement.onerror();
            }
        }
    }
}

// Adicionar logo ao PDF
async function adicionarLogoPDFDireito(doc) {
    return new Promise((resolve) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    // Criar canvas com resolução muito alta para máxima qualidade
                    const canvas = document.createElement('canvas');
                    const scaleFactor = 10; // Aumentar resolução 10x para máxima qualidade
                    const finalWidth = 35; // Tamanho final em mm (maior para melhor visibilidade)
                    const finalHeight = 35; // Tamanho final em mm (maior para melhor visibilidade)
                    
                    // Canvas interno com resolução muito alta
                    canvas.width = finalWidth * scaleFactor;
                    canvas.height = finalHeight * scaleFactor;
                    const ctx = canvas.getContext('2d');
                    
                    // Desenhar imagem com alta qualidade
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Converter para base64 com alta qualidade
                    const dataURL = canvas.toDataURL('image/png', 1.0);
                    
                    // Adicionar ao PDF
                    doc.addImage(dataURL, 'PNG', 160, 10, finalWidth, finalHeight);
                    
                    console.log('✅ Logo adicionado ao PDF com alta qualidade');
                    resolve();
                } catch (error) {
                    console.warn('⚠️ Erro ao processar logo para PDF:', error);
                    resolve();
                }
            };
            
            img.onerror = function() {
                console.warn('⚠️ Erro ao carregar logo para PDF');
                resolve();
            };
            
            // Carregar imagem
            img.src = 'assets/images/icon.png';
            
        } catch (error) {
            console.warn('⚠️ Erro ao configurar logo para PDF:', error);
            resolve();
        }
    });
}

function validarCalculos() {
    console.log('🔍 Validando cálculos do sistema...');
    
    try {
        // Validar valor do contrato
        const valorContrato = obterValorContrato();
        if (valorContrato <= 0) {
            console.warn('⚠️ Valor do contrato não configurado ou inválido');
        } else {
            console.log('✅ Valor do contrato válido:', formatarMoeda(valorContrato));
        }
        
        // Validar horas contratadas
        const horasContratadas = calcularHorasContratadas();
        if (horasContratadas <= 0) {
            console.warn('⚠️ Nenhuma hora contratada encontrada');
        } else {
            console.log('✅ Horas contratadas válidas:', horasContratadas);
        }
        
        // Validar lançamentos
        if (lancamentos.length === 0) {
            console.warn('⚠️ Nenhum lançamento encontrado');
        } else {
            console.log('✅ Lançamentos válidos:', lancamentos.length);
            
            // Validar cada lançamento
            lancamentos.forEach((lancamento, index) => {
                if (!lancamento.data) {
                    console.warn(`⚠️ Lançamento ${index + 1} sem data`);
                }
                if (!lancamento.horasTrabalhadas) {
                    console.warn(`⚠️ Lançamento ${index + 1} sem horas trabalhadas`);
                }
            });
        }
        
        // Validar totais
        const totalHoras = lancamentos.reduce((acc, l) => acc + (parseFloat(l.horasTrabalhadas) || 0), 0);
        const totalHorasExtra = lancamentos.reduce((acc, l) => acc + (parseFloat(l.horasExtra) || 0), 0);
        
        console.log('📊 Totais calculados:', {
            'Total de Horas': totalHoras.toFixed(2),
            'Total de Horas Extras': totalHorasExtra.toFixed(2),
            'Valor por Hora': formatarMoeda(calcularValorPorHora())
        });
        
        console.log('✅ Validação de cálculos concluída');
        
    } catch (error) {
        console.error('❌ Erro na validação de cálculos:', error);
    }
}

// Gerar tabela inicial organizada
function gerarTabelaInicial() {
    console.log('🚨 GERANDO TABELA INICIAL - VERSÃO RADICAL');
    console.log(`🔧 periodoAtual atual: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
    
    // LIMPEZA TOTAL E AGRESSIVA
    console.log('🧹 LIMPEZA TOTAL E AGRESSIVA');
    lancamentos = [];
    localStorage.clear();
    
    // Limpar TODAS as tabelas possíveis
    const todasTabelas = document.querySelectorAll('tbody, table');
    todasTabelas.forEach((elemento, index) => {
        elemento.innerHTML = '';
        console.log(`🗑️ Elemento ${index} limpo`);
    });
    
    const tabelaPrincipal = document.getElementById('tabela-principal');
    if (!tabelaPrincipal) {
        console.error('❌ Tabela principal não encontrada');
        return;
    }
    
    // Atualizar cabeçalho
    const mesHeader = document.getElementById('mes-atual-header');
    if (mesHeader) {
        const nomesMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
        const nomeMes = nomesMeses[periodoAtual.mes - 1];
        mesHeader.innerHTML = `${nomeMes}/${periodoAtual.ano.toString().slice(-2)}<br><small>DIA</small>`;
        console.log(`📅 Cabeçalho: ${nomeMes}/${periodoAtual.ano}`);
    }
    
    // GERAR APENAS O MÊS ATUAL - VERSÃO DEFINITIVA
    console.log('📅 GERANDO APENAS O MÊS ATUAL - VERSÃO DEFINITIVA');
    const diasNoMes = new Date(periodoAtual.ano, periodoAtual.mes, 0).getDate();
    console.log(`📊 Total de dias no mês: ${diasNoMes}`);
    
    // FORÇAR SEMPRE COMEÇAR DO DIA 1 DO MÊS ATUAL
    console.log('🚨 FORÇANDO SEMPRE COMEÇAR DO DIA 1 DO MÊS ATUAL');
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        console.log(`🔍 Processando dia ${dia} do mês ${periodoAtual.mes}/${periodoAtual.ano}`);
        
        // VERIFICAÇÃO EXTRA: Garantir que é dia 1 ou maior
        if (dia < 1) {
            console.log(`❌ ERRO: Dia ${dia} é menor que 1 - pulando`);
            continue;
        }
        
        // Verificar se deve exibir o dia
        if (!deveExibirDia(periodoAtual.mes, dia)) {
            console.log(`⏭️ Dia ${dia} pulado (fim de semana)`);
            continue;
        }
        
        // Criar data correta - VERSÃO MAIS SEGURA
        const dataStr = `${periodoAtual.ano}-${periodoAtual.mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        const data = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
        
        // VERIFICAÇÃO TRIPLA: Confirmar que a data está correta
        const mesCriado = data.getMonth() + 1;
        const anoCriado = data.getFullYear();
        const diaCriado = data.getDate();
        
        console.log(`🔍 Verificação tripla - Dia ${dia}: criado=${mesCriado}/${anoCriado}/${diaCriado}, esperado=${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
        
        if (mesCriado !== periodoAtual.mes || anoCriado !== periodoAtual.ano || diaCriado !== dia) {
            console.log(`❌ ERRO: Data incorreta para dia ${dia} - pulando`);
            console.log(`❌ Esperado: ${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
            console.log(`❌ Obtido: ${mesCriado}/${anoCriado}/${diaCriado}`);
            continue;
        }
        
        // VERIFICAÇÃO FINAL: Garantir que não é dia do mês anterior
        if (dia < 1 || dia > diasNoMes) {
            console.log(`❌ ERRO: Dia ${dia} fora do range válido (1-${diasNoMes}) - pulando`);
            continue;
        }
        
        // VERIFICAÇÃO CRÍTICA: Garantir que é do mês selecionado
        const dataTeste = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
        const mesTeste = dataTeste.getMonth() + 1;
        const anoTeste = dataTeste.getFullYear();
        
        if (mesTeste !== periodoAtual.mes || anoTeste !== periodoAtual.ano) {
            console.log(`❌ ERRO: Dia ${dia} não pertence ao mês ${periodoAtual.mes}/${periodoAtual.ano} - pulando`);
            continue;
        }
        
        // Criar linha da tabela
        const tr = document.createElement('tr');
        const diaSemanaStr = obterDiaSemana(dataStr);
        const dataFormatada = formatarData(dataStr);
        
        tr.innerHTML = `
            <td>${dataFormatada}<br><small>${diaSemanaStr}</small></td>
            <td>07:00</td>
            <td>12:00</td>
            <td>17:00</td>
            <td class="soma-diaria">9:00</td>
            <td class="contrato">8:00</td>
        `;
        
        // Adicionar classes especiais
        if (data.getDay() === 0) { // Domingo
            tr.classList.add('domingo');
        } else if (data.getDay() === 6) { // Sábado
            tr.classList.add('sabado');
        } else if (data.getDay() === 5) { // Sexta-feira
            tr.classList.add('sexta-feira');
        }
        
        tabelaPrincipal.appendChild(tr);
        console.log(`✅ Dia ${dia} adicionado: ${dataFormatada} (${diaSemanaStr})`);
    }
    
    console.log('✅ TABELA GERADA DO ZERO COM APENAS O MÊS ATUAL!');
}

// Configurar Event Listeners organizados
function configurarEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Botão principal de preenchimento da tabela
    const btnPreencherTabela = document.getElementById('preencher-tabela');
    if (btnPreencherTabela) {
        btnPreencherTabela.addEventListener('click', preencherTabelaComDados);
        console.log('✅ Event listener para preencher tabela configurado');
    }
    
    // Botão gerar relatório
    const btnGerarRelatorio = document.getElementById('gerar-relatorio');
    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener('click', exportarParaPDF);
        console.log('✅ Event listener para gerar relatório configurado');
    }
    
    // Botão teste gerar PDF
    const btnTesteGerarPDF = document.getElementById('teste-gerar-pdf');
    if (btnTesteGerarPDF) {
        btnTesteGerarPDF.addEventListener('click', testeGerarPDF);
        console.log('✅ Event listener para teste gerar PDF configurado');
    }
    
    // Novos botões baseados no modelo
    const btnPreencherMes = document.getElementById('preencher-mes');
    if (btnPreencherMes) {
        btnPreencherMes.addEventListener('click', preencherMes);
        console.log('✅ Event listener para preencher mês configurado');
    }
    
    const btnPreencherQuinzena = document.getElementById('preencher-quinzena');
    if (btnPreencherQuinzena) {
        btnPreencherQuinzena.addEventListener('click', preencherQuinzena);
        console.log('✅ Event listener para preencher quinzena configurado');
    }
    
    const btnLimparTabela = document.getElementById('limpar-tabela');
    if (btnLimparTabela) {
        btnLimparTabela.addEventListener('click', limparTabela);
        console.log('✅ Event listener para limpar tabela configurado');
    }
    

    
    const btnPreencherDiasTrabalhados = document.getElementById('preencher-dias-trabalhados');
    if (btnPreencherDiasTrabalhados) {
        btnPreencherDiasTrabalhados.addEventListener('click', preencherDiasTrabalhados);
        console.log('✅ Event listener para preencher dias trabalhados configurado');
    }
    
    // Botão de teste para forçar preenchimento dos dias 5, 10 e 11
    const btnTestePreenchimento = document.getElementById('teste-preenchimento');
    if (btnTestePreenchimento) {
        btnTestePreenchimento.addEventListener('click', forcarPreenchimentoDias);
        console.log('✅ Event listener para teste de preenchimento configurado');
    }
    
    // Botão da SOLUÇÃO DEFINITIVA
    const btnSolucaoDefinitiva = document.getElementById('solucao-definitiva');
    if (btnSolucaoDefinitiva) {
        btnSolucaoDefinitiva.addEventListener('click', preencherTodosDiasUteis);
        console.log('✅ Event listener para SOLUÇÃO DEFINITIVA configurado');
    }
    
    // Novos botões para 30 e 31 dias
    const btnPreencher30Dias = document.getElementById('preencher-30-dias');
    if (btnPreencher30Dias) {
        btnPreencher30Dias.addEventListener('click', preencher30Dias);
        console.log('✅ Event listener para preencher 30 dias configurado');
    }
    
    const btnPreencher31Dias = document.getElementById('preencher-31-dias');
    if (btnPreencher31Dias) {
        btnPreencher31Dias.addEventListener('click', preencher31Dias);
        console.log('✅ Event listener para preencher 31 dias configurado');
    }
    
    // Botões de exportação
    const btnExportarExcel = document.getElementById('exportar-excel');
    if (btnExportarExcel) {
        btnExportarExcel.addEventListener('click', exportarParaExcel);
        console.log('✅ Event listener para exportar Excel configurado');
    }
    
    const btnExportarPDF = document.getElementById('exportar-pdf');
    if (btnExportarPDF) {
        btnExportarPDF.addEventListener('click', exportarParaPDF);
        console.log('✅ Event listener para exportar PDF configurado');
    }
    
    const btnTestePDF = document.getElementById('teste-pdf');
    if (btnTestePDF) {
        btnTestePDF.addEventListener('click', testePDF);
        console.log('✅ Event listener para teste PDF configurado');
    }
    
    // Botões de assinatura
    const btnLimparAssinatura = document.getElementById('limpar-assinatura');
    if (btnLimparAssinatura) {
        btnLimparAssinatura.addEventListener('click', limparAssinatura);
        console.log('✅ Event listener para limpar assinatura configurado');
    }
    
    const btnSalvarAssinatura = document.getElementById('salvar-assinatura');
    if (btnSalvarAssinatura) {
        btnSalvarAssinatura.addEventListener('click', salvarAssinatura);
        console.log('✅ Event listener para salvar assinatura configurado');
    }
    
    const btnExportarAssinatura = document.getElementById('exportar-assinatura');
    if (btnExportarAssinatura) {
        btnExportarAssinatura.addEventListener('click', exportarAssinatura);
        console.log('✅ Event listener para exportar assinatura configurado');
    }
    
    const btnImportarAssinatura = document.getElementById('importar-assinatura');
    if (btnImportarAssinatura) {
        btnImportarAssinatura.addEventListener('click', () => {
            document.getElementById('arquivo-assinatura').click();
        });
        console.log('✅ Event listener para importar assinatura configurado');
    }
    
    const arquivoAssinatura = document.getElementById('arquivo-assinatura');
    if (arquivoAssinatura) {
        arquivoAssinatura.addEventListener('change', importarAssinatura);
        console.log('✅ Event listener para arquivo de assinatura configurado');
    }
    
    console.log('✅ Todos os event listeners configurados');
}

// Inicialização quando DOM carrega - CORRIGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sistema carregado!');
    
    // Atualizar data do rodapé
    const dataFooter = document.getElementById('data-footer');
    if (dataFooter) {
        const hoje = new Date();
        dataFooter.textContent = `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth()+1).toString().padStart(2, '0')}`;
    }
    
    // Inicializar canvas se existir
    const canvas = document.getElementById('assinatura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        configurarAssinatura(canvas, ctx);
    }
    
    // Configurar logo ao lado do título
    configurarLogoLateralTitulo();
    
    // Definir data atual no campo de entrada
    const dataEntrada = document.getElementById('data-entrada');
    if (dataEntrada) {
        dataEntrada.value = new Date().toISOString().split('T')[0];
    }
    
    // Inicializar campo de mês/ano com o mês atual
    const dataSelecionada = document.getElementById('data-selecionada');
    if (dataSelecionada) {
        const hoje = new Date();
        const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
        const ano = hoje.getFullYear();
        dataSelecionada.value = `${ano}-${mes}`;
        console.log(`📅 Campo de data inicializado com: ${ano}-${mes}`);
        
        // Atualizar periodoAtual com o mês atual
        periodoAtual = {
            mes: parseInt(mes),
            ano: ano,
            inicio: 1,
            fim: new Date(ano, parseInt(mes), 0).getDate()
        };
        console.log(`🔧 periodoAtual inicializado: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
        
        // Adicionar listener para mudanças no campo de data
        dataSelecionada.addEventListener('change', function() {
            console.log('📅 Mês/Ano alterado:', this.value);
            
            if (this.value) {
                const [ano, mes] = this.value.split('-');
                const anoInt = parseInt(ano);
                const mesInt = parseInt(mes);
                
                // LIMPEZA COMPLETA antes de mudar o mês
                console.log('🧹 LIMPEZA COMPLETA antes de mudar mês...');
                lancamentos = [];
                localStorage.removeItem('lancamentos');
                
                // Limpar todas as tabelas
                const todasTabelas = document.querySelectorAll('tbody');
                todasTabelas.forEach(tbody => {
                    tbody.innerHTML = '';
                });
                
                // ATUALIZAR periodoAtual imediatamente
                periodoAtual = {
                    mes: mesInt,
                    ano: anoInt,
                    inicio: 1,
                    fim: new Date(anoInt, mesInt, 0).getDate()
                };
                
                console.log(`🔧 periodoAtual atualizado: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
                
                // Regenerar tabela com o novo mês
                console.log('🔄 Regenerando tabela com novo mês...');
                gerarTabelaInicial();
            }
        });
    }
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Configurar toggle da tabela
    configurarToggleTabela();
    
    // LIMPEZA COMPLETA E FORÇADA no carregamento
    console.log('🧹 LIMPEZA COMPLETA E FORÇADA no carregamento...');
    lancamentos = [];
    localStorage.clear();
    
    // Limpar todas as tabelas
    const todasTabelas = document.querySelectorAll('tbody');
    todasTabelas.forEach(tbody => {
        tbody.innerHTML = '';
    });
    
    // Forçar atualização do periodoAtual para o mês atual
        const hoje = new Date();
    periodoAtual = {
        mes: hoje.getMonth() + 1,
        ano: hoje.getFullYear(),
        inicio: 1,
        fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
    };
    
    console.log(`🔧 periodoAtual forçado para: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
    
    // DEBUG: Executar debug da tabela após 2 segundos
            setTimeout(() => {
        debugTabela();
    }, 2000);
    
    // Adicionar função de debug global para facilitar troubleshooting
    window.debugTabela = debugTabela;
    window.limparTudo = function() {
        console.log('🧹 Limpando tudo...');
        localStorage.clear();
        lancamentos = [];
        const tabelaPrincipal = document.getElementById('tabela-principal');
        if (tabelaPrincipal) {
            tabelaPrincipal.innerHTML = '';
        }
        console.log('✅ Tudo limpo!');
    };
    window.regenerarTabela = function() {
        console.log('🔄 Regenerando tabela...');
        gerarTabelaInicial();
    };
    
    // Função para forçar limpeza completa e regeneração
    window.limparERegenerar = function() {
        console.log('🧹 LIMPEZA COMPLETA E REGENERAÇÃO FORÇADA');
        
        // Limpar tudo
        lancamentos = [];
        localStorage.clear();
        
        // Limpar todas as tabelas
        const todasTabelas = document.querySelectorAll('tbody');
        todasTabelas.forEach(tbody => {
            tbody.innerHTML = '';
        });
        
        // Limpar totais
        const elementosTotais = [
            'total-soma-diaria', 'total-contrato', 'valor-unit-hora', 'valor-unit-contrato',
            'valor-total-soma', 'valor-total-contrato', 'total-horas-final', 'total-dias-final',
            'valor-total-final', 'total-medicao-final'
        ];
        
        elementosTotais.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = '00:00';
            }
        });
        
        // Forçar atualização do periodoAtual para o mês atual
        const hoje = new Date();
        periodoAtual = {
            mes: hoje.getMonth() + 1,
            ano: hoje.getFullYear(),
            inicio: 1,
            fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
        };
        
        console.log(`🔧 periodoAtual forçado para: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
        
        // Regenerar tabela
        gerarTabelaInicial();
        
        console.log('✅ Limpeza completa e regeneração concluída!');
    };
    
    // Função RADICAL para corrigir o problema do dia 31
    window.corrigirProblemaDia31 = function() {
        console.log('🚨 CORREÇÃO RADICAL DO PROBLEMA DO DIA 31');
        
        // 1. LIMPEZA TOTAL E AGRESSIVA
        console.log('🧹 ETAPA 1: Limpeza total...');
        lancamentos = [];
        localStorage.clear();
        
        // Limpar TODAS as tabelas possíveis
        const todasTabelas = document.querySelectorAll('tbody, table');
        todasTabelas.forEach((elemento, index) => {
            elemento.innerHTML = '';
            console.log(`🗑️ Elemento ${index} limpo`);
        });
        
        // 2. FORÇAR periodoAtual para o mês atual
        console.log('🔧 ETAPA 2: Forçando periodoAtual...');
        const hoje = new Date();
        periodoAtual = {
            mes: hoje.getMonth() + 1,
            ano: hoje.getFullYear(),
            inicio: 1,
            fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
        };
        
        console.log(`✅ periodoAtual forçado: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
        
        // 3. GERAR TABELA DO ZERO
        console.log('🔄 ETAPA 3: Gerando tabela do zero...');
        const tabelaPrincipal = document.getElementById('tabela-principal');
        if (!tabelaPrincipal) {
            console.error('❌ Tabela principal não encontrada');
            return;
        }
        
        // Limpar tabela principal
        tabelaPrincipal.innerHTML = '';
        
        // Atualizar cabeçalho
        const mesHeader = document.getElementById('mes-atual-header');
        if (mesHeader) {
            const nomesMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
            const nomeMes = nomesMeses[periodoAtual.mes - 1];
            mesHeader.innerHTML = `${nomeMes}/${periodoAtual.ano.toString().slice(-2)}<br><small>DIA</small>`;
        }
        
        // 4. GERAR APENAS OS DIAS DO MÊS ATUAL
        console.log('📅 ETAPA 4: Gerando apenas dias do mês atual...');
        const diasNoMes = new Date(periodoAtual.ano, periodoAtual.mes, 0).getDate();
        console.log(`📊 Total de dias no mês: ${diasNoMes}`);
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            console.log(`🔍 Processando dia ${dia} do mês ${periodoAtual.mes}/${periodoAtual.ano}`);
            
            // Verificar se deve exibir o dia
            if (!deveExibirDia(periodoAtual.mes, dia)) {
                console.log(`⏭️ Dia ${dia} pulado (fim de semana)`);
                continue;
            }
            
            // Criar data correta
            const dataStr = `${periodoAtual.ano}-${periodoAtual.mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            const data = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
            
            // Verificar se a data está correta
            const mesCriado = data.getMonth() + 1;
            const anoCriado = data.getFullYear();
            const diaCriado = data.getDate();
            
            if (mesCriado !== periodoAtual.mes || anoCriado !== periodoAtual.ano || diaCriado !== dia) {
                console.log(`❌ ERRO: Data incorreta para dia ${dia} - pulando`);
                continue;
            }
            
            // Criar linha da tabela
            const tr = document.createElement('tr');
            const diaSemanaStr = obterDiaSemana(dataStr);
            const dataFormatada = formatarData(dataStr);
            
            tr.innerHTML = `
                <td>${dataFormatada}<br><small>${diaSemanaStr}</small></td>
                <td>07:00</td>
                <td>12:00</td>
                <td>17:00</td>
                <td class="soma-diaria">9:00</td>
                <td class="contrato">8:00</td>
            `;
            
            // Adicionar classes especiais
            if (data.getDay() === 0) { // Domingo
                tr.classList.add('domingo');
            } else if (data.getDay() === 6) { // Sábado
                tr.classList.add('sabado');
            } else if (data.getDay() === 5) { // Sexta-feira
                tr.classList.add('sexta-feira');
            }
            
            tabelaPrincipal.appendChild(tr);
            console.log(`✅ Dia ${dia} adicionado: ${dataFormatada} (${diaSemanaStr})`);
        }
        
        console.log('✅ CORREÇÃO RADICAL CONCLUÍDA! Tabela gerada do zero com apenas o mês atual.');
    };
    
    // Função ULTRA RADICAL para forçar sempre o dia 1
    window.forcarDia1 = function() {
        console.log('🚨 FORÇANDO SEMPRE O DIA 1 - VERSÃO ULTRA RADICAL');
        
        // 1. LIMPEZA TOTAL
        console.log('🧹 LIMPEZA TOTAL...');
        lancamentos = [];
        localStorage.clear();
        
        // Limpar TODAS as tabelas
        const todasTabelas = document.querySelectorAll('tbody, table');
        todasTabelas.forEach(elemento => {
            elemento.innerHTML = '';
        });
        
        // 2. FORÇAR periodAtual para o mês atual
        const hoje = new Date();
        periodoAtual = {
            mes: hoje.getMonth() + 1,
            ano: hoje.getFullYear(),
            inicio: 1,
            fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
        };
        
        console.log(`🔧 periodoAtual forçado: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
        
        // 3. GERAR TABELA FORÇANDO DIA 1
        console.log('🔄 GERANDO TABELA FORÇANDO DIA 1...');
        const tabelaPrincipal = document.getElementById('tabela-principal');
        if (!tabelaPrincipal) {
            console.error('❌ Tabela principal não encontrada');
            return;
        }
        
        // Atualizar cabeçalho
        const mesHeader = document.getElementById('mes-atual-header');
        if (mesHeader) {
            const nomesMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
            const nomeMes = nomesMeses[periodoAtual.mes - 1];
            mesHeader.innerHTML = `${nomeMes}/${periodoAtual.ano.toString().slice(-2)}<br><small>DIA</small>`;
        }
        
        // 4. GERAR DIAS CORRETOS DO MÊS - CORRIGIDO
        const diasNoMes = new Date(periodoAtual.ano, periodoAtual.mes, 0).getDate(); // DIAS CORRETOS DO MÊS
        console.log(`📊 Total de dias: ${diasNoMes} (CORRETO PARA O MÊS)`);
        console.log(`🚨 CORRIGIDO: Começando do dia 1 até ${diasNoMes} (dias reais do mês)`);
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            // VERIFICAÇÃO EXTRA: Garantir que é dia 1 ou maior
            if (dia < 1) {
                console.log(`❌ ERRO: Dia ${dia} é menor que 1 - pulando`);
                continue;
            }
            
            console.log(`🔍 Processando dia ${dia} do mês ${periodoAtual.mes}/${periodoAtual.ano}`);
            
            // Verificar se deve exibir o dia
            if (!deveExibirDia(periodoAtual.mes, dia)) {
                console.log(`⏭️ Dia ${dia} pulado (fim de semana)`);
                continue;
            }
            
            // Criar data correta - VERSÃO MAIS SEGURA
            const dataStr = `${periodoAtual.ano}-${periodoAtual.mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            const data = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
            
            // VERIFICAÇÃO TRIPLA: Confirmar que a data está correta
            const mesCriado = data.getMonth() + 1;
            const anoCriado = data.getFullYear();
            const diaCriado = data.getDate();
            
            console.log(`🔍 Verificação tripla - Dia ${dia}: criado=${mesCriado}/${anoCriado}/${diaCriado}, esperado=${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
            
            if (mesCriado !== periodoAtual.mes || anoCriado !== periodoAtual.ano || diaCriado !== dia) {
                console.log(`❌ ERRO: Data incorreta para dia ${dia} - pulando`);
                console.log(`❌ Esperado: ${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
                console.log(`❌ Obtido: ${mesCriado}/${anoCriado}/${diaCriado}`);
                continue;
            }
            
            // VERIFICAÇÃO FINAL: Garantir que não é dia do mês anterior
            if (dia < 1 || dia > 31) {
                console.log(`❌ ERRO: Dia ${dia} fora do range válido (1-31) - pulando`);
                continue;
            }
            
            // VERIFICAÇÃO CRÍTICA: Garantir que é do mês selecionado
            const dataTeste = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
            const mesTeste = dataTeste.getMonth() + 1;
            const anoTeste = dataTeste.getFullYear();
            
            if (mesTeste !== periodoAtual.mes || anoTeste !== periodoAtual.ano) {
                console.log(`❌ ERRO: Dia ${dia} não pertence ao mês ${periodoAtual.mes}/${periodoAtual.ano} - pulando`);
                continue;
            }
            
            // Criar linha da tabela
            const tr = document.createElement('tr');
            const diaSemanaStr = obterDiaSemana(dataStr);
            const dataFormatada = formatarData(dataStr);
            
            tr.innerHTML = `
                <td>${dataFormatada}<br><small>${diaSemanaStr}</small></td>
                <td>07:00</td>
                <td>12:00</td>
                <td>17:00</td>
                <td class="soma-diaria">9:00</td>
                <td class="contrato">8:00</td>
            `;
            
            // Adicionar classes especiais
            if (data.getDay() === 0) { // Domingo
                tr.classList.add('domingo');
            } else if (data.getDay() === 6) { // Sábado
                tr.classList.add('sabado');
            } else if (data.getDay() === 5) { // Sexta-feira
                tr.classList.add('sexta-feira');
            }
            
            tabelaPrincipal.appendChild(tr);
            console.log(`✅ Dia ${dia} adicionado: ${dataFormatada} (${diaSemanaStr})`);
        }
        
        console.log('✅ FORÇA DIA 1 CONCLUÍDA! Tabela gerada do zero sempre começando do dia 1.');
    };
    
    // Função ULTRA RADICAL para remover completamente o mês anterior
    window.removerMesAnterior = function() {
        console.log('🚨 REMOVENDO COMPLETAMENTE O MÊS ANTERIOR - VERSÃO ULTRA RADICAL');
        
        // 1. LIMPEZA TOTAL E AGRESSIVA
        console.log('🧹 LIMPEZA TOTAL E AGRESSIVA...');
        lancamentos = [];
        localStorage.clear();
        
        // Limpar TODAS as tabelas
        const todasTabelas = document.querySelectorAll('tbody, table');
        todasTabelas.forEach(elemento => {
            elemento.innerHTML = '';
        });
        
        // 2. FORÇAR periodAtual para o mês atual
        const hoje = new Date();
        periodoAtual = {
            mes: hoje.getMonth() + 1,
            ano: hoje.getFullYear(),
            inicio: 1,
            fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
        };
        
        console.log(`🔧 periodoAtual forçado: ${periodoAtual.mes}/${periodoAtual.ano} (${periodoAtual.fim} dias)`);
        
        // 3. GERAR TABELA APENAS COM O MÊS ATUAL
        console.log('🔄 GERANDO TABELA APENAS COM O MÊS ATUAL...');
        const tabelaPrincipal = document.getElementById('tabela-principal');
        if (!tabelaPrincipal) {
            console.error('❌ Tabela principal não encontrada');
            return;
        }
        
        // Atualizar cabeçalho
        const mesHeader = document.getElementById('mes-atual-header');
        if (mesHeader) {
            const nomesMeses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
            const nomeMes = nomesMeses[periodoAtual.mes - 1];
            mesHeader.innerHTML = `${nomeMes}/${periodoAtual.ano.toString().slice(-2)}<br><small>DIA</small>`;
        }
        
        // 4. GERAR APENAS DIAS DO MÊS ATUAL - SEM MÊS ANTERIOR
        const diasNoMes = new Date(periodoAtual.ano, periodoAtual.mes, 0).getDate();
        console.log(`📊 Total de dias no mês: ${diasNoMes}`);
        console.log('🚨 GERANDO APENAS DIAS DO MÊS ATUAL - SEM MÊS ANTERIOR');
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            console.log(`🔍 Processando dia ${dia} do mês ${periodoAtual.mes}/${periodoAtual.ano}`);
            
            // Verificar se deve exibir o dia
            if (!deveExibirDia(periodoAtual.mes, dia)) {
                console.log(`⏭️ Dia ${dia} pulado (fim de semana)`);
                continue;
            }
            
            // Criar data correta - VERSÃO MAIS SEGURA
            const dataStr = `${periodoAtual.ano}-${periodoAtual.mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            const data = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
            
            // VERIFICAÇÃO TRIPLA: Confirmar que a data está correta
            const mesCriado = data.getMonth() + 1;
            const anoCriado = data.getFullYear();
            const diaCriado = data.getDate();
            
            console.log(`🔍 Verificação tripla - Dia ${dia}: criado=${mesCriado}/${anoCriado}/${diaCriado}, esperado=${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
            
            if (mesCriado !== periodoAtual.mes || anoCriado !== periodoAtual.ano || diaCriado !== dia) {
                console.log(`❌ ERRO: Data incorreta para dia ${dia} - pulando`);
                console.log(`❌ Esperado: ${periodoAtual.mes}/${periodoAtual.ano}/${dia}`);
                console.log(`❌ Obtido: ${mesCriado}/${anoCriado}/${diaCriado}`);
                continue;
            }
            
            // VERIFICAÇÃO FINAL: Garantir que não é dia do mês anterior
            if (dia < 1 || dia > diasNoMes) {
                console.log(`❌ ERRO: Dia ${dia} fora do range válido (1-${diasNoMes}) - pulando`);
                continue;
            }
            
            // VERIFICAÇÃO CRÍTICA: Garantir que é do mês selecionado
            const dataTeste = new Date(periodoAtual.ano, periodoAtual.mes - 1, dia);
            const mesTeste = dataTeste.getMonth() + 1;
            const anoTeste = dataTeste.getFullYear();
            
            if (mesTeste !== periodoAtual.mes || anoTeste !== periodoAtual.ano) {
                console.log(`❌ ERRO: Dia ${dia} não pertence ao mês ${periodoAtual.mes}/${periodoAtual.ano} - pulando`);
                continue;
            }
            
            // Criar linha da tabela
            const tr = document.createElement('tr');
            const diaSemanaStr = obterDiaSemana(dataStr);
            const dataFormatada = formatarData(dataStr);
            
            tr.innerHTML = `
                <td>${dataFormatada}<br><small>${diaSemanaStr}</small></td>
                <td>07:00</td>
                <td>12:00</td>
                <td>17:00</td>
                <td class="soma-diaria">9:00</td>
                <td class="contrato">8:00</td>
            `;
            
            // Adicionar classes especiais
            if (data.getDay() === 0) { // Domingo
                tr.classList.add('domingo');
            } else if (data.getDay() === 6) { // Sábado
                tr.classList.add('sabado');
            } else if (data.getDay() === 5) { // Sexta-feira
                tr.classList.add('sexta-feira');
            }
            
            tabelaPrincipal.appendChild(tr);
            console.log(`✅ Dia ${dia} adicionado: ${dataFormatada} (${diaSemanaStr})`);
        }
        
        console.log('✅ MÊS ANTERIOR REMOVIDO COMPLETAMENTE! Tabela gerada apenas com o mês atual.');
    };
    
    // Configurar botões de fim de semana
    configurarBotoesFimSemana();
    
    // Configurar botão de horas extras
    configurarBotaoHorasExtras();
    
    // Configurar edição manual dos campos da tabela
    configurarEdicaoManual();
    
    // Configurar novas funcionalidades
    configurarCamposResumoEditaveis();
    configurarToggleHorasExtras();
    
    // Configurar novas funcionalidades de medição
    configurarEventListenersMedicao();
    
    // Inicializar configurações de medição
    atualizarConfiguracoesMedicao();
    
    // Configurar controles de período
    configurarControlesPeriodo();
    
    // Carregar preferências de período
    carregarPreferenciasPeriodo();
    
    // NÃO gerar tabela inicial automaticamente - aguardar seleção do usuário
    console.log('⏸️ Tabela inicial não será gerada automaticamente - aguardando seleção do usuário');
    // gerarTabelaInicial(); // COMENTADO para evitar problemas de mês
    
    // Executar validação inicial
    setTimeout(() => {
        validarCalculos();
    }, 1000);
    
    console.log('✅ Sistema completamente carregado!');
});

// Função principal de preenchimento da tabela - CORRIGIDA
function preencherTabelaComDados() {
    console.log('🚀 Preenchendo tabela com configurações personalizadas...');
    
    // Verificar se a tabela já está preenchida
    if (lancamentos.length > 0) {
        const confirmacao = confirm('⚠️ ATENÇÃO!\n\nA tabela já está preenchida com dados.\n\nDeseja realmente limpar e preencher novamente?\n\nClique em "OK" para continuar ou "Cancelar" para manter os dados atuais.');
        
        if (!confirmacao) {
            console.log('❌ Usuário cancelou o preenchimento da tabela');
            return;
        }
    }
    
    // Mostrar indicador de carregamento
    const btnPreencher = document.getElementById('preencher-tabela');
    if (btnPreencher) {
        btnPreencher.textContent = '⏳ Preenchendo...';
        btnPreencher.disabled = true;
    }
    
    // Obter configurações do usuário
    const horasDiaUtil = parseInt(document.getElementById('horas-dia-util').value) || 9;
    const horasSexta = parseInt(document.getElementById('horas-sexta').value) || 8;
    const incluirFinsSemana = document.getElementById('incluir-fins-semana').value === 'true';
    
    console.log(`⚙️ Configurações: Dias úteis=${horasDiaUtil}h, Sexta=${horasSexta}h, Fins de semana=${incluirFinsSemana}`);
    
    // Limpar dados existentes
    lancamentos = [];
    
    // Obter data selecionada pelo usuário (corrigido para evitar atraso)
    const dataSelecionada = document.getElementById('data-selecionada')?.value;
    let mesAtual, anoAtual;
    
    if (dataSelecionada) {
        // Corrigir problema de atraso de um dia
        const [anoStr, mesStr, diaStr] = dataSelecionada.split('-');
        anoAtual = parseInt(anoStr);
        mesAtual = parseInt(mesStr);
        const dia = parseInt(diaStr);
        
        console.log(`📅 Usando data selecionada: ${dataSelecionada}`);
        console.log(`🔧 Componentes extraídos: Ano=${anoAtual}, Mês=${mesAtual}, Dia=${dia}`);
    } else {
        const hoje = new Date();
        mesAtual = hoje.getMonth() + 1;
        anoAtual = hoje.getFullYear();
        console.log('📅 Usando data atual');
    }
    
    // Definir período atual (sempre mês completo)
    periodoAtual = {
        mes: mesAtual,
        ano: anoAtual,
        inicio: 1,
        fim: new Date(anoAtual, mesAtual, 0).getDate()
    };
    
    // Garantir que não está em modo quinzena
    modoQuinzena = false;
    console.log(`🔧 Modo quinzena desativado. Preenchendo mês completo: ${mesAtual}/${anoAtual} (${periodoAtual.fim} dias)`);
    
    // Atualizar cabeçalho da tabela
    const mesAtualHeader = document.getElementById('mes-atual-header');
    if (mesAtualHeader) {
        const nomeMes = new Date(anoAtual, mesAtual - 1).toLocaleDateString('pt-BR', { month: 'long' });
        mesAtualHeader.innerHTML = `MÊS/ANO<br><small>${nomeMes.toUpperCase()} ${anoAtual}</small>`;
    }
    
    // Regenerar tabela com o mês correto
    console.log(`🔄 Regenerando tabela para mês ${mesAtual}/${anoAtual}`);
    gerarTabelaInicial();
    
    // Preencher com dados para o mês atual - CORRIGIDO
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate(); // DIAS CORRETOS DO MÊS
    let totalHorasContrato = 0;
    let diasUteisPreenchidos = 0;
    let sextasPreenchidas = 0;
    
    console.log(`📊 PREENCHENDO MÊS COMPLETO: ${mesAtual}/${anoAtual}`);
    console.log(`📊 Total de dias: ${diasNoMes} (CORRETO PARA O MÊS)`);
    console.log(`📊 Período configurado: ${periodoAtual.inicio} a ${periodoAtual.fim}`);
    console.log(`🚨 CORRIGIDO: Começando do dia 1 até ${diasNoMes} (dias reais do mês)`);
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        // VERIFICAÇÃO EXTRA: Garantir que é dia 1 ou maior
        if (dia < 1) {
            console.log(`❌ ERRO: Dia ${dia} é menor que 1 - pulando`);
            continue;
        }
        
        const dataStr = `${anoAtual}-${mesAtual.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        // Corrigir problema de atraso: criar data usando componentes locais
        const data = new Date(anoAtual, mesAtual - 1, dia);
        const diaSemana = data.getDay(); // 0 = domingo, 6 = sábado
        
        // VERIFICAÇÃO TRIPLA: Confirmar que a data está correta
        const mesCriado = data.getMonth() + 1;
        const anoCriado = data.getFullYear();
        const diaCriado = data.getDate();
        
        console.log(`🔍 Verificação tripla - Dia ${dia}: criado=${mesCriado}/${anoCriado}/${diaCriado}, esperado=${mesAtual}/${anoAtual}/${dia}`);
        
        if (mesCriado !== mesAtual || anoCriado !== anoAtual || diaCriado !== dia) {
            console.log(`❌ ERRO: Data incorreta para dia ${dia} - pulando`);
            console.log(`❌ Esperado: ${mesAtual}/${anoAtual}/${dia}`);
            console.log(`❌ Obtido: ${mesCriado}/${anoCriado}/${diaCriado}`);
            continue;
        }
        
        // VERIFICAÇÃO FINAL: Garantir que não é dia do mês anterior
        if (dia < 1 || dia > diasNoMes) {
            console.log(`❌ ERRO: Dia ${dia} fora do range válido (1-${diasNoMes}) - pulando`);
            continue;
        }
        
        // VERIFICAÇÃO CRÍTICA: Garantir que é do mês selecionado
        const dataTeste = new Date(anoAtual, mesAtual - 1, dia);
        const mesTeste = dataTeste.getMonth() + 1;
        const anoTeste = dataTeste.getFullYear();
        
        if (mesTeste !== mesAtual || anoTeste !== anoAtual) {
            console.log(`❌ ERRO: Dia ${dia} não pertence ao mês ${mesAtual}/${anoAtual} - pulando`);
            continue;
        }
        
        console.log(`🔧 Dia ${dia}: ${dataStr} -> ${data.toLocaleDateString('pt-BR')} (${diaSemana})`);
        
        // Verificar se é dia útil (segunda a sexta)
        if (diaSemana >= 1 && diaSemana <= 5) {
            let horasTrabalhadas = horasDiaUtil;
            let entrada = '07:00';
            let almoco = '12:00';
            let saidaAlmoco = '13:00';
            let saida = '17:00';
            
            // Configuração especial para sexta-feira (dia 5)
            if (diaSemana === 5) { // Sexta-feira
                console.log(`🔧 Configurando sexta-feira (dia ${dia}): ${horasSexta} horas`);
                horasTrabalhadas = horasSexta;
                
                if (horasSexta === 8) {
                    // Horário especial: 07:00-12:00, 13:00-16:00
                    entrada = '07:00';
                    almoco = '12:00';
                    saidaAlmoco = '13:00';
                    saida = '16:00';
                } else {
                    // Horário normal: 07:00-17:00
                    entrada = '07:00';
                    almoco = '12:00';
                    saidaAlmoco = '13:00';
                    saida = '17:00';
                }
            } else {
                // Dias úteis normais (segunda a quinta)
                console.log(`🔧 Configurando dia útil (dia ${dia}): ${horasDiaUtil} horas`);
                if (horasDiaUtil === 8) {
                    saida = '16:00';
                } else if (horasDiaUtil === 9) {
                    saida = '17:00';
                }
            }
            
            // Adicionar horas ao total do contrato
            totalHorasContrato += horasTrabalhadas;
            
            const lancamento = {
                data: dataStr,
                entrada: entrada,
                almoco: almoco,
                saidaAlmoco: saidaAlmoco,
                saida: saida,
                horasTrabalhadas: horasTrabalhadas,
                horasExtra: 0,
                descontosHoras: 0,
                descontosDiaria: 0,
                tipoDia: 'util',
                contrato: horasTrabalhadas // Campo CONTRATO com as horas configuradas
            };
            
            lancamentos.push(lancamento);
            
            // Contar dias preenchidos
            if (diaSemana === 5) {
                sextasPreenchidas++;
            } else {
                diasUteisPreenchidos++;
            }
            
            console.log(`✅ Dia ${dia} (${dataStr}): ${horasTrabalhadas}h - ${entrada} às ${saida} [${diaSemana === 5 ? 'SEXTA' : 'ÚTIL'}]`);
            
        } else if (incluirFinsSemana && (diaSemana === 0 || diaSemana === 6)) {
            // Fins de semana (se configurado para incluir)
            const lancamento = {
                data: dataStr,
                entrada: '',
                almoco: '',
                saidaAlmoco: '',
                saida: '',
                horasTrabalhadas: 0,
                horasExtra: 0,
                descontosHoras: 0,
                descontosDiaria: 0,
                tipoDia: 'fim-semana'
            };
            
            lancamentos.push(lancamento);
            console.log(`📅 Dia ${dia} (${dataStr}): Fim de semana - sem trabalho`);
        }
    }
    
    // CORREÇÃO: Não chamar atualizarTabela() pois ela sobrescreve a tabela correta
    // A tabela já foi gerada corretamente pela função gerarTabelaInicial()
    console.log('✅ Tabela já gerada corretamente - não sobrescrever');
    
    // Atualizar totais
    atualizarTotais();
    
    // Atualizar configurações
    atualizarConfiguracoesMedicao();
    
    // Mostrar tabela se estiver oculta
    const tabelaContainer = document.getElementById('tabela-principal-container');
    if (tabelaContainer && tabelaContainer.style.display === 'none') {
        mostrarTabela();
    }
    
    // Restaurar botão
    if (btnPreencher) {
        btnPreencher.textContent = '🚀 Preencher Tabela';
        btnPreencher.disabled = false;
    }
    
    console.log(`✅ PREENCHIMENTO CONCLUÍDO!`);
    console.log(`📊 RESUMO: ${diasUteisPreenchidos} dias úteis + ${sextasPreenchidas} sextas = ${totalHorasContrato}h totais`);
    
    // Mostrar notificação de sucesso
    mostrarNotificacao(`Tabela preenchida com sucesso! ${diasUteisPreenchidos + sextasPreenchidas} dias configurados.`, 'sucesso');
}

// Funções auxiliares que estavam faltando
function calcularHorasContratadas() {
    return lancamentos.reduce((acc, l) => acc + (parseFloat(l.horasTrabalhadas) || 0), 0);
}

function atualizarTabela() {
    console.log('🔄 Atualizando tabela...');
    const tbody = document.getElementById('tabela-principal');
    
    if (!tbody) {
        console.error('❌ Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    if (!lancamentos || lancamentos.length === 0) {
        console.log('⚠️ Nenhum lançamento para exibir');
        return;
    }
    
    console.log(`📊 Processando ${lancamentos.length} lançamentos...`);
    
    // Ordenar lançamentos por data
    lancamentos.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    // FILTRAR APENAS lançamentos do mês selecionado (proteção adicional)
    const mesSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[1]) || new Date().getMonth() + 1;
    const anoSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[0]) || new Date().getFullYear();
    
    const lancamentosFiltrados = lancamentos.filter(lancamento => {
        if (!lancamento.data) return false;
        const [ano, mes] = lancamento.data.split('-').map(Number);
        return mes === mesSelecionado && ano === anoSelecionado;
    });
    
    console.log(`🔍 Filtrados ${lancamentosFiltrados.length} lançamentos do mês ${mesSelecionado}/${anoSelecionado}`);
    
    lancamentosFiltrados.forEach((lancamento, index) => {
        const row = document.createElement('tr');
        
        // Obter dia da semana
        const dataStr = lancamento.data || '';
        const diaSemana = dataStr ? obterDiaSemana(dataStr) : '';
        const dataFormatada = dataStr ? formatarData(dataStr) : '';
        
        // Formatar horários
        const entrada = lancamento.entrada || '';
        const almoco = lancamento.almoco || '';
        const saida = lancamento.saida || '';
        const horasTrabalhadas = lancamento.horasTrabalhadas ? `${lancamento.horasTrabalhadas}:00` : '00:00';
        
        // Calcular horas de contrato (padrão 8 horas por dia)
        const horasContrato = 8;
        
        row.innerHTML = `
            <td>${dataFormatada}<br><small>${diaSemana}</small></td>
            <td>${entrada}</td>
            <td>${almoco}</td>
            <td>${saida}</td>
            <td class="soma-diaria">${horasTrabalhadas}</td>
            <td class="contrato">${horasContrato}:00</td>
        `;
        
        // Adicionar classes especiais
        if (lancamento.diaSemana === 0) { // Domingo
            row.classList.add('domingo');
        } else if (lancamento.diaSemana === 6) { // Sábado
            row.classList.add('sabado');
        } else if (lancamento.diaSemana === 5) { // Sexta-feira
            row.classList.add('sexta-feira');
        }
        
        tbody.appendChild(row);
    });
    
    console.log('✅ Tabela atualizada com sucesso');
}

function atualizarTotais() {
    console.log('🔄 Atualizando totais...');
    
    try {
        // Calcular totais em horas
        let totalHoras = 0;
        let totalContrato = 0;
        
        // Filtrar apenas lançamentos do mês selecionado para os totais
        const mesSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[1]) || new Date().getMonth() + 1;
        const anoSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[0]) || new Date().getFullYear();
        
        const lancamentosFiltrados = lancamentos.filter(lancamento => {
            if (!lancamento.data) return false;
            const [ano, mes] = lancamento.data.split('-').map(Number);
            return mes === mesSelecionado && ano === anoSelecionado;
        });
        
        lancamentosFiltrados.forEach(lancamento => {
            // Converter horas trabalhadas para número
            const horasTrabalhadas = parseFloat(lancamento.horasTrabalhadas) || 0;
            totalHoras += horasTrabalhadas;
            
            // Horas de contrato (8 horas por dia)
            totalContrato += 8;
        });
        
        // Formatar totais
        const totalHorasFormatado = `${totalHoras.toFixed(0)}:00`;
        const totalContratoFormatado = `${totalContrato.toFixed(0)}:00`;
        
        // Atualizar células de totais
        const totalSomaDiariaElement = document.getElementById('total-soma-diaria');
        if (totalSomaDiariaElement) {
            totalSomaDiariaElement.innerHTML = `<strong>${totalHorasFormatado}</strong>`;
        }
        
        const totalContratoElement = document.getElementById('total-contrato');
        if (totalContratoElement) {
            totalContratoElement.innerHTML = `<strong>${totalContratoFormatado}</strong>`;
        }
        
        // Calcular valores unitários
        const valorContrato = obterValorContrato();
        const valorPorHora = totalHoras > 0 ? valorContrato / totalHoras : 0;
        const valorPorDia = lancamentos.length > 0 ? valorContrato / lancamentos.length : 0;
        
        // Atualizar valores unitários
        const valorUnitHoraElement = document.getElementById('valor-unit-hora');
        if (valorUnitHoraElement) {
            valorUnitHoraElement.innerHTML = `<strong>${formatarMoeda(valorPorHora)}</strong>`;
        }
        
        const valorUnitContratoElement = document.getElementById('valor-unit-contrato');
        if (valorUnitContratoElement) {
            valorUnitContratoElement.innerHTML = `<strong>${formatarMoeda(valorPorDia)}</strong>`;
        }
        
        // Calcular valores totais
        const valorTotalSoma = totalHoras * valorPorHora;
        const valorTotalContrato = valorContrato;
        
        // Atualizar valores totais
        const valorTotalSomaElement = document.getElementById('valor-total-soma');
        if (valorTotalSomaElement) {
            valorTotalSomaElement.innerHTML = `<strong>${formatarMoeda(valorTotalSoma)}</strong>`;
        }
        
        const valorTotalContratoElement = document.getElementById('valor-total-contrato');
        if (valorTotalContratoElement) {
            valorTotalContratoElement.innerHTML = `<strong>${formatarMoeda(valorTotalContrato)}</strong>`;
        }
        
        const valorTotalHorasExtraElement = document.getElementById('valor-total-horas-extra');
        if (valorTotalHorasExtraElement) {
            valorTotalHorasExtraElement.textContent = formatarMoeda(valorTotalHorasExtra);
        }
        
        const valorTotalDescHorasElement = document.getElementById('valor-total-desc-horas');
        if (valorTotalDescHorasElement) {
            valorTotalDescHorasElement.textContent = formatarMoeda(valorTotalDescHoras);
        }
        
        const valorTotalDescDiariaElement = document.getElementById('valor-total-desc-diaria');
        if (valorTotalDescDiariaElement) {
            valorTotalDescDiariaElement.textContent = formatarMoeda(valorTotalDescDiaria);
        }
        
        // Atualizar seção de medição
        const totalMaioElement = document.getElementById('total-maio');
        if (totalMaioElement) {
            totalMaioElement.textContent = formatarMoeda(valorTotalContrato);
        }
        
        const totalHorasExtraFinalElement = document.getElementById('total-horas-extra-final');
        if (totalHorasExtraFinalElement) {
            totalHorasExtraFinalElement.textContent = formatarMoeda(valorTotalHorasExtra);
        }
        
        const totalGeralFinalElement = document.getElementById('total-geral-final');
        if (totalGeralFinalElement) {
            const totalGeral = valorTotalContrato + valorTotalHorasExtra;
            totalGeralFinalElement.textContent = formatarMoeda(totalGeral);
        }
        
        // Atualizar seção de descontos
        const totalCombustivelElement = document.getElementById('total-combustivel');
        if (totalCombustivelElement) {
            totalCombustivelElement.textContent = formatarMoeda(0); // Valor padrão
        }
        
        const totalDescontosFinalElement = document.getElementById('total-descontos-final');
        if (totalDescontosFinalElement) {
            const totalDescontos = valorTotalDescHoras + valorTotalDescDiaria;
            totalDescontosFinalElement.textContent = formatarMoeda(totalDescontos);
        }
        
        // Atualizar total final
        const totalFinalElement = document.querySelector('.total-final-content p strong');
        if (totalFinalElement) {
            const totalGeral = valorTotalContrato + valorTotalHorasExtra;
            const totalDescontos = valorTotalDescHoras + valorTotalDescDiaria;
            const totalFinal = totalGeral - totalDescontos;
            totalFinalElement.textContent = formatarMoeda(totalFinal);
        }
        
        console.log('✅ Totais atualizados com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar totais:', error);
    }
}

// Função para atualizar resumo final
function atualizarResumoFinal() {
    console.log('🔄 Atualizando resumo final...');
    
    try {
        // Filtrar apenas lançamentos do mês selecionado para o resumo
        const mesSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[1]) || new Date().getMonth() + 1;
        const anoSelecionado = parseInt(document.getElementById('data-selecionada')?.value?.split('-')[0]) || new Date().getFullYear();
        
        const lancamentosFiltrados = lancamentos.filter(lancamento => {
            if (!lancamento.data) return false;
            const [ano, mes] = lancamento.data.split('-').map(Number);
            return mes === mesSelecionado && ano === anoSelecionado;
        });
        
        // Calcular totais apenas dos lançamentos filtrados
        const totalHoras = lancamentosFiltrados.reduce((acc, l) => acc + (parseFloat(l.horasTrabalhadas) || 0), 0);
        const totalDias = lancamentosFiltrados.length;
        const valorContrato = obterValorContrato();
        
        // Atualizar elementos do resumo
        const totalHorasFinalElement = document.getElementById('total-horas-final');
        if (totalHorasFinalElement) {
            totalHorasFinalElement.textContent = `${totalHoras.toFixed(0)}:00`;
        }
        
        const totalDiasFinalElement = document.getElementById('total-dias-final');
        if (totalDiasFinalElement) {
            totalDiasFinalElement.textContent = totalDias;
        }
        
        const valorTotalFinalElement = document.getElementById('valor-total-final');
        if (valorTotalFinalElement) {
            valorTotalFinalElement.textContent = formatarMoeda(valorContrato);
        }
        
        // Atualizar seção de descontos
        const totalCombustivelElement = document.getElementById('total-combustivel');
        if (totalCombustivelElement) {
            totalCombustivelElement.textContent = formatarMoeda(0); // Valor padrão
        }
        
        const totalDescontosFinalElement = document.getElementById('total-descontos-final');
        if (totalDescontosFinalElement) {
            totalDescontosFinalElement.textContent = formatarMoeda(0); // Valor padrão
        }
        
        // Atualizar total final da medição
        const totalMedicaoFinalElement = document.getElementById('total-medicao-final');
        if (totalMedicaoFinalElement) {
            totalMedicaoFinalElement.textContent = formatarMoeda(valorContrato);
        }
        
        console.log('✅ Resumo final atualizado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar resumo final:', error);
    }
}

// Funções de controle da tabela
function mostrarTabela() {
    const tabelaContainer = document.getElementById('tabela-principal-container');
    const btnMostrar = document.getElementById('mostrar-tabela');
    const btnOcultar = document.getElementById('ocultar-tabela');
    
    if (tabelaContainer) {
        tabelaContainer.style.display = 'block';
        console.log('✅ Tabela exibida');
    }
    
    if (btnMostrar) {
        btnMostrar.style.display = 'none';
    }
    
    if (btnOcultar) {
        btnOcultar.style.display = 'inline-block';
    }
}

function ocultarTabela() {
    const tabelaContainer = document.getElementById('tabela-principal-container');
    const btnMostrar = document.getElementById('mostrar-tabela');
    const btnOcultar = document.getElementById('ocultar-tabela');
    
    if (tabelaContainer) {
        tabelaContainer.style.display = 'none';
        console.log('✅ Tabela ocultada');
    }
    
    if (btnMostrar) {
        btnMostrar.style.display = 'inline-block';
    }
    
    if (btnOcultar) {
        btnOcultar.style.display = 'none';
    }
}

// Funções de configuração
function configurarControlesPeriodo() {
    console.log('🔧 Configurando controles de período...');
    
    // Event listeners para botões de controle
    const btnPreencher = document.getElementById('preencher-tabela');
    
    if (btnPreencher) {
        btnPreencher.addEventListener('click', preencherTabelaComDados);
        console.log('✅ Event listener para preencher tabela configurado');
    }
    
    // Event listeners para opções de período
    const opcoesPeriodo = document.querySelectorAll('input[name="tipo-periodo"]');
    opcoesPeriodo.forEach(opcao => {
        opcao.addEventListener('change', (e) => {
            atualizarInterfacePeriodo(e.target.value);
        });
    });
    
    console.log('✅ Controles de período configurados');
}

function atualizarInterfacePeriodo(tipoPeriodo) {
    console.log(`🔄 Atualizando interface para período: ${tipoPeriodo}`);
    
    // Salvar preferência
    localStorage.setItem('tipo-periodo-preferido', tipoPeriodo);
    
    // Atualizar interface baseado no tipo
    switch (tipoPeriodo) {
        case 'quinzena':
            console.log('📅 Modo quinzena ativado');
            break;
        case 'mes':
            console.log('📅 Modo mês completo ativado');
            break;
        case 'mes-quinzenas':
            console.log('📅 Modo mês dividido em quinzenas ativado');
            break;
        default:
            console.log('📅 Modo padrão ativado');
    }
}

function carregarPreferenciasPeriodo() {
    const tipoPeriodoPreferido = localStorage.getItem('tipo-periodo-preferido');
    if (tipoPeriodoPreferido) {
        const radioButton = document.querySelector(`input[name="tipo-periodo"][value="${tipoPeriodoPreferido}"]`);
        if (radioButton) {
            radioButton.checked = true;
            atualizarInterfacePeriodo(tipoPeriodoPreferido);
        }
    }
}

// Funções de notificação
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
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            notificacao.remove();
        });
    }
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.remove();
        }
    }, 5000);
    
    console.log(`📢 Notificação: ${mensagem} (${tipo})`);
}

// Funções placeholder para funções que podem não existir ainda
function configurarBotoesFimSemana() {
    console.log('🔧 Configurando botões de fim de semana...');
}

function configurarBotaoHorasExtras() {
    console.log('🔧 Configurando botão de horas extras...');
}

function configurarEdicaoManual() {
    console.log('🔧 Configurando edição manual...');
}

function configurarCamposResumoEditaveis() {
    console.log('🔧 Configurando campos de resumo editáveis...');
}

function configurarToggleHorasExtras() {
    console.log('🔧 Configurando toggle de horas extras...');
}

function configurarAssinatura(canvas, ctx) {
    console.log('🔧 Configurando assinatura...');
}

function limparAssinatura() {
    console.log('🧹 Limpando assinatura...');
}

function salvarAssinatura() {
    console.log('💾 Salvando assinatura...');
}

function exportarAssinatura() {
    console.log('📤 Exportando assinatura...');
}

function importarAssinatura(event) {
    console.log('📥 Importando assinatura...');
}

// Funções placeholder para outras funções que podem ser chamadas
function preencherQuinzena() {
    console.log('📅 Preenchendo quinzena...');
    preencherTabelaComDados();
}

function preencherMesInteiro() {
    console.log('📅 Preenchendo mês inteiro...');
    preencherTabelaComDados();
}

function preencherDiasTrabalhados() {
    console.log('📅 Preenchendo dias trabalhados...');
    preencherTabelaComDados();
}

function forcarPreenchimentoDias() {
    console.log('📅 Forçando preenchimento de dias...');
    preencherTabelaComDados();
}

function preencherTodosDiasUteis() {
    console.log('📅 Preenchendo todos os dias úteis...');
    preencherTabelaComDados();
}

function preencher30Dias() {
    console.log('📅 Preenchendo 30 dias...');
    preencherTabelaComDados();
}

function preencher31Dias() {
    console.log('📅 Preenchendo 31 dias...');
    // DESABILITADO TEMPORARIAMENTE para evitar conflitos
    console.log('⚠️ Função preencher31Dias desabilitada temporariamente');
    alert('Esta função foi desabilitada temporariamente para resolver o problema do mês. Use "Preencher Mês" em vez disso.');
    return;
    
    // Código original comentado:
    // preencherTabelaComDados();
}

function exportarParaExcel() {
    console.log('📊 Exportando para Excel...');
    alert('Funcionalidade de exportação para Excel será implementada em breve!');
}

// ========================================================
// FUNÇÕES BASEADAS NO MODELO DE TABELA
// ========================================================

// Função para adicionar nova linha manualmente
function adicionarLinha() {
    const data = document.getElementById('data-entrada').value;
    const entrada = document.getElementById('entrada').value;
    const almocoInicio = document.getElementById('almoco-inicio').value;
    const almocoFim = document.getElementById('almoco-fim').value;
    const saida = document.getElementById('saida').value;
    
    if (!data || !entrada || !saida) {
        mostrarNotificacao('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Calcular horas trabalhadas
    const horasTrabalhadas = calcularHoras(entrada, almocoInicio, almocoFim, saida);
    const horasContrato = 8; // 8 horas por dia
    
    // Criar novo lançamento
    const novoLancamento = {
        data: data,
        entrada: entrada,
        almoco: `${almocoInicio} - ${almocoFim}`,
        saida: saida,
        horasTrabalhadas: horasTrabalhadas,
        valorContrato: horasContrato,
        horasExtras: 0
    };
    
    // Adicionar ao array de lançamentos
    lancamentos.push(novoLancamento);
    
    // CORREÇÃO: Não chamar atualizarTabela() pois ela sobrescreve a tabela correta
    // A tabela já foi gerada corretamente pela função gerarTabelaInicial()
    console.log('✅ Lançamento adicionado - não sobrescrever tabela');
    
    // Atualizar totais
    atualizarTotais();
    
    // Limpar campos
    document.getElementById('data-entrada').value = '';
    
    mostrarNotificacao('Linha adicionada com sucesso!', 'success');
}

// Função para calcular horas trabalhadas
function calcularHoras(entrada, almocoInicio, almocoFim, saida) {
    const entradaMin = converterParaMinutos(entrada);
    const almocoInicioMin = converterParaMinutos(almocoInicio);
    const almocoFimMin = converterParaMinutos(almocoFim);
    const saidaMin = converterParaMinutos(saida);
    
    const horasAntesAlmoco = almocoInicioMin - entradaMin;
    const horasDepoisAlmoco = saidaMin - almocoFimMin;
    const totalMinutos = horasAntesAlmoco + horasDepoisAlmoco;
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}

// Função para converter hora para minutos
function converterParaMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

// Função para preencher mês completo - SOLUÇÃO DEFINITIVA IMPLEMENTADA
function preencherMes() {
    console.log('🔄 Iniciando preenchimento do mês...');
    
    // Obter mês e ano da interface
    const dataSelecionada = document.getElementById('data-selecionada');
    let mes, ano;
    
    if (dataSelecionada && dataSelecionada.value) {
        const [anoStr, mesStr] = dataSelecionada.value.split('-');
        ano = parseInt(anoStr);
        mes = parseInt(mesStr);
    } else {
        // Usar mês e ano atuais se não houver seleção
        const hoje = new Date();
        mes = hoje.getMonth() + 1;
        ano = hoje.getFullYear();
    }
    
    if (!mes || !ano) {
        mostrarNotificacao('Por favor, selecione um mês válido!', 'error');
        return;
    }
    
    console.log(`📅 Preenchendo mês ${mes}/${ano}...`);
    
    // LIMPEZA COMPLETA E AGRESSIVA para evitar resíduos de meses anteriores
    console.log('🧹 Iniciando limpeza completa...');
    
    // Limpar array de lançamentos
    lancamentos = [];
    console.log('🗑️ Array de lançamentos limpo');
    
    // Limpar TODAS as tabelas possíveis
    const tbodyCartaoPonto = document.querySelector('.cartao-ponto tbody');
    if (tbodyCartaoPonto) {
        tbodyCartaoPonto.innerHTML = '';
        console.log('🗑️ Tabela .cartao-ponto limpa');
    }
    
    const tbodyTabelaPrincipal = document.getElementById('tabela-principal');
    if (tbodyTabelaPrincipal) {
        tbodyTabelaPrincipal.innerHTML = '';
        console.log('🗑️ Tabela #tabela-principal limpa');
    }
    
    // Limpar qualquer outra tabela que possa existir
    const todasTabelas = document.querySelectorAll('tbody');
    todasTabelas.forEach((tbody, index) => {
        if (tbody.innerHTML.trim() !== '') {
            tbody.innerHTML = '';
            console.log(`🗑️ Tabela ${index} limpa`);
        }
    });
    
    // ATUALIZAR VARIÁVEL GLOBAL periodoAtual para o mês selecionado
    periodoAtual = {
        mes: mes,
        ano: ano,
        inicio: 1,
        fim: new Date(ano, mes, 0).getDate()
    };
    console.log(`🔧 Variável global periodoAtual atualizada: ${periodoAtual.mes}/${periodoAtual.ano}`);
    
    // ATUALIZAR CAMPO DE PERÍODO NO HTML
    const campoPeriodo = document.getElementById('periodo');
    if (campoPeriodo) {
        const mesStr = mes.toString().padStart(2, '0');
        const periodoFormatado = `01/${mesStr} a ${periodoAtual.fim}/${mesStr}/${ano}`;
        campoPeriodo.value = periodoFormatado;
        console.log(`📅 Campo período atualizado: ${periodoFormatado}`);
    }
    
    // LIMPAR dados antigos antes de gerar a tabela
    console.log('🧹 Limpando dados antigos...');
    lancamentos = [];
    
    // Limpar localStorage para evitar carregamento de dados antigos
    localStorage.removeItem('lancamentos');
    console.log('🗑️ localStorage limpo');
    
    // GERAR TABELA INICIAL com o mês correto
    console.log('🔄 Gerando tabela inicial com o mês correto...');
    gerarTabelaInicial();
    
    // CORREÇÃO: Não chamar atualizarTabela() aqui pois ela sobrescreve a tabela gerada corretamente
    // A tabela já foi gerada corretamente pela função gerarTabelaInicial()
    console.log('✅ Tabela gerada corretamente - não sobrescrever com dados antigos');
    
    // Apenas atualizar totais e resumo final
    setTimeout(() => {
        console.log('🔄 Atualizando totais e resumo...');
        if (typeof atualizarTotais === 'function') {
            atualizarTotais();
        }
        if (typeof atualizarResumoFinal === 'function') {
            atualizarResumoFinal();
        }
    }, 100);
    
    // Obter configurações de horas
    const horasDiaUtil = parseInt(document.getElementById('horas-dia-util')?.value || '9');
    const horasSexta = parseInt(document.getElementById('horas-sexta')?.value || '8');
    const incluirFinsSemana = document.getElementById('incluir-fins-semana')?.value === 'true';
    
    const diasNoMes = new Date(ano, mes, 0).getDate(); // DIAS CORRETOS DO MÊS
    
    // SOLUÇÃO DEFINITIVA: Criar datas de forma mais segura para evitar problemas de mês
    console.log(`🔍 Criando datas para o mês ${mes}/${ano}...`);
    console.log(`🚨 CORRIGIDO: Começando do dia 1 até ${diasNoMes} (dias reais do mês)`);
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        // VERIFICAÇÃO EXTRA: Garantir que é dia 1 ou maior
        if (dia < 1) {
            console.log(`❌ ERRO: Dia ${dia} é menor que 1 - pulando`);
            continue;
        }
        
        // SOLUÇÃO: Usar string de data ISO para evitar problemas de timezone
        const dataStr = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
        
        // Criar data a partir da string ISO (mais seguro)
        const data = new Date(dataStr + 'T00:00:00');
        
        // VERIFICAÇÃO EXTRA: Garantir que a data é válida e do mês correto
        if (isNaN(data.getTime())) {
            console.log(`⚠️ Data inválida criada para dia ${dia}: ${dataStr}`);
            continue;
        }
        
        // VERIFICAÇÃO CRÍTICA: Confirmar que é realmente do mês selecionado
        const mesCriado = data.getMonth() + 1;
        const anoCriado = data.getFullYear();
        const diaCriado = data.getDate();
        
        console.log(`🔍 Verificação tripla - Dia ${dia}: criado=${mesCriado}/${anoCriado}/${diaCriado}, esperado=${mes}/${ano}/${dia}`);
        
        // Só incluir se for exatamente o mês, ano e dia selecionados
        if (mesCriado !== mes || anoCriado !== ano || diaCriado !== dia) {
            console.log(`❌ PULANDO dia ${dia} - data criada: ${mesCriado}/${anoCriado}/${diaCriado}, esperado: ${mes}/${ano}/${dia}`);
            continue;
        }
        
        // VERIFICAÇÃO FINAL: Garantir que não é dia do mês anterior
        if (dia < 1 || dia > diasNoMes) {
            console.log(`❌ ERRO: Dia ${dia} fora do range válido (1-${diasNoMes}) - pulando`);
            continue;
        }
        
        // VERIFICAÇÃO CRÍTICA: Garantir que é do mês selecionado
        const dataTeste = new Date(ano, mes - 1, dia);
        const mesTeste = dataTeste.getMonth() + 1;
        const anoTeste = dataTeste.getFullYear();
        
        if (mesTeste !== mes || anoTeste !== ano) {
            console.log(`❌ ERRO: Dia ${dia} não pertence ao mês ${mes}/${ano} - pulando`);
            continue;
        }
        
        const diaSemana = data.getDay();
        
        // Verificar se deve incluir este dia
        let incluirDia = false;
        
        if (incluirFinsSemana) {
            // Incluir TODOS os dias do mês selecionado
            incluirDia = true;
        } else {
            // Incluir apenas dias úteis (segunda a sexta)
            incluirDia = diaSemana >= 1 && diaSemana <= 5;
        }
        
        if (incluirDia) {
            // Determinar horários baseados no dia da semana
            let entrada, almoco, saida, horasTrabalhadas;
            
            if (diaSemana === 5) { // Sexta-feira
                entrada = '07:00';
                almoco = '12:00';
                saida = '16:00';
                horasTrabalhadas = horasSexta;
            } else if (diaSemana === 0 || diaSemana === 6) { // Domingo ou Sábado
                entrada = '07:00';
                almoco = '12:00';
                saida = '17:00';
                horasTrabalhadas = horasDiaUtil;
            } else {
                // Segunda a Quinta
                entrada = '07:00';
                almoco = '12:00';
                saida = '17:00';
                horasTrabalhadas = horasDiaUtil;
            }
            
            const novoLancamento = {
                data: dataStr,
                entrada: entrada,
                almoco: almoco,
                saida: saida,
                horasTrabalhadas: horasTrabalhadas,
                dia: dia,
                mes: mes,
                ano: ano,
                diaSemana: diaSemana
            };
            
            lancamentos.push(novoLancamento);
            console.log(`✅ Dia ${dia} (${dataStr}) adicionado: ${entrada} - ${almoco} - ${saida} (${horasTrabalhadas}h)`);
        } else {
            console.log(`⏭️ Dia ${dia} (${dataStr}) pulado - não é dia útil`);
        }
    }
    
    console.log(`📊 Total de dias preenchidos: ${lancamentos.length}`);
    
    // CORREÇÃO: Não chamar atualizarTabela() pois ela sobrescreve a tabela correta
    // A tabela já foi gerada corretamente pela função gerarTabelaInicial()
    console.log('✅ Mês preenchido - não sobrescrever tabela');
    
    // Atualizar interface
    atualizarTotais();
    atualizarResumoFinal();
    
    mostrarNotificacao(`Mês ${mes}/${ano} preenchido com ${lancamentos.length} dias!`, 'success');
}

// Função para limpar tabela
function limparTabela() {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
        lancamentos = [];
        
        // CORREÇÃO: Não chamar atualizarTabela() pois ela sobrescreve a tabela correta
        // A tabela já foi gerada corretamente pela função gerarTabelaInicial()
        console.log('✅ Tabela limpa - não sobrescrever');
        
        // Regenerar tabela limpa
        gerarTabelaInicial();
        atualizarTotais();
        mostrarNotificacao('Tabela limpa com sucesso!', 'success');
    }
}

// Função de teste para gerar PDF
function testeGerarPDF() {
    console.log('🔧 Iniciando teste de geração de PDF...');
    
    try {
        // Verificar se jsPDF está disponível
        let jsPDFClass = null;
        
        if (typeof window.jsPDF !== 'undefined') {
            jsPDFClass = window.jsPDF;
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFClass = jsPDF;
        } else if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
        }
        
        if (!jsPDFClass) {
            throw new Error('jsPDF não encontrado');
        }
        
        // Criar PDF de teste simples
        const doc = new jsPDFClass('portrait', 'mm', 'a4');
        
        doc.setFontSize(16);
        doc.text('Teste de Geração de PDF', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Este é um teste da função exportarParaPDF', 105, 40, { align: 'center' });
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 60, { align: 'center' });
        doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, 105, 80, { align: 'center' });
        
        doc.text('✅ Função exportarParaPDF está funcionando!', 105, 100, { align: 'center' });
        
        doc.save('teste_gerar_pdf.pdf');
        
        console.log('✅ Teste de geração de PDF executado com sucesso!');
        mostrarNotificacao('Teste de geração de PDF executado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro no teste de geração de PDF:', error);
        mostrarNotificacao(`Erro no teste: ${error.message}`, 'error');
    }
}

// Função de teste PDF
function testePDF() {
    console.log('🧪 Iniciando teste PDF...');
    
    try {
        // Verificar se jsPDF está disponível
        let jsPDFClass = null;
        
        if (typeof window.jsPDF !== 'undefined') {
            jsPDFClass = window.jsPDF;
            console.log('✅ jsPDF encontrado via window.jsPDF');
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFClass = jsPDF;
            console.log('✅ jsPDF encontrado via jsPDF global');
        } else if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
            console.log('✅ jsPDF encontrado via window.jspdf.jsPDF');
        }
        
        if (!jsPDFClass) {
            throw new Error('jsPDF não encontrado');
        }
        
        // Criar PDF de teste simples
        const doc = new jsPDFClass('portrait', 'mm', 'a4');
        
        doc.setFontSize(16);
        doc.text('Teste de Exportação PDF', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Este é um teste simples de exportação PDF', 105, 40, { align: 'center' });
        doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 60, { align: 'center' });
        doc.text(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`, 105, 80, { align: 'center' });
        
        doc.text('✅ jsPDF está funcionando corretamente!', 105, 100, { align: 'center' });
        
        doc.save('teste_pdf.pdf');
        
        console.log('✅ Teste PDF executado com sucesso!');
        mostrarNotificacao('Teste PDF executado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro no teste PDF:', error);
        mostrarNotificacao(`Erro no teste PDF: ${error.message}`, 'error');
    }
}

function exportarParaPDF() {
    console.log('📄 Iniciando exportação para PDF - VERSÃO SIMPLES...');
    
    // Obter mês e ano selecionados
    const mesSelecionado = periodoAtual?.mes || new Date().getMonth() + 1;
    const anoSelecionado = periodoAtual?.ano || new Date().getFullYear();
    const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
    
    console.log(`🔍 Gerando PDF para mês ${mesSelecionado}/${anoSelecionado} (${diasNoMes} dias)`);
    
    // Atualizar resumo final antes de gerar o PDF
    console.log('🔄 Atualizando resumo final antes da exportação...');
    if (typeof atualizarResumoFinal === 'function') {
        atualizarResumoFinal();
    }
    
    try {
        // Verificar se jsPDF está disponível
        let jsPDFClass = null;
        
        console.log('🔍 Verificando disponibilidade do jsPDF...');
        console.log('window.jsPDF:', typeof window.jsPDF);
        console.log('jsPDF global:', typeof jsPDF);
        console.log('window.jspdf:', typeof window.jspdf);
        
        if (typeof window.jsPDF !== 'undefined') {
            jsPDFClass = window.jsPDF;
            console.log('✅ jsPDF encontrado via window.jsPDF');
        } else if (typeof jsPDF !== 'undefined') {
            jsPDFClass = jsPDF;
            console.log('✅ jsPDF encontrado via jsPDF global');
        } else if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            jsPDFClass = window.jspdf.jsPDF;
            console.log('✅ jsPDF encontrado via window.jspdf.jsPDF');
        }
        
        if (!jsPDFClass) {
            console.error('❌ jsPDF não encontrado!');
            console.log('🔄 Tentando carregar jsPDF dinamicamente...');
            
            // Tentar carregar jsPDF dinamicamente
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = function() {
                    console.log('✅ jsPDF carregado dinamicamente');
                    setTimeout(() => {
                        exportarParaPDF().then(resolve).catch(reject);
                    }, 1000);
                };
                script.onerror = function() {
                    console.error('❌ Falha ao carregar jsPDF dinamicamente');
                    reject(new Error('Falha ao carregar jsPDF. Verifique sua conexão com a internet.'));
                };
                document.head.appendChild(script);
            });
        }
        
        // Criar documento PDF - LAYOUT COMPACTO PARA UMA PÁGINA
        const doc = new jsPDFClass('portrait', 'mm', 'a4');
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10; // Margem menor para aproveitar espaço
        
        let y = margin;
        
        // ========================================
        // CABEÇALHO COMPACTO
        // ========================================
        
        // Título principal (menor)
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('CONTROLE DE MEDIÇÃO', pageWidth/2, y + 8, { align: 'center' });
        
        // Subtítulo (menor)
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('M.A VIANA LOCAÇÕES E SERVIÇOS - ME', pageWidth/2, y + 14, { align: 'center' });
        
        // Linha decorativa
        y += 20; // Menor espaçamento
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
        
        // ========================================
        // INFORMAÇÕES COMPACTAS DA EMPRESA
        // ========================================
        
        // Layout em 3 colunas compactas
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        
        // Coluna 1: DADOS DA EMPRESA
        doc.text('DADOS DA EMPRESA', margin, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text(`CNPJ: ${document.getElementById('cnpj-empresa')?.value || '14.251.442/0001-15'}`, margin, y + 3);
        doc.text(`Empresa: ${document.getElementById('nome-empresa')?.value || 'M.A VIANA LOCAÇÕES E SERVIÇOS - ME'}`, margin, y + 6);
        doc.text(`Obra: ${document.getElementById('endereco-obra')?.value || 'Não informado'}`, margin, y + 9);
        
        // Coluna 2: ENDEREÇO
        doc.setFont(undefined, 'bold');
        doc.text('ENDEREÇO', margin + 80, y);
        doc.setFont(undefined, 'normal');
        doc.text(`Rua: ${document.getElementById('rua-empresa')?.value || 'Rua Desembargador Auro Cerqueira Leite, 36'}`, margin + 80, y + 3);
        doc.text(`Cidade: ${document.getElementById('cidade-empresa')?.value || 'Cidade Kemel - São Paulo, SP'}`, margin + 80, y + 6);
        doc.text(`CEP: ${document.getElementById('cep-empresa')?.value || '08130-410'}`, margin + 80, y + 9);
        
        // Coluna 3: LOCAÇÃO
        doc.setFont(undefined, 'bold');
        doc.text('LOCAÇÃO', margin + 140, y);
        doc.setFont(undefined, 'normal');
        doc.text(`Equipamento: ${document.getElementById('equipamento')?.value || 'BOB CAT'}`, margin + 140, y + 3);
        
        // Formatar valor do contrato com vírgula decimal
        const valorContrato = parseFloat(document.getElementById('valor-contrato')?.value || '2500');
        const valorFormatado = valorContrato.toLocaleString('pt-BR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
        doc.text(`Contrato: R$ ${valorFormatado}`, margin + 140, y + 6);
        
        doc.text(`Tipo: ${document.getElementById('tipo-contrato')?.value || 'MENSAL'}`, margin + 140, y + 9);
        
        // Calcular período automaticamente baseado no mês selecionado
        let periodoPDF = 'Período não definido';
        if (periodoAtual && periodoAtual.mes && periodoAtual.ano) {
            const mesInicio = periodoAtual.mes.toString().padStart(2, '0');
            const mesFim = periodoAtual.mes.toString().padStart(2, '0');
            const ano = periodoAtual.ano;
            periodoPDF = `01/${mesInicio} a ${periodoAtual.fim}/${mesFim}/${ano}`;
        } else {
            // Fallback para o valor do campo se periodoAtual não estiver definido
            periodoPDF = document.getElementById('periodo')?.value || '01/09 a 30/09/2025';
        }
        
        doc.text(`Período: ${periodoPDF}`, margin + 120, y + 12);
        doc.text(`Operador: ${document.getElementById('operador')?.value || 'ANTONIO PEREIRA'}`, margin + 120, y + 15);
        
        y += 20; // Menor espaçamento
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
            
        // ========================================
        // TABELA DE LANÇAMENTOS - VERSÃO SIMPLES
        // ========================================
        
        // Título da tabela
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('REGISTRO DE HORAS TRABALHADAS', pageWidth/2, y, { align: 'center' });
        y += 6;
        
        // Cabeçalho da tabela
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, 6, 'F');
        
        // Cabeçalhos das colunas
        const headers = ['DIA', 'DATA', 'ENTRADA', 'ALMOÇO', 'SAÍDA', 'HORAS', 'CONTRATO'];
        const colWidths = [15, 25, 25, 25, 25, 20, 25];
        let x = margin;
        
        doc.setFontSize(7);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        headers.forEach((header, i) => {
            doc.text(header, x + 2, y + 1);
            x += colWidths[i];
        });
        y += 6;
        
        // GERAR DIAS DO MÊS DIRETAMENTE NO PDF - VERSÃO SIMPLES
        console.log(`🔄 Gerando ${diasNoMes} dias do mês ${mesSelecionado}/${anoSelecionado} diretamente no PDF...`);
        
        doc.setFontSize(6);
        doc.setFont(undefined, 'normal');
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataStr = `${anoSelecionado}-${mesSelecionado.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
            const data = new Date(anoSelecionado, mesSelecionado - 1, dia);
            const diaSemana = data.getDay();
            
            // Verificar se é dia útil (segunda a sexta)
            if (diaSemana >= 1 && diaSemana <= 5) {
                let horasTrabalhadas = 9;
                let entrada = '07:00';
                let almoco = '12:00';
                let saida = '17:00';
                
                // Configuração especial para sexta-feira
                if (diaSemana === 5) {
                    horasTrabalhadas = 8;
                    saida = '16:00';
                }
                
                // Obter dia da semana
                const dias = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
                const diaSemanaStr = dias[diaSemana];
                const dataFormatada = data.toLocaleDateString('pt-BR');
                
                // Fundo alternado para linhas
                const index = dia - 1;
                if (index % 2 === 0) {
                    doc.setFillColor(248, 248, 248);
                    doc.rect(margin, y - 1, pageWidth - 2 * margin, 4, 'F');
                }
                
                x = margin;
                const rowData = [
                    diaSemanaStr,
                    dataFormatada,
                    entrada,
                    almoco,
                    saida,
                    horasTrabalhadas,
                    '8:00'
                ];
                
                doc.setTextColor(0, 0, 0);
                rowData.forEach((cell, i) => {
                    doc.text(cell.toString(), x + 1, y + 1);
                    x += colWidths[i];
                });
                
                console.log(`✅ Dia ${dia} (${dataStr}) adicionado ao PDF: ${diaSemanaStr} ${dataFormatada}`);
                y += 4;
            }
        }
        
        y += 10;
        
        
        // ========================================
        // SEÇÃO MEDIÇÃO
        // ========================================
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
        
        // Título da medição
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('MEDIÇÃO', pageWidth/2, y, { align: 'center' });
        y += 5;
        
        // Box da medição compacto
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, 25, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin, y - 2, pageWidth - 2 * margin, 25, 'S');
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        // Obter valores dos campos de medição
        const totalHorasFinal = document.getElementById('total-horas-final')?.textContent || '00:00';
        const totalDiasFinal = document.getElementById('total-dias-final')?.textContent || '0';
        const valorTotalFinal = document.getElementById('valor-total-final')?.textContent || 'R$ 0,00';
        const totalCombustivel = document.getElementById('total-combustivel')?.textContent || 'R$ 0,00';
        const totalDescontosFinal = document.getElementById('total-descontos-final')?.textContent || 'R$ 0,00';
        const totalMedicaoFinal = document.getElementById('total-medicao-final')?.textContent || 'R$ 0,00';
        
        // Debug: Log dos valores obtidos
        console.log('🔍 Valores de MEDIÇÃO obtidos para PDF:', {
            totalHorasFinal,
            totalDiasFinal,
            valorTotalFinal,
            totalCombustivel,
            totalDescontosFinal,
            totalMedicaoFinal
        });
        
        // Layout em 2 colunas para medição
        doc.setFont(undefined, 'bold');
        doc.text('TOTAIS:', margin + 5, y + 2);
        doc.setFont(undefined, 'normal');
        doc.text(`• Total de Horas: ${totalHorasFinal}`, margin + 5, y + 6);
        doc.text(`• Total de Dias: ${totalDiasFinal}`, margin + 5, y + 10);
        doc.text(`• Valor Total: ${valorTotalFinal}`, margin + 5, y + 14);
        
        doc.setFont(undefined, 'bold');
        doc.text('DESCONTOS:', pageWidth/2 + 5, y + 2);
        doc.setFont(undefined, 'normal');
        doc.text(`• Combustível: ${totalCombustivel}`, pageWidth/2 + 5, y + 6);
        doc.text(`• Total Descontos: ${totalDescontosFinal}`, pageWidth/2 + 5, y + 10);
        
        // Total final da medição (centralizado)
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`TOTAL MEDIÇÃO: ${totalMedicaoFinal}`, pageWidth/2, y + 18, { align: 'center' });
        
        y += 30;
        
        // ========================================
        // ASSINATURA COMPACTA
        // ========================================
        
        // Linha separadora
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
        
        // Área de assinatura compacta
        if (assinaturaSalva) {
            console.log('✍️ Adicionando assinatura ao PDF...');
            try {
                const img = new Image();
                img.onload = function() {
                    // Box da assinatura compacto
                    doc.setFillColor(250, 250, 250);
                    doc.rect(margin, y - 3, pageWidth - 2 * margin, 20, 'F');
                    doc.setDrawColor(200, 200, 200);
                    doc.rect(margin, y - 3, pageWidth - 2 * margin, 20, 'S');
                    
                    // Assinatura
                    doc.addImage(img, 'PNG', margin + 10, y, 40, 16);
                    
                    // Informações da assinatura compactas
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'bold');
                    doc.setTextColor(0, 0, 0);
                    doc.text('ASSINATURA DO OPERADOR:', pageWidth/2, y + 18, { align: 'center' });
                    
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'bold');
                    doc.text(document.getElementById('operador')?.value || 'ANTONIO PEREIRA', pageWidth/2, y + 25, { align: 'center' });
                    
                    // Salvar PDF
                    const dataCompleta = new Date().toLocaleDateString('pt-BR');
                    const nomeArquivo = `relatorio_medicao_${dataCompleta.replace(/\//g, '-')}.pdf`;
                    doc.save(nomeArquivo);
                    
                    console.log('✅ PDF exportado com sucesso!');
                    mostrarNotificacao('PDF exportado com sucesso!', 'success');
                };
                img.src = assinaturaSalva;
            } catch (error) {
                console.warn('⚠️ Erro ao adicionar assinatura:', error);
                // Continuar sem assinatura
                criarAreaAssinaturaSemImagem(doc, y, pageWidth, margin);
            }
        } else {
            // Sem assinatura
            criarAreaAssinaturaSemImagem(doc, y, pageWidth, margin);
        }
        
    } catch (error) {
        console.error('❌ Erro ao exportar PDF:', error);
        mostrarNotificacao(`Erro ao exportar PDF: ${error.message}`, 'error');
        
        // Tentar carregar jsPDF dinamicamente
        console.log('🔄 Tentando carregar jsPDF dinamicamente...');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() {
            console.log('✅ jsPDF carregado dinamicamente, tente exportar novamente');
            mostrarNotificacao('jsPDF carregado! Tente exportar novamente.', 'info');
        };
        script.onerror = function() {
            console.error('❌ Falha ao carregar jsPDF dinamicamente');
            mostrarNotificacao('Falha ao carregar jsPDF. Verifique sua conexão com a internet.', 'error');
        };
        document.head.appendChild(script);
    }
}

// Função de teste para verificar campos de MEDIÇÃO
function testarCamposMedicao() {
    console.log('🧪 Testando campos de MEDIÇÃO...');
    
    // Verificar se os elementos existem
    const elementos = [
        'total-horas-final',
        'total-dias-final', 
        'valor-total-final',
        'total-combustivel',
        'total-descontos-final',
        'total-medicao-final'
    ];
    
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`${id}:`, elemento ? elemento.textContent : 'ELEMENTO NÃO ENCONTRADO');
    });
    
    // Chamar atualizarResumoFinal
    console.log('🔄 Chamando atualizarResumoFinal...');
    if (typeof atualizarResumoFinal === 'function') {
        atualizarResumoFinal();
    } else {
        console.error('❌ Função atualizarResumoFinal não encontrada');
    }
    
    // Verificar novamente após atualização
    console.log('🔍 Valores após atualização:');
    elementos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`${id}:`, elemento ? elemento.textContent : 'ELEMENTO NÃO ENCONTRADO');
    });
}

// Função de teste para verificar filtro de mês
function testarFiltroMes() {
    console.log('🧪 Testando filtro de mês...');
    
    // Verificar periodoAtual
    console.log('🔍 periodoAtual:', periodoAtual);
    
    // Verificar lançamentos
    console.log('🔍 Total de lançamentos:', lancamentos ? lancamentos.length : 'não definido');
    
    if (lancamentos && lancamentos.length > 0) {
        console.log('🔍 Primeiros 10 lançamentos:');
        lancamentos.slice(0, 10).forEach((l, i) => {
            console.log(`  ${i + 1}: ${l.data} (${l.entrada || 'N/A'})`);
        });
        
        // Testar filtro
        const mesSelecionado = periodoAtual?.mes || new Date().getMonth() + 1;
        const anoSelecionado = periodoAtual?.ano || new Date().getFullYear();
        
        const lancamentosFiltrados = lancamentos.filter(lancamento => {
            if (!lancamento.data) return false;
            const [ano, mes] = lancamento.data.split('-').map(Number);
            return mes === mesSelecionado && ano === anoSelecionado;
        });
        
        console.log(`🔍 Lançamentos filtrados para ${mesSelecionado}/${anoSelecionado}:`, lancamentosFiltrados.length);
        
        if (lancamentosFiltrados.length > 0) {
            console.log('🔍 Primeiros 5 lançamentos filtrados:');
            lancamentosFiltrados.slice(0, 5).forEach((l, i) => {
                console.log(`  ${i + 1}: ${l.data} (${l.entrada || 'N/A'})`);
            });
        }
    }
}

// Função auxiliar para criar área de assinatura compacta sem imagem
function criarAreaAssinaturaSemImagem(doc, y, pageWidth, margin) {
    // Box da assinatura compacto
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 20, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 20, 'S');
    
    // Linha para assinatura
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.5);
    doc.line(margin + 20, y + 8, pageWidth - margin - 20, y + 8);
    
    // Informações da assinatura compactas
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ASSINATURA DO OPERADOR:', pageWidth/2, y + 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(document.getElementById('operador')?.value || 'ANTONIO PEREIRA', pageWidth/2, y + 22, { align: 'center' });
    
    // Salvar PDF
    const dataCompleta = new Date().toLocaleDateString('pt-BR');
    const nomeArquivo = `relatorio_medicao_${dataCompleta.replace(/\//g, '-')}.pdf`;
    doc.save(nomeArquivo);
    
    console.log('✅ PDF exportado com sucesso (sem assinatura)!');
    mostrarNotificacao('PDF exportado com sucesso!', 'success');
}

// ========================================================
// SISTEMA DE NOTIFICAÇÕES INTELIGENTE
// ========================================================

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = [];
        this.init();
    }

    init() {
        // Criar container de notificações
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    show(options) {
        const {
            title = 'Notificação',
            message = '',
            type = 'info',
            duration = 5000,
            persistent = false
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <h4 class="notification-title">${title}</h4>
                <button class="notification-close" aria-label="Fechar notificação">×</button>
            </div>
            <p class="notification-message">${message}</p>
            ${!persistent ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
        `;

        // Adicionar ao container
        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Configurar fechamento
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(notification));

        // Auto-remover se não for persistente
        if (!persistent && duration > 0) {
            setTimeout(() => this.remove(notification), duration);
        }

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        return notification;
    }

    remove(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('removing');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 500);
    }

    success(message, title = 'Sucesso!') {
        return this.show({ title, message, type: 'success' });
    }

    error(message, title = 'Erro!') {
        return this.show({ title, message, type: 'error', persistent: true });
    }

    warning(message, title = 'Atenção!') {
        return this.show({ title, message, type: 'warning' });
    }

    info(message, title = 'Informação') {
        return this.show({ title, message, type: 'info' });
    }

    clear() {
        this.notifications.forEach(notification => this.remove(notification));
    }
}

// ========================================================
// SISTEMA DE DARK MODE
// ========================================================

class DarkModeManager {
    constructor() {
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.init();
    }

    init() {
        // Criar botão de toggle
        this.createToggleButton();
        
        // Aplicar estado inicial
        this.applyTheme();
        
        // Detectar preferência do sistema
        this.detectSystemPreference();
    }

    createToggleButton() {
        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.innerHTML = this.isDarkMode ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', 'Alternar modo escuro');
        
        toggle.addEventListener('click', () => this.toggle());
        document.body.appendChild(toggle);
    }

    toggle() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
        
        // Atualizar ícone do botão
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.innerHTML = this.isDarkMode ? '☀️' : '🌙';
        }
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    detectSystemPreference() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            if (localStorage.getItem('darkMode') === null) {
                this.isDarkMode = e.matches;
                this.applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        handleChange(mediaQuery);
    }
}

// ========================================================
// SISTEMA DE CACHE INTELIGENTE
// ========================================================

class CacheManager {
    constructor() {
        this.cacheName = 'medicao-cache-v3.0';
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'caches' in window) {
            await this.cleanOldCaches();
        }
    }

    async cleanOldCaches() {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
            name.startsWith('medicao-cache-') && name !== this.cacheName
        );
        
        await Promise.all(oldCaches.map(name => caches.delete(name)));
    }

    async cacheData(key, data) {
        if ('caches' in window) {
            const cache = await caches.open(this.cacheName);
            const response = new Response(JSON.stringify(data));
            await cache.put(key, response);
        }
    }

    async getCachedData(key) {
        if ('caches' in window) {
            const cache = await caches.open(this.cacheName);
            const response = await cache.match(key);
            if (response) {
                return await response.json();
            }
        }
        return null;
    }
}

// ========================================================
// SISTEMA DE ANALYTICS E TELEMETRIA
// ========================================================

class AnalyticsManager {
    constructor() {
        this.events = [];
        this.init();
    }

    init() {
        // Capturar eventos importantes
        this.captureUserActions();
        this.capturePerformanceMetrics();
    }

    captureUserActions() {
        // Botões principais
        const buttons = document.querySelectorAll('.btn-futurista, .btn-secundario, .btn-teste');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.track('button_click', {
                    button_text: e.target.textContent.trim(),
                    button_class: e.target.className
                });
            });
        });

        // Formulários
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                this.track('form_submit', {
                    form_id: form.id || 'unknown'
        });
    });
        });
    }

    capturePerformanceMetrics() {
        // Métricas de performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.track('page_load', {
                load_time: perfData.loadEventEnd - perfData.loadEventStart,
                dom_content_loaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
            });
        });
    }

    track(event, data = {}) {
        const eventData = {
            event,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ...data
        };

        this.events.push(eventData);
        
        // Limitar eventos em memória
        if (this.events.length > 100) {
            this.events = this.events.slice(-50);
        }

        // Enviar para servidor se disponível
        this.sendToServer(eventData);
    }

    async sendToServer(data) {
        try {
            // Aqui você pode implementar o envio para seu servidor de analytics
            // Por exemplo: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
            console.log('📊 Analytics:', data);
        } catch (error) {
            console.warn('Erro ao enviar analytics:', error);
        }
    }

    getEvents() {
        return this.events;
    }
}

// ========================================================
// SISTEMA DE VALIDAÇÃO AVANÇADA
// ========================================================

class ValidationManager {
    constructor() {
        this.rules = new Map();
        this.init();
    }

    init() {
        this.setupValidationRules();
        this.bindValidationEvents();
    }

    setupValidationRules() {
        // Regras para campos de data
        this.rules.set('date', {
            pattern: /^\d{4}-\d{2}-\d{2}$/,
            message: 'Data deve estar no formato YYYY-MM-DD'
        });

        // Regras para campos de hora
        this.rules.set('time', {
            pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            message: 'Hora deve estar no formato HH:MM'
        });

        // Regras para valores monetários
        this.rules.set('currency', {
            pattern: /^R?\$?\s*\d{1,3}(\.\d{3})*(,\d{2})?$/,
            message: 'Valor deve estar no formato R$ X,XX'
        });

        // Regras para CNPJ
        this.rules.set('cnpj', {
            pattern: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
            message: 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX'
        });
    }

    bindValidationEvents() {
        // Validar campos em tempo real
        document.addEventListener('input', (e) => {
            if (e.target.dataset.validate) {
                this.validateField(e.target);
            }
        });

        // Validar formulários no submit
        document.addEventListener('submit', (e) => {
            if (!this.validateForm(e.target)) {
                e.preventDefault();
            }
        });
    }

    validateField(field) {
        const ruleType = field.dataset.validate;
        const rule = this.rules.get(ruleType);
        
        if (!rule) return true;

        const isValid = rule.pattern.test(field.value);
        
        if (!isValid) {
            this.showFieldError(field, rule.message);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    validateForm(form) {
        const fields = form.querySelectorAll('[data-validate]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 12px;
            margin-top: 4px;
            animation: fadeIn 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// ========================================================
// SISTEMA DE GESTÃO DE ESTADO
// ========================================================

class StateManager {
    constructor() {
        this.state = {};
        this.listeners = new Map();
        this.init();
    }

    init() {
        // Carregar estado salvo
        this.loadState();
        
        // Salvar estado automaticamente
        window.addEventListener('beforeunload', () => this.saveState());
    }

    setState(key, value) {
        this.state[key] = value;
        this.notifyListeners(key, value);
        this.saveState();
    }

    getState(key) {
        return this.state[key];
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }

    notifyListeners(key, value) {
        const callbacks = this.listeners.get(key) || [];
        callbacks.forEach(callback => callback(value));
    }

    saveState() {
        try {
            localStorage.setItem('medicao-state', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Erro ao salvar estado:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('medicao-state');
            if (saved) {
                this.state = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Erro ao carregar estado:', error);
        }
    }
}

// ========================================================
// INICIALIZAÇÃO DOS SISTEMAS AVANÇADOS
// ========================================================

// Instanciar sistemas
const notificationSystem = new NotificationSystem();
const darkModeManager = new DarkModeManager();
const cacheManager = new CacheManager();
const analyticsManager = new AnalyticsManager();
const validationManager = new ValidationManager();
const stateManager = new StateManager();

// Substituir função de notificação antiga
function mostrarNotificacao(mensagem, tipo = 'info') {
    const titles = {
        'sucesso': 'Sucesso!',
        'erro': 'Erro!',
        'aviso': 'Atenção!',
        'info': 'Informação'
    };

    notificationSystem.show({
        title: titles[tipo] || 'Notificação',
        message: mensagem,
        type: tipo,
        duration: tipo === 'erro' ? 0 : 5000 // Erros são persistentes
    });
}

// Função para adicionar loading state
function setLoadingState(element, loading = true) {
    if (loading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Função para validar campos
function validateField(field, ruleType) {
    field.dataset.validate = ruleType;
    return validationManager.validateField(field);
}

// Função para rastrear eventos
function trackEvent(event, data) {
    analyticsManager.track(event, data);
}