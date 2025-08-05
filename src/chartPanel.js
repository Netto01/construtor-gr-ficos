// src/chartPanel.js

// Exporta as funções relacionadas ao painel
export function preencherPainel(contextoEdicao, panelTitle, editLabelInput, editValueInput, editColorInput, labelGroup, valueGroup, colorGroup, optionsGroup, estadoAtualDoGrafico, label, value = '', color = '#000000') {
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

        // Note: Você precisará passar os elementos de personalização para esta função
        // chartTypeSelect, yMinInput, yMaxInput, showDatalabelsCheckbox
        // e acessar o estadoAtualDoGrafico
        // chartTypeSelect.value = estadoAtualDoGrafico.tipo;
        // yMinInput.value = estadoAtualDoGrafico.yMin;
        // yMaxInput.value = estadoAtualDoGrafico.yMax;
        // showDatalabelsCheckbox.checked = estadoAtualDoGrafico.showDatalabels;
    }
}

export function salvarAlteracoes(estadoAtualDoGrafico, contextoEdicao, elementoEmEdicaoIndex, editLabelInput, editValueInput, editColorInput, criarGrafico, chartTypeSelect, yMinInput, yMaxInput, showDatalabelsCheckbox) {
    if (contextoEdicao === 'titulo') {
        estadoAtualDoGrafico.titulo = editLabelInput.value;
    } else {
        if (elementoEmEdicaoIndex === null) return;
        estadoAtualDoGrafico.labels[elementoEmEdicaoIndex] = editLabelInput.value;
        estadoAtualDoGrafico.valores[elementoEmEdicaoIndex] = Number(editValueInput.value);
        estadoAtualDoGrafico.cores[elementoEmEdicaoIndex] = editColorInput.value;

        // Atualiza as opções
        estadoAtualDoGrafico.tipo = chartTypeSelect.value;
        estadoAtualDoGrafico.yMin = yMinInput.value ? Number(yMinInput.value) : null;
        estadoAtualDoGrafico.yMax = yMaxInput.value ? Number(yMaxInput.value) : null;
        estadoAtualDoGrafico.showDatalabels = showDatalabelsCheckbox.checked;
    }
    criarGrafico(estadoAtualDoGrafico);
}