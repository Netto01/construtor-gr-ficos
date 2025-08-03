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
    const loadingSpinner = document.getElementById('loading-spinner');

    // Elementos do Modal
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const labelGroup = document.getElementById('label-group');
    const valueGroup = document.getElementById('value-group');
    const colorGroup = document.getElementById('color-group');
    const editLabelInput = document.getElementById('edit-label');
    const editValueInput = document.getElementById('edit-value');
    const editColorInput = document.getElementById('edit-color');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let meuGrafico;
    let estadoAtualDoGrafico = {};
    let elementoEmEdicaoIndex = null;
    let contextoEdicao = 'titulo'; // Pode ser 'titulo' ou 'barra'

    // --- 2. Dados Predefinidos dos Testes ---
    const dadosPredefinidos = {
        wisc: {
            titulo: 'Resultados do WISC-IV',
            labels: ['Compreensão Verbal', 'Organização Perceptual', 'Memória Operacional', 'Velocidade de Processamento', 'QI Total'],
            valores: [110, 105, 112, 108, 115],
            cores: ['#42a5f5', '#42a5f5', '#42a5f5', '#42a5f5', '#42a5f5'],
            tipo: 'bar'
        },
        ravlt: {
            titulo: 'Resultados do RAVLT',
            labels: ['Tentativa I', 'Tentativa II', 'Tentativa III', 'Tentativa IV', 'Tentativa V', 'Recuperação Tardia'],
            valores: [5, 8, 10, 12, 14, 13],
            cores: ['#66bb6a', '#66bb6a', '#66bb6a', '#66bb6a', '#66bb6a', '#66bb6a'],
            tipo: 'line'
        }
    };

    // --- 3. Funções do Gráfico e Modal ---
    function criarGrafico(dados) {
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        loadingSpinner.classList.remove('hidden');

        const annotationConfig = (dados.tipo === 'bar') ? {
            annotations: {
                box1: {
                    type: 'box',
                    yMin: 90,
                    yMax: 109,
                    backgroundColor: 'rgba(0, 123, 255, 0.08)',
                    borderColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 1,
                    label: {
                        display: false // Oculta o label aqui, pois ele estará na legenda
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
                    borderColor: 'transparent',
                    borderWidth: 1,
                    tension: 0.3,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: dados.cores
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
                            size: 24,
                            weight: 'normal'
                        }
                    },
                    datalabels: {
                        color: '#666',
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
                                size: 14
                            },
                            padding: 20,
                            // Adicionando a anotação na legenda
                            generateLabels: (chart) => {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                if (dados.tipo === 'bar') { // Apenas para o gráfico de barras (WISC)
                                    labels.push({
                                        text: 'Média: 90 - 109',
                                        fillStyle: 'rgba(0, 123, 255, 0.08)',
                                        strokeStyle: 'rgba(0, 123, 255, 0.2)',
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
                        abrirModal(
                            estadoAtualDoGrafico.labels[index],
                            estadoAtualDoGrafico.valores[index],
                            estadoAtualDoGrafico.cores[index]
                        );
                    } else {
                        const titulo = meuGrafico.options.plugins.title;
                        const tituloArea = {
                            top: meuGrafico.chartArea.top,
                            bottom: meuGrafico.options.plugins.title.top + meuGrafico.options.plugins.title.font.size + 10,
                            left: 0,
                            right: meuGrafico.width
                        };

                        if (e.x >= tituloArea.left && e.x <= tituloArea.right && e.y >= tituloArea.top && e.y <= tituloArea.bottom) {
                            contextoEdicao = 'titulo';
                            abrirModal(estadoAtualDoGrafico.titulo);
                        }
                    }
                },
                
                onHover: (e, elementosAtivos, chart) => {
                    e.native.target.style.cursor = 'default';
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

                    if (elementosAtivos.length > 0) {
                        e.native.target.style.cursor = 'pointer';
                    }
                },
                
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e0e0e0',
                            borderDash: [5, 5]
                        },
                        title: {
                            display: true,
                            text: 'Pontuação'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Índices'
                        }
                    }
                }
            }
        });
        loadingSpinner.classList.add('hidden');
    }

    function abrirModal(label, value = '', color = '#000000') {
        modalTitle.textContent = `Editar ${contextoEdicao === 'titulo' ? 'Título do Gráfico' : `"${label}"`}`;
        editLabelInput.value = label;
        editValueInput.value = value;
        editColorInput.value = color;

        if (contextoEdicao === 'titulo') {
            labelGroup.classList.remove('hidden');
            valueGroup.classList.add('hidden');
            colorGroup.classList.add('hidden');
        } else {
            labelGroup.classList.remove('hidden');
            valueGroup.classList.remove('hidden');
            colorGroup.classList.remove('hidden');
        }

        modal.classList.add('visible');
    }

    function fecharModal() {
        modal.classList.remove('visible');
        elementoEmEdicaoIndex = null;
        contextoEdicao = 'titulo';
    }

    // --- 4. Eventos de Clique ---
    wiscBtn.addEventListener('click', () => {
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.wisc));
        criarGrafico(estadoAtualDoGrafico);
    });

    ravltBtn.addEventListener('click', () => {
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.ravlt));
        criarGrafico(estadoAtualDoGrafico);
    });

    // Eventos do Modal
    saveBtn.addEventListener('click', () => {
        if (contextoEdicao === 'barra' && elementoEmEdicaoIndex !== null) {
            const novoLabel = editLabelInput.value;
            const novoValor = parseInt(editValueInput.value);
            const novaCor = editColorInput.value;

            if (novoLabel.trim() !== '' && !isNaN(novoValor)) {
                estadoAtualDoGrafico.labels[elementoEmEdicaoIndex] = novoLabel;
                estadoAtualDoGrafico.valores[elementoEmEdicaoIndex] = novoValor;
                estadoAtualDoGrafico.cores[elementoEmEdicaoIndex] = novaCor;
                criarGrafico(estadoAtualDoGrafico);
                fecharModal();
            } else {
                alert("Por favor, preencha o título e o valor corretamente.");
            }
        } else if (contextoEdicao === 'titulo') {
            const novoTitulo = editLabelInput.value;
            if (novoTitulo.trim() !== '') {
                estadoAtualDoGrafico.titulo = novoTitulo;
                criarGrafico(estadoAtualDoGrafico);
                fecharModal();
            } else {
                alert("Por favor, preencha o título corretamente.");
            }
        }
    });

    cancelBtn.addEventListener('click', fecharModal);

    // --- 5. Inicialização da Página ---
    wiscBtn.click();
});