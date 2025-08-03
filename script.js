// Aguarda o carregamento completo do DOM antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- IMPORTANTE: Registra os plugins ---
    Chart.register(ChartDataLabels);
    if (typeof ChartAnnotation !== 'undefined') {
        Chart.register(ChartAnnotation);
    }

    // --- 1. Seleção de Elementos ---
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    const wiscBtn = document.getElementById('wisc-btn');
    const ravltBtn = document.getElementById('ravlt-btn');
    const exportBtn = document.getElementById('export-btn');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Elementos do Painel de Edição
    const panelTitle = document.getElementById('panel-title');
    const labelGroup = document.getElementById('label-group');
    const valueGroup = document.getElementById('value-group');
    const colorGroup = document.getElementById('color-group');
    const editLabelInput = document.getElementById('edit-label');
    const editValueInput = document.getElementById('edit-value');
    const editColorInput = document.getElementById('edit-color');
    const saveBtn = document.getElementById('save-btn');

    // Novos elementos de personalização
    const optionsGroup = document.getElementById('options-group');
    const chartTypeSelect = document.getElementById('chart-type');
    const yMinInput = document.getElementById('y-min');
    const yMaxInput = document.getElementById('y-max');
    const showDatalabelsCheckbox = document.getElementById('show-datalabels');

    let meuGrafico;
    let estadoAtualDoGrafico = {};
    let elementoEmEdicaoIndex = null;
    let contextoEdicao = 'titulo';

    // --- 2. Dados Predefinidos dos Testes ---
    const dadosPredefinidos = {
        wisc: {
            titulo: 'Resultados do WISC-IV',
            labels: ['Compreensão Verbal', 'Organização Perceptual', 'Memória Operacional', 'Velocidade de Processamento', 'QI Total'],
            valores: [110, 105, 112, 108, 115],
            cores: ['#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c'],
            tipo: 'bar',
            yMin: 0,
            yMax: 150,
            showDatalabels: true
        },
        ravlt: {
            titulo: 'Resultados do RAVLT',
            labels: ['Tentativa I', 'Tentativa II', 'Tentativa III', 'Tentativa IV', 'Tentativa V', 'Recuperação Tardia'],
            valores: [5, 8, 10, 12, 14, 13],
            cores: ['#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c'],
            tipo: 'line',
            yMin: 0,
            yMax: 20,
            showDatalabels: true
        }
    };

    // --- 3. Funções do Gráfico e Painel ---
    function criarGrafico(dados) {
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        loadingSpinner.classList.remove('hidden');

        const isMobile = window.innerWidth <= 600;

        const annotationConfig = (dados.titulo === 'Resultados do WISC-IV') ? {
            annotations: {
                box1: {
                    type: 'box',
                    yMin: 90,
                    yMax: 109,
                    backgroundColor: 'rgba(52, 73, 94, 0.15)',
                    borderColor: 'rgba(52, 73, 94, 0.4)',
                    borderWidth: 1,
                    label: {
                        display: false
                    },
                    borderDash: [6, 6],
                    borderDashOffset: 0
                }
            }
        } : {};

        meuGrafico = new Chart(ctx, {
            type: dados.tipo,
            data: {
                labels: dados.labels,
                datasets: [{
                    label: dados.titulo,
                    data: dados.valores,
                    backgroundColor: dados.cores,
                    borderColor: dados.tipo === 'line' ? dados.cores[0] : 'transparent', // Linhas agora são visíveis
                    borderWidth: 1,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: dados.cores,
                    pointStyle: dados.tipo === 'line' ? 'circle' : 'rect'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                layout: {
                    padding: 20
                },
                
                plugins: {
                    title: {
                        display: true,
                        text: dados.titulo,
                        font: {
                            size: isMobile ? 16 : 24,
                            weight: 'normal'
                        },
                        onClick: () => {
                            contextoEdicao = 'titulo';
                            preencherPainel(estadoAtualDoGrafico.titulo);
                        }
                    },
                    datalabels: {
                        display: dados.showDatalabels,
                        color: '#6c757d',
                        anchor: 'end',
                        align: 'top',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value) => {
                            return value;
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: {
                                size: isMobile ? 10 : 14
                            },
                            padding: isMobile ? 10 : 20,
                            generateLabels: (chart) => {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                if (dados.titulo === 'Resultados do WISC-IV') {
                                    labels.push({
                                        text: 'Média: 90 - 109',
                                        fillStyle: 'rgba(52, 73, 94, 0.15)',
                                        strokeStyle: 'rgba(52, 73, 94, 0.4)',
                                        lineWidth: 1,
                                        hidden: false,
                                        index: labels.length
                                    });
                                }
                                return labels;
                            }
                        }
                    },
                    annotation: annotationConfig
                },
                
                onClick: (e) => {
                    const elementosAtivos = meuGrafico.getElementsAtEventForMode(e, 'point', { intersect: true }, true);
                    
                    if (elementosAtivos.length > 0) {
                        const index = elementosAtivos[0].index;
                        elementoEmEdicaoIndex = index;
                        contextoEdicao = 'barra';
                        preencherPainel(
                            estadoAtualDoGrafico.labels[index],
                            estadoAtualDoGrafico.valores[index],
                            estadoAtualDoGrafico.cores[index]
                        );
                    } else {
                        // Clicou fora das barras. Verificamos se foi no título principal
                        const titulo = meuGrafico.options.plugins.title;
                        // Ajuste para pegar a área do título corretamente, garantindo que a detecção do clique funcione
                        const tituloArea = {
                            top: meuGrafico.chartArea.top,
                            bottom: meuGrafico.options.plugins.title.top + meuGrafico.options.plugins.title.font.size + 10,
                            left: 0,
                            right: meuGrafico.width
                        };

                        if (e.x >= tituloArea.left && e.x <= tituloArea.right && e.y >= tituloArea.top && e.y <= tituloArea.bottom) {
                            contextoEdicao = 'titulo';
                            preencherPainel(estadoAtualDoGrafico.titulo);
                        }
                    }
                },
                
                onHover: (e, elementosAtivos, chart) => {
                    e.native.target.style.cursor = 'default';
                    // Hover sobre a área do título
                    const titulo = chart.options.plugins.title;
                    const tituloArea = {
                        top: chart.chartArea.top,
                        bottom: chart.options.plugins.title.top + chart.options.plugins.title.font.size + 10,
                        left: 0,
                        right: chart.width
                    };
                    if (e.x >= tituloArea.left && e.x <= tituloArea.right && e.y >= tituloArea.top && e.y <= tituloArea.bottom) {
                        e.native.target.style.cursor = 'pointer';
                    }

                    // Hover sobre os elementos de dados
                    if (elementosAtivos.length > 0) {
                        e.native.target.style.cursor = 'pointer';
                    }
                },
                
                scales: {
                    y: {
                        beginAtZero: true,
                        min: dados.yMin,
                        max: dados.yMax,
                        grid: {
                            color: '#e0e0e0',
                            lineWidth: 1
                        },
                        title: {
                            display: true,
                            text: 'Pontuação',
                            font: {
                                size: isMobile ? 10 : 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: false
                        },
                        ticks: {
                            maxRotation: isMobile ? 90 : 0,
                            minRotation: isMobile ? 90 : 0,
                            font: {
                                size: isMobile ? 8 : 12
                            }
                        }
                    }
                }
            }
        });
        loadingSpinner.classList.add('hidden');
        exportBtn.classList.remove('hidden');
    }

    function preencherPainel(label, value = '', color = '#000000') {
        panelTitle.textContent = `Editar ${contextoEdicao === 'titulo' ? 'Título do Gráfico' : `"${label}"`}`;
        editLabelInput.value = label;
        editValueInput.value = value;
        editColorInput.value = color;

        if (contextoEdicao === 'titulo') {
            labelGroup.classList.remove('hidden');
            valueGroup.classList.add('hidden');
            colorGroup.classList.add('hidden');
            optionsGroup.classList.add('hidden');
        } else {
            labelGroup.classList.remove('hidden');
            valueGroup.classList.remove('hidden');
            colorGroup.classList.remove('hidden');
            optionsGroup.classList.remove('hidden');

            chartTypeSelect.value = estadoAtualDoGrafico.tipo;
            yMinInput.value = estadoAtualDoGrafico.yMin;
            yMaxInput.value = estadoAtualDoGrafico.yMax;
            showDatalabelsCheckbox.checked = estadoAtualDoGrafico.showDatalabels;
        }
    }

    wiscBtn.addEventListener('click', () => {
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.wisc));
        criarGrafico(estadoAtualDoGrafico);
        preencherPainel(estadoAtualDoGrafico.labels[0], estadoAtualDoGrafico.valores[0], estadoAtualDoGrafico.cores[0]);
    });

    ravltBtn.addEventListener('click', () => {
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.ravlt));
        criarGrafico(estadoAtualDoGrafico);
        preencherPainel(estadoAtualDoGrafico.labels[0], estadoAtualDoGrafico.valores[0], estadoAtualDoGrafico.cores[0]);
    });

    exportBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = meuGrafico.toBase64Image();
        link.download = `${estadoAtualDoGrafico.titulo.replace(/\s/g, '_')}_grafico.png`;
        link.click();
    });

    saveBtn.addEventListener('click', () => {
        if (contextoEdicao === 'barra' && elementoEmEdicaoIndex !== null) {
            const novoLabel = editLabelInput.value;
            const novoValor = parseInt(editValueInput.value);
            const novaCor = editColorInput.value;
            const novoTipo = chartTypeSelect.value;
            const novoYMin = parseInt(yMinInput.value);
            const novoYMax = parseInt(yMaxInput.value);
            const novoShowDatalabels = showDatalabelsCheckbox.checked;

            if (novoLabel.trim() !== '' && !isNaN(novoValor) && !isNaN(novoYMin) && !isNaN(novoYMax)) {
                estadoAtualDoGrafico.labels[elementoEmEdicaoIndex] = novoLabel;
                estadoAtualDoGrafico.valores[elementoEmEdicaoIndex] = novoValor;
                estadoAtualDoGrafico.cores[elementoEmEdicaoIndex] = novaCor;
                estadoAtualDoGrafico.tipo = novoTipo;
                estadoAtualDoGrafico.yMin = novoYMin;
                estadoAtualDoGrafico.yMax = novoYMax;
                estadoAtualDoGrafico.showDatalabels = novoShowDatalabels;
                criarGrafico(estadoAtualDoGrafico);
            } else {
                alert("Por favor, preencha todos os campos corretamente.");
            }
        } else if (contextoEdicao === 'titulo') {
            const novoTitulo = editLabelInput.value;
            if (novoTitulo.trim() !== '') {
                estadoAtualDoGrafico.titulo = novoTitulo;
                criarGrafico(estadoAtualDoGrafico);
            } else {
                alert("Por favor, preencha o título corretamente.");
            }
        }
    });

    wiscBtn.addEventListener('click', () => {
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.wisc));
        criarGrafico(estadoAtualDoGrafico);
        preencherPainel(estadoAtualDoGrafico.labels[0], estadoAtualDoGrafico.valores[0], estadoAtualDoGrafico.cores[0]);
    });
});
