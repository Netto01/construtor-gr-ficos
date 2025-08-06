export function desenharImagemArredondada(ctx, img, x, y, width, height, radius) {
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

// Função para exibir a imagem inicial na tela do gráfico
export function mostrarMensagemInicial(ctx, meuGraficoCanvas, chartPanel, exportBtn, imagemPato) {
    meuGraficoCanvas.width = chartPanel.clientWidth;
    meuGraficoCanvas.height = chartPanel.clientHeight;
    
    ctx.clearRect(0, 0, meuGraficoCanvas.width, meuGraficoCanvas.height);
    
    const patoImagem = new Image();
    patoImagem.src = imagemPato;
    patoImagem.onload = () => {
        const imgWidth = 400;
        const imgHeight = 400;
        const imgX = (meuGraficoCanvas.width - imgWidth) / 2;
        const imgY = (meuGraficoCanvas.height - imgHeight) / 2;
        const radius = 20;
        desenharImagemArredondada(ctx, patoImagem, imgX, imgY, imgWidth, imgHeight, radius);
    };
    patoImagem.onerror = () => {
        ctx.font = '24px Inter';
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Selecione um teste no menu lateral para começar.', meuGraficoCanvas.width / 2, meuGraficoCanvas.height / 2);
    };
    exportBtn.classList.add('hidden');
}

// Função para calcular configurações responsivas da legenda
export function calcularConfigLegenda() {
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
                font: { size: 10 },
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
                font: { size: 12 },
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
                font: { size: 14 },
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

// Função para mostrar mensagem de feedback
export function mostrarMensagem(mensagem) {
    const mensagemExistente = document.querySelector('.copy-feedback');
    if (mensagemExistente) {
        mensagemExistente.remove();
    }

    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('copy-feedback');
    feedbackDiv.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i><span>${mensagem}</span>`;
    document.body.appendChild(feedbackDiv);
    
    setTimeout(() => {
        if (feedbackDiv.parentElement) {
            feedbackDiv.remove();
        }
    }, 2000);
}