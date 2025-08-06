// ...existing code...
export const dadosPredefinidos = {
    wisc: {
        titulo: 'Resultados do WISC-IV',
        labels: ['Compreensão Verbal', 'Organização Perceptual', 'Memória Operacional', 'Velocidade\nde Processamento', 'QI Total'],
        valores: [110, 105, 112, 108, 115],
        cores: ['#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c'],
        tipo: 'bar',
        yMin: 0,
        yMax: 150,
        showDatalabels: true
    },
    ravlt: {
        titulo: 'Resultados do RAVLT',
        labels: ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'A6', 'A7'],
        valores: [5, 8, 10, 12, 14, 13, 15, 16],
        cores: ['#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c'],
        tipo: 'line',
        yMin: 0,
        yMax: 20,
        showDatalabels: true,
        normas: {
            '6-8':   { min: [2, 3, 4, 4, 4, 2, 3, 3], max: [8, 10, 12, 13, 13, 7, 13, 13], avg: [4, 6, 7, 8, 8, 4, 7, 7] },
            '9-11':  { min: [3, 4, 3, 4, 5, 3, 4, 4], max: [8, 11, 13, 14, 14, 8, 12, 13], avg: [5, 7, 9, 9, 10, 5, 9, 9] },
            '12-14': { min: [4, 4, 4, 3, 6, 3, 5, 5], max: [9, 12, 14, 14, 15, 9, 13, 14], avg: [6, 8, 10, 10, 11, 6, 10, 10] },
            '15-17': { min: [4, 4, 4, 6, 7, 3, 5, 6], max: [8, 11, 13, 14, 14, 9, 14, 14], avg: [6, 8, 10, 11, 11, 5, 10, 11] },
            '18-20': { min: [4, 6, 8, 8, 8, 4, 6, 6], max: [10, 13, 14, 15, 15, 9, 15, 15], avg: [7, 9, 11, 12, 12, 6, 12, 11] },
            '21-30': { min: [4, 5, 6, 7, 8, 3, 6, 6], max: [9, 12, 14, 15, 15, 9, 15, 15], avg: [7, 9, 11, 12, 13, 6, 11, 11] },
            '31-40': { min: [4, 5, 6, 7, 8, 2, 6, 6], max: [9, 12, 14, 15, 15, 8, 14, 14], avg: [6, 9, 10, 11, 12, 5, 11, 11] },
            '41-50': { min: [4, 5, 5, 6, 7, 3, 5, 5], max: [9, 12, 14, 15, 15, 8, 14, 14], avg: [6, 8, 10, 11, 12, 5, 10, 10] },
            '51-60': { min: [3, 5, 5, 7, 8, 2, 5, 4], max: [9, 12, 14, 14, 15, 8, 14, 14], avg: [6, 8, 10, 11, 12, 5, 10, 10] },
            '61-70': { min: [3, 5, 6, 7, 8, 2, 4, 5], max: [8, 11, 12, 13, 14, 7, 13, 14], avg: [5, 8, 9, 10, 11, 5, 10, 10] },
            '71-79': { min: [3, 5, 5, 5, 7, 1, 3, 4], max: [8, 10, 11, 13, 14, 7, 12, 12], avg: [5, 7, 8, 9, 10, 4, 8, 8] }
        }
    },
    wasi: {
        titulo: 'Resultados do WASI-II',
        unidadeY: 'QI',
        labels: ['QI Verbal', 'QI de Execução', 'Escala Total-4', 'Escala Total-2'],
        valores: [105, 110, 108, 112],
        cores: ['#0ea5e9', '#0ea5e9', '#0ea5e9', '#0ea5e9'],
        tipo: 'bar',
        yMin: 0,
        yMax: 150,
        showDatalabels: true
    },
    fdt: {
        titulo: 'Resultados do FDT (em segundos)',
        unidadeY: 'Tempo (segundos)',
        labels: ['Leitura', 'Contagem', 'Escolha', 'Alternância', 'Inibição', 'Flexibilidade'],
        valores: [20, 25, 45, 60, 25, 40],
        cores: ['#9b59b6', '#9b59b6', '#9b59b6', '#9b59b6', '#9b59b6', '#9b59b6'],
        tipo: 'line',
        yMin: 0,
        yMax: 120,
        showDatalabels: true,
        normas: {
            '6-8':   { min: [48, 83, 109, 133, 76, 92], max: [25, 32, 41, 58, 17, 26], avg: [34, 48, 79, 91, 43, 55] },
            '9-10':  { min: [38, 52, 88, 101, 57, 73], max: [22, 28, 46, 54, 19, 28], avg: [29, 39, 63, 75, 35, 46] },
            '11-12':  { min: [47, 54, 93, 96, 51, 68], max: [20, 25, 38, 46, 12, 16], avg: [27, 36, 56, 66, 28, 39] },
            '13-15':  { min: [34, 44, 68, 81, 42, 53], max: [17, 21, 33, 36, 8, 14], avg: [23, 28, 45, 53, 24, 32] },
            '16-18':  { min: [29, 30, 44, 63, 22, 44], max: [16, 19, 25, 34, 6, 16], avg: [20, 24, 33, 42, 13, 22] },
            '19-34':  { min: [31, 34, 52, 64, 28, 42], max: [16, 19, 27, 33, 5, 10], avg: [21, 24, 35, 44, 14, 22] },
            '35-59':  { min: [37, 40, 65, 89, 38, 55], max: [17, 19, 28, 34, 5, 14], avg: [23, 26, 39, 48, 15, 26] },
            '60-75':  { min: [37, 41, 68, 93, 39, 63], max: [18, 21, 30, 41, 9, 18], avg: [25, 28, 46, 62, 20, 35] },
            '76-200': { min: [38, 46, 96, 108, 63, 71], max: [20, 21, 33, 48, 7, 22], avg: [40, 45, 75, 95, 35, 55] },
        }
    }
};

export const imagemPato = 'src/img/patoImagem.png';
