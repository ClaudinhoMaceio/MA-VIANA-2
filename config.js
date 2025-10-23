// ========================================================
// CONFIGURAÇÕES DO SISTEMA - M.A VIANA LOCAÇÕES
// ========================================================

// Configurações gerais do sistema
const CONFIG = {
    // Informações da empresa
    empresa: {
        nome: "M.A VIANA LOCAÇÕES E SERVIÇOS - ME",
        cnpj: "14.251.442/0001-15",
        endereco: "Rua Desembargador Auro Cerqueira Leite, 36",
        cidade: "Cidade Kemel - São Paulo, SP",
        cep: "08130-410"
    },
    
    // Configurações de horário padrão
    horarios: {
        entrada: "07:00",
        almoco: "12:00",
        saida: "17:00",
        horasPorDia: 8,
        horasPorDiaUtil: 9,
        horasSexta: 8
    },
    
    // Configurações de medição
    medicao: {
        valorContrato: 2500,
        tipoContrato: "MENSAL",
        equipamento: "BOB CAT",
        operador: "ANTONIO PEREIRA"
    },
    
    // Configurações de feriados (2025)
    feriados: [
        '2025-01-01', // Ano Novo
        '2025-04-20', // Páscoa
        '2025-05-01', // Dia do Trabalho
        '2025-09-07', // Independência
        '2025-10-12', // Nossa Senhora
        '2025-11-02', // Finados
        '2025-11-15', // Proclamação da República
        '2025-12-25'  // Natal
    ],
    
    // Configurações de validação
    validacao: {
        camposObrigatorios: ['data', 'entrada', 'saida'],
        formatoData: 'YYYY-MM-DD',
        formatoHora: 'HH:mm'
    },
    
    // Configurações de exportação
    exportacao: {
        formatoPDF: 'A4',
        orientacao: 'landscape',
        margens: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    }
};

// Funções utilitárias de configuração
const ConfigUtils = {
    // Obter configuração por chave
    get: function(key) {
        return key.split('.').reduce((obj, k) => obj && obj[k], CONFIG);
    },
    
    // Definir configuração
    set: function(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, k) => obj[k] = obj[k] || {}, CONFIG);
        target[lastKey] = value;
    },
    
    // Verificar se é feriado
    isFeriado: function(data) {
        const dataStr = typeof data === 'string' ? data : data.toISOString().split('T')[0];
        return CONFIG.feriados.includes(dataStr);
    },
    
    // Obter configuração de horário
    getHorario: function(tipo) {
        return CONFIG.horarios[tipo] || CONFIG.horarios.entrada;
    },
    
    // Validar campo obrigatório
    validarCampo: function(campo, valor) {
        if (CONFIG.validacao.camposObrigatorios.includes(campo)) {
            return valor && valor.trim() !== '';
        }
        return true;
    }
};

// Exportar para uso global
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;

console.log('✅ Configurações carregadas com sucesso');
