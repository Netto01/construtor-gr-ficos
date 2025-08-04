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

    // Variável para armazenar o teste atual selecionado
    let testeSelecionado = null;

    // --- 2. Dados Predefinidos dos Testes ---
    const dadosPredefinidos = {
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
            labels: ['Tentativa I', 'Tentativa II', 'Tentativa III', 'Tentativa IV', 'Tentativa V', 'Recuperação Tardia'],
            valores: [5, 8, 10, 12, 14, 13],
            cores: ['#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c', '#1abc9c'],
            tipo: 'line',
            yMin: 0,
            yMax: 20,
            showDatalabels: true
        }
    };
    
    // --- URLs de imagens para a mensagem inicial ---
    const imagemPato = 'patoImagem.png';

    // --- Nova função para quebrar rótulos longos em várias linhas ---
    function quebrarLabel(label, maxLargura, context) {
        if (context.measureText(label).width < maxLargura) {
            return label;
        }
        let linhas = [];
        let palavras = label.split(' ');
        let linhaAtual = palavras[0];
        for (let i = 1; i < palavras.length; i++) {
            let palavra = palavras[i];
            let novaLinha = linhaAtual + ' ' + palavra;
            if (context.measureText(novaLinha).width < maxLargura) {
                linhaAtual = novaLinha;
            } else {
                linhas.push(linhaAtual);
                linhaAtual = palavra;
            }
        }
        linhas.push(linhaAtual);
        return linhas;
    }

    // --- Função para desenhar uma imagem com bordas arredondadas no canvas ---
    function desenharImagemArredondada(ctx, img, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, width, height);
    }
    
    // --- Função para exibir a imagem na tela do gráfico ---
    function mostrarMensagemInicial() {
        // Otimização: Ajustar o tamanho do canvas para o tamanho do painel
        meuGraficoCanvas.width = chartPanel.clientWidth;
        meuGraficoCanvas.height = chartPanel.clientHeight;
        
        // Limpa o canvas
        ctx.clearRect(0, 0, meuGraficoCanvas.width, meuGraficoCanvas.height);
        
        // Carga da imagem do pato astronauta
        const patoImagem = new Image();
        patoImagem.src = imagemPato;
        patoImagem.onload = () => {
            const imgWidth = 400; // Tamanho da imagem original
            const imgHeight = 400; // Tamanho da imagem original
            const imgX = (meuGraficoCanvas.width - imgWidth) / 2;
            const imgY = (meuGraficoCanvas.height - imgHeight) / 2;
            const radius = 20; // Raio para as bordas arredondadas
            
            // Desenha a imagem no canvas com bordas arredondadas
            desenharImagemArredondada(ctx, patoImagem, imgX, imgY, imgWidth, imgHeight, radius);
        };
        // Em caso de erro ao carregar a imagem, mostra uma mensagem alternativa
        patoImagem.onerror = () => {
            ctx.font = '24px Inter';
            ctx.fillStyle = '#64748b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Selecione um teste no menu lateral para começar.', meuGraficoCanvas.width / 2, meuGraficoCanvas.height / 2);
        };

        // Oculta o botão de exportar
        exportBtn.classList.add('hidden');
    }

    // --- Função para calcular configuração responsiva das legendas ---
    function calcularConfigLegenda() {
        const width = window.innerWidth;
        const isMobile = width <= 600;
        const isTablet = width > 600 && width <= 1024;
        
        if (isMobile) {
            return {
                display: true,
                position: 'bottom',
                align: 'center',
                maxHeight: 120,
                labels: {
                    font: {
                        size: 10
                    },
                    padding: 8,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    boxHeight: 8,
                    textAlign: 'left'
                }
            };
        } else if (isTablet) {
            return {
                display: true,
                position: 'bottom',
                align: 'center',
                maxHeight: 100,
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 10,
                    boxHeight: 10,
                    textAlign: 'center'
                }
            };
        } else {
            return {
                display: true,
                position: 'bottom',
                align: 'center',
                maxHeight: 80,
                labels: {
                    font: {
                        size: 14
                    },
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 12,
                    boxHeight: 12,
                    textAlign: 'center'
                }
            };
        }
    }

    // --- 3. Funções do Gráfico e Painel ---
    function criarGrafico(dados) {
        if (meuGrafico) {
            meuGrafico.destroy();
        }

        const isMobile = window.innerWidth <= 600;
        const isTablet = window.innerWidth > 600 && window.innerWidth <= 1024;

        // Otimização: Ajustar o tamanho do canvas para o tamanho do painel
        meuGraficoCanvas.width = chartPanel.clientWidth;
        meuGraficoCanvas.height = chartPanel.clientHeight;
        
        // Configuração de padding responsivo
        let layoutPadding;
        if (isMobile) {
            layoutPadding = { top: 20, bottom: 140, left: 10, right: 10 };
        } else if (isTablet) {
            layoutPadding = { top: 20, bottom: 120, left: 15, right: 15 };
        } else {
            layoutPadding = { top: 20, bottom: 100, left: 20, right: 20 };
        }

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
                        display: true,
                        content: 'Média: 90 - 109',
                        color: '#34495e',
                        font: {
                            size: isMobile ? 10 : 12,
                            style: 'italic'
                        },
                        position: 'center'
                    },
                    borderDash: [6, 6],
                    borderDashOffset: 0
                }
            }
        } : {};

        // Configuração da legenda responsiva
        const legendConfig = calcularConfigLegenda();

        meuGrafico = new Chart(ctx, {
            type: dados.tipo,
            data: {
                labels: dados.labels,
                datasets: [{
                    label: dados.titulo,
                    data: dados.valores,
                    backgroundColor: dados.cores,
                    borderColor: dados.tipo === 'line' ? dados.cores[0] : 'transparent',
                    borderWidth: 1,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: dados.cores,
                    pointStyle: dados.tipo === 'line' ? 'circle' : 'rect'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: layoutPadding
                },
                plugins: {
                    title: {
                        display: true,
                        text: dados.titulo,
                        font: {
                            size: isMobile ? 16 : 24,
                            weight: 'normal'
                        },
                        padding: {
                            top: 10,
                            bottom: 20
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
                            weight: 'bold',
                            size: isMobile ? 10 : 12
                        },
                        formatter: (value) => value
                    },
                    legend: {
                        ...legendConfig,
                        labels: {
                            ...legendConfig.labels,
                            generateLabels: (chart) => {
                                const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                
                                // Personalizar labels para melhor acomodação
                                labels.forEach((label, index) => {
                                    // Truncar textos muito longos em mobile
                                    if (isMobile && label.text.length > 15) {
                                        label.text = label.text.substring(0, 12) + '...';
                                    } else if (isTablet && label.text.length > 20) {
                                        label.text = label.text.substring(0, 17) + '...';
                                    }
                                });
                                
                                if (dados.titulo === 'Resultados do WISC-IV') {
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
                            if (legendItem.text !== 'Média: 90 - 109' && 
                                legendItem.text !== 'Média: 90-109' && 
                                legendItem.text !== '') {
                                const index = legendItem.index;
                                elementoEmEdicaoIndex = index;
                                contextoEdicao = 'barra';
                                preencherPainel(
                                    estadoAtualDoGrafico.labels[index],
                                    estadoAtualDoGrafico.valores[index],
                                    estadoAtualDoGrafico.cores[index]
                                );
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
                        const titulo = meuGrafico.options.plugins.title;
                        const tituloArea = {
                            top: meuGrafico.chartArea.top,
                            bottom: meuGrafico.chartArea.top + meuGrafico.options.plugins.title.font.size + 10,
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
                    const titulo = chart.options.plugins.title;
                    const tituloArea = {
                        top: chart.chartArea.top,
                        bottom: chart.chartArea.top + chart.options.plugins.title.font.size + 10,
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
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0,
                            font: {
                                size: isMobile ? 8 : 12
                            },
                            padding: isMobile ? 5 : 0,
                            autoSkip: false,
                            // Callback para quebrar os rótulos longos em várias linhas
                            callback: function(value, index, values) {
                                const label = this.getLabelForValue(value);
                                return label.split('\n');
                            }
                        }
                    }
                },
                barPercentage: 0.8 // Adicionado para dar mais espaço entre as barras
            }
        });

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

    function salvarAlteracoes() {
        if (contextoEdicao === 'titulo') {
            estadoAtualDoGrafico.titulo = editLabelInput.value;
        } else {
            if (elementoEmEdicaoIndex === null) return;
            estadoAtualDoGrafico.labels[elementoEmEdicaoIndex] = editLabelInput.value;
            estadoAtualDoGrafico.valores[elementoEmEdicaoIndex] = Number(editValueInput.value);
            estadoAtualDoGrafico.cores[elementoEmEdicaoIndex] = editColorInput.value;

            estadoAtualDoGrafico.tipo = chartTypeSelect.value;
            estadoAtualDoGrafico.yMin = yMinInput.value ? Number(yMinInput.value) : null;
            estadoAtualDoGrafico.yMax = yMaxInput.value ? Number(yMaxInput.value) : null;
            estadoAtualDoGrafico.showDatalabels = showDatalabelsCheckbox.checked;
        }

        criarGrafico(estadoAtualDoGrafico);
    }

    function carregarDados(tipo) {
        if (tipo === testeSelecionado) return; // já está selecionado, não faz nada

        testeSelecionado = tipo;

        if (tipo === 'wisc') {
            estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.wisc));
        } else if (tipo === 'ravlt') {
            estadoAtualDoGrafico = JSON.parse(JSON.stringify(dadosPredefinidos.ravlt));
        }
        contextoEdicao = 'titulo';
        elementoEmEdicaoIndex = null;
        criarGrafico(estadoAtualDoGrafico);
        preencherPainel(estadoAtualDoGrafico.titulo, '', '#000000');
    }

    function exportarGrafico() {
        if (!meuGrafico) return;
        const link = document.createElement('a');
        link.download = `${estadoAtualDoGrafico.titulo.replace(/\s+/g, '_').toLowerCase()}.png`;
        link.href = meuGrafico.toBase64Image();
        link.click();
    }

    // Função para mostrar uma mensagem customizada
    function mostrarMensagem(mensagem) {
        // Remove qualquer mensagem anterior
        const mensagemExistente = document.querySelector('.copy-feedback');
        if (mensagemExistente) {
            mensagemExistente.remove();
        }

        const feedbackDiv = document.createElement('div');
        feedbackDiv.classList.add('copy-feedback');
        feedbackDiv.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i><span>${mensagem}</span>`;
        document.body.appendChild(feedbackDiv);
        
        // Remove a mensagem após a animação
        setTimeout(() => {
            if (feedbackDiv.parentElement) {
                feedbackDiv.remove();
            }
        }, 2000);
    }

    // --- 4. Eventos ---
    // Agora usando o evento 'change' no novo dropdown
    testSelect.addEventListener('change', (event) => carregarDados(event.target.value));

    saveBtn.addEventListener('click', salvarAlteracoes);
    exportBtn.addEventListener('click', exportarGrafico);

    copyPixBtn.addEventListener('click', () => {
        const pixKey = pixKeySpan.textContent.trim();
        
        // Tenta usar a API moderna (promessas)
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pixKey)
                .then(() => mostrarMensagem('Chave PIX copiada!'))
                .catch(err => {
                    console.error('Falha ao copiar:', err);
                    mostrarMensagem('Falha ao copiar a chave.');
                });
        } else {
            // Fallback para navegadores mais antigos (sem suporte a promessas)
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
    mostrarMensagemInicial();

    // Recriar gráfico no resize para responsividade
    window.addEventListener('resize', () => {
        if (estadoAtualDoGrafico && testeSelecionado) {
            criarGrafico(estadoAtualDoGrafico);
        } else {
            // Se nenhum teste estiver selecionado, redesenha a imagem inicial no resize
            mostrarMensagemInicial();
        }
    });

});
