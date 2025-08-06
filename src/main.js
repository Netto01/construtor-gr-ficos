import { dadosPredefinidos, imagemPato } from './chartData.js';
import { mostrarMensagemInicial, calcularConfigLegenda, mostrarMensagem } from './chartUtils.js';
import { preencherPainel, salvarAlteracoes } from './chartPanel.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- IMPORTANTE: Registra os plugins ---
    Chart.register(ChartDataLabels);
    if (typeof ChartAnnotation !== 'undefined') {
        Chart.register(ChartAnnotation);
    }

    // --- 1. Seleção de Elementos ---
    const chartPanel = document.querySelector('.chart-panel');
    const meuGraficoCanvas = document.getElementById('meuGrafico');
    const ctx = meuGraficoCanvas.getContext('2d');
    const testSelect = document.getElementById('test-select');
    const ageSelect = document.getElementById('age-select');
    const ageGroup = document.getElementById('age-group');
    const exportBtn = document.getElementById('export-btn');
    const pixKeySpan = document.getElementById('pix-key');
    const copyPixBtn = document.getElementById('copy-pix-btn');

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
    let testeSelecionado = null;

    // Listas de idades para cada teste
    const fdtIdades = [
        { value: '6-8', label: '6 - 8 anos' },
        { value: '9-10', label: '9 - 10 anos' },
        { value: '11-12', label: '11 - 12 anos' },
        { value: '13-15', label: '13 - 15 anos' },
        { value: '16-18', label: '16 - 18 anos' },
        { value: '19-34', label: '19 - 34 anos' },
        { value: '35-59', label: '35 - 59 anos' },
        { value: '60-75', label: '60 - 75 anos' },
        { value: '76-200', label: '76 anos ou mais' }
    ];

    const ravltIdades = [
        { value: '6-8', label: '6 - 8 anos' },
        { value: '9-11', label: '9 - 11 anos' },
        { value: '12-14', label: '12 - 14 anos' },
        { value: '15-17', label: '15 - 17 anos' },
        { value: '18-20', label: '18 - 20 anos' },
        { value: '21-30', label: '21 - 30 anos' },
        { value: '31-40', label: '31 - 40 anos' },
        { value: '41-50', label: '41 - 50 anos' },
        { value: '51-60', label: '51 - 60 anos' },
        { value: '61-70', label: '61 - 70 anos' },
        { value: '71-79', label: '71 - 79 anos' }
    ];

    function atualizarIdades(tipo) {
        ageSelect.innerHTML = '<option value="" disabled selected>Selecione a idade</option>';
        const lista = tipo === 'fdt' ? fdtIdades : ravltIdades;
        lista.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            ageSelect.appendChild(option);
        });
    }

    // --- 3. Funções do Gráfico e Painel ---
    function criarGrafico(dados) {
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        const isMobile = window.innerWidth <= 600;
        const isTablet = window.innerWidth > 600 && window.innerWidth <= 1024;
        meuGraficoCanvas.width = chartPanel.clientWidth;
        meuGraficoCanvas.height = chartPanel.clientHeight;
        
        let layoutPadding;
        if (isMobile) {
            layoutPadding = { top: 20, bottom: 140, left: 10, right: 10 };
        } else if (isTablet) {
            layoutPadding = { top: 20, bottom: 120, left: 15, right: 15 };
        } else {
            layoutPadding = { top: 20, bottom: 100, left: 20, right: 20 };
        }

        // Configuração de anotação para WISC-IV e WASI-II
        const annotationConfig = (dados.titulo === 'Resultados do WISC-IV' || dados.titulo === 'Resultados do WASI-II') ? {
            annotations: {
                box1: {
                    type: 'box',
                    yMin: 90,
                    yMax: 109,
                    backgroundColor: 'rgba(52, 73, 94, 0.15)',
                    borderColor: 'rgba(52, 73, 94, 0.4)',
                    borderWidth: 1,
                    label: {
                        display: true,
                        content: 'Média: 90 - 109',
                        color: '#34495e',
                        font: { size: isMobile ? 10 : 12, style: 'italic' },
                        position: 'center'
                    },
                    borderDash: [6, 6],
                    borderDashOffset: 0
                }
            }
        } : {};

        // Criação dos datasets para o gráfico
        let datasets = [{
            label: dados.titulo,
            data: dados.valores,
            backgroundColor: dados.cores,
            borderColor: dados.tipo === 'line' ? dados.cores[0] : 'transparent',
            borderWidth: dados.tipo === 'line' ? 3 : 1,
            tension: 0.3,
            pointRadius: dados.tipo === 'line' ? 6 : 0,
            pointBackgroundColor: dados.cores,
            pointStyle: dados.tipo === 'line' ? 'circle' : 'rect',
            order: 1
        }];
        
        // Adiciona datasets para as linhas/barras de referência do RAVLT ou FDT, se aplicável
        if ((testeSelecionado === 'ravlt' || testeSelecionado === 'fdt') && ageSelect.value) {
            const idade = ageSelect.value;
            const normas = dadosPredefinidos[testeSelecionado].normas[idade];

            datasets.push({
                label: 'Mínimo',
                data: normas.min,
                borderColor: dados.tipo === 'line' ? 'rgba(231, 76, 60, 0.8)' : 'transparent',
                backgroundColor: dados.tipo === 'line' ? 'transparent' : 'rgba(231, 76, 60, 0.6)',
                borderWidth: 2,
                borderDash: dados.tipo === 'line' ? [5, 5] : [],
                tension: 0.3,
                pointRadius: 0,
                fill: false,
                type: dados.tipo,
                order: 2
            });

            datasets.push({
                label: 'Máximo',
                data: normas.max,
                borderColor: dados.tipo === 'line' ? 'rgba(46, 204, 113, 0.8)' : 'transparent',
                backgroundColor: dados.tipo === 'line' ? 'transparent' : 'rgba(46, 204, 113, 0.6)',
                borderWidth: 2,
                borderDash: dados.tipo === 'line' ? [5, 5] : [],
                tension: 0.3,
                pointRadius: 0,
                fill: false,
                type: dados.tipo,
                order: 2
            });

            datasets.push({
                label: 'Média',
                data: normas.avg,
                borderColor: dados.tipo === 'line' ? 'rgba(52, 152, 219, 0.8)' : 'transparent',
                backgroundColor: dados.tipo === 'line' ? 'transparent' : 'rgba(52, 152, 219, 0.6)',
                borderWidth: 2,
                tension: 0.3,
                pointRadius: 0,
                fill: false,
                type: dados.tipo,
                order: 2
            });
        }
        
        const legendConfig = calcularConfigLegenda();

        meuGrafico = new Chart(ctx, {
            type: dados.tipo,
            data: {
                labels: dados.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: { padding: layoutPadding },
                plugins: {
                    title: {
                        display: true,
                        text: dados.titulo,
                        font: { size: isMobile ? 16 : 24, weight: 'normal' },
                        padding: { top: 10, bottom: 20 },
                        onClick: () => {
                            contextoEdicao = 'titulo';
                            preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, estadoAtualDoGrafico.titulo);
                        }
                    },
                    datalabels: {
                        display: dados.showDatalabels,
                        color: '#6c757d',
                        anchor: 'end',
                        align: 'top',
                        font: { weight: 'bold', size: isMobile ? 10 : 12 },
                        formatter: (value) => value
                    },
                    legend: {
                        ...legendConfig,
                        labels: {
                            ...legendConfig.labels,
                            generateLabels: (chart) => {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                labels.forEach((label) => {
                                    if (isMobile && label.text.length > 15) {
                                        label.text = label.text.substring(0, 12) + '...';
                                    } else if (isTablet && label.text.length > 20) {
                                        label.text = label.text.substring(0, 17) + '...';
                                    }
                                });
                                if (dados.titulo === 'Resultados do WISC-IV' || dados.titulo === 'Resultados do WASI-II') {
                                    labels.push({
                                        text: isMobile ? 'Média: 90-109' : 'Média: 90 - 109',
                                        fillStyle: 'rgba(52, 73, 94, 0.15)',
                                        strokeStyle: 'rgba(52, 73, 94, 0.4)',
                                        lineWidth: 1,
                                        hidden: false,
                                        index: labels.length,
                                        pointStyle: 'rect'
                                    });
                                }
                                return labels;
                            }
                        },
                        onClick: (e, legendItem) => {
                            if (legendItem.text.includes('Média') || legendItem.text === 'Mínimo' || legendItem.text === 'Máximo') {
                                const index = legendItem.datasetIndex;
                                const ci = meuGrafico;
                                const meta = ci.getDatasetMeta(index);
                                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                                ci.update();
                                return;
                            }
                            const index = legendItem.index;
                            elementoEmEdicaoIndex = index;
                            contextoEdicao = 'barra';
                            preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, estadoAtualDoGrafico.labels[index], estadoAtualDoGrafico.valores[index], estadoAtualDoGrafico.cores[index]);
                        }
                    },
                    annotation: annotationConfig,
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y;
                                }
                                return label;
                            }
                        }
                    }
                },
                onClick: (e) => {
                    const elementosAtivos = meuGrafico.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (elementosAtivos.length > 0) {
                        const clickedElement = elementosAtivos[0];
                        if (clickedElement.datasetIndex === 0) {
                            const index = clickedElement.index;
                            elementoEmEdicaoIndex = index;
                            contextoEdicao = 'barra';
                            preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, estadoAtualDoGrafico.labels[index], estadoAtualDoGrafico.valores[index], estadoAtualDoGrafico.cores[index]);
                        }
                    } else {
                        const tituloArea = {
                            top: meuGrafico.chartArea.top,
                            bottom: meuGrafico.chartArea.top + meuGrafico.options.plugins.title.font.size + 10,
                            left: 0,
                            right: meuGrafico.width
                        };
                        if (e.x >= tituloArea.left && e.x <= tituloArea.right && e.y >= tituloArea.top && e.y <= tituloArea.bottom) {
                            contextoEdicao = 'titulo';
                            preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, estadoAtualDoGrafico.titulo);
                        }
                    }
                },
                onHover: (e, elementosAtivos, chart) => {
                    e.native.target.style.cursor = 'default';
                    const tituloArea = {
                        top: chart.chartArea.top,
                        bottom: chart.chartArea.top + chart.options.plugins.title.font.size + 10,
                        left: 0,
                        right: chart.width
                    };
                    if (e.x >= tituloArea.left && e.x <= tituloArea.right && e.y >= tituloArea.top && e.y <= tituloArea.bottom) {
                        e.native.target.style.cursor = 'pointer';
                    }
                    if (elementosAtivos.length > 0 && elementosAtivos[0].datasetIndex === 0) {
                        e.native.target.style.cursor = 'pointer';
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: dados.yMin,
                        max: dados.yMax,
                        grid: { color: '#e0e0e0', lineWidth: 1 },
                        title: { display: true, text: 'Pontuação', font: { size: isMobile ? 10 : 12 } }
                    },
                    x: {
                        grid: { display: false },
                        title: { display: false },
                        ticks: {
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0,
                            font: { size: isMobile ? 8 : 12 },
                            padding: isMobile ? 5 : 0,
                            autoSkip: false,
                            callback: function(value) {
                                const label = this.getLabelForValue(value);
                                return label.split('\n');
                            }
                        }
                    }
                },
                barPercentage: 0.8
            }
        });

        exportBtn.classList.remove('hidden');
    }

    function carregarDados(tipo) {
        testeSelecionado = tipo;
        estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos[tipo]));
        contextoEdicao = 'titulo';
        elementoEmEdicaoIndex = null;
        criarGrafico(estadoAtualDoGrafico);
        preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, estadoAtualDoGrafico.titulo, '', '#000000', chartTypeSelect, yMinInput, yMaxInput, showDatalabelsCheckbox);
        
        if (tipo === 'ravlt' || tipo === 'fdt') {
            ageGroup.classList.remove('hidden');
            atualizarIdades(tipo);
        } else {
            ageGroup.classList.add('hidden');
            ageSelect.value = "";
        }
    }

    function exportarGrafico() {
        if (!meuGrafico) return;
        const link = document.createElement('a');
        link.download = `${estadoAtualDoGrafico.titulo.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = meuGrafico.toBase64Image();
        link.click();
    }

    // --- 4. Eventos ---
    testSelect.addEventListener('change', (event) => carregarDados(event.target.value));
    ageSelect.addEventListener('change', () => criarGrafico(estadoAtualDoGrafico));

    saveBtn.addEventListener('click', () => salvarAlteracoes(estadoAtualDoGrafico, contextoEdicao, elementoEmEdicaoIndex, editLabelInput, editValueInput, editColorInput, criarGrafico, chartTypeSelect, yMinInput, yMaxInput, showDatalabelsCheckbox));
    exportBtn.addEventListener('click', exportarGrafico);

    copyPixBtn.addEventListener('click', () => {
        const pixKey = pixKeySpan.textContent.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pixKey)
                .then(() => mostrarMensagem('Chave PIX copiada!'))
                .catch(err => {
                    console.error('Falha ao copiar:', err);
                    mostrarMensagem('Falha ao copiar a chave.');
                });
        } else {
            const inputTemp = document.createElement('input');
            inputTemp.value = pixKey;
            document.body.appendChild(inputTemp);
            inputTemp.select();
            document.execCommand('copy');
            document.body.removeChild(inputTemp);
            mostrarMensagem('Chave PIX copiada!');
        }
    });

    // --- 5. Inicialização ---
    mostrarMensagemInicial(ctx, meuGraficoCanvas, chartPanel, exportBtn, imagemPato);

    window.addEventListener('resize', () => {
        if (estadoAtualDoGrafico && testeSelecionado) {
            criarGrafico(estadoAtualDoGrafico);
        } else {
            mostrarMensagemInicial(ctx, meuGraficoCanvas, chartPanel, exportBtn, imagemPato);
        }
    });
});