// src/chartData.js

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
        // Novos dados normativos para várias faixas de idade
        normas: {
            '6-8': {
                min: [2, 3, 4, 4, 4, 2, 3, 13],
                max: [8, 10, 12, 13, 13, 7, 13, 13],
                avg: [4, 6, 7, 8, 8, 4, 7, 7]
            },
            '9-11': {
                min: [3, 4, 3, 4, 5, 3, 4, 4],
                max: [8, 11, 13, 14, 14, 8, 12, 13],
                avg: [5, 7, 9, 9, 10, 5, 9, 9]
            },
            '12-14': {
                min: [4, 4, 4, 3, 6, 3, 5, 5],
                max: [9, 12, 14, 14, 15, 9, 13, 14],
                avg: [6, 8, 10, 10, 11, 6, 10, 10]
            },
            '15-17': {
                min: [4, 4, 4, 6, 7, 3, 5, 6],
                max: [8, 11, 13, 14, 14, 9, 14, 14],
                avg: [6, 8, 10, 11, 11, 5, 10, 11]
            },
            '18-20': {
                min: [4, 6, 8, 8, 8, 4, 6, 6],
                max: [10, 13, 14, 15, 15, 9, 15, 15],
                avg: [7, 9, 11, 12, 12, 6, 12, 11]
            },
            '21-30': {
                min: [4, 5, 6, 7, 8, 3, 6, 6],
                max: [9, 12, 14, 15, 15, 9, 15, 15],
                avg: [7, 9, 11, 12, 13, 6, 11, 11]
            },
            '31-40': {
                min: [4, 5, 6, 7, 8, 2, 6, 6],
                max: [9, 12, 14, 15, 15, 8, 14, 14],
                avg: [6, 9, 10, 11, 12, 5, 11, 11]
            },
            '41-50': {
                min: [4, 5, 5, 6, 7, 3, 5, 5],
                max: [9, 12, 14, 15, 15, 8, 14, 14],
                avg: [6, 8, 10, 11, 12, 5, 10, 10]
            },
            '51-60': {
                min: [3, 5, 5, 7, 8, 2, 5, 4],
                max: [9, 12, 14, 14, 15, 8, 14, 14],
                avg: [6, 8, 10, 11, 12, 5, 10, 10]
            },
            '61-70': {
                min: [3, 5, 6, 7, 8, 2, 4, 5],
                max: [8, 11, 12, 13, 14, 7, 13, 14],
                avg: [5, 8, 9, 10, 11, 5, 10, 10]
            },
            '71-79': {
                min: [3, 5, 5, 5, 7, 1, 3, 4],
                max: [8, 10, 11, 13, 14, 7, 12, 12],
                avg: [5, 7, 8, 9, 10, 4, 8, 8]
            }
        }
    }
};

export const imagemPato = 'patoImagem.png';
