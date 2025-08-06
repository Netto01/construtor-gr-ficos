// src/chartPanel.js

// Exporta as funções relacionadas ao painel
export function preencherPainel(
    contextoEdicao,
    panelTitle,
    editLabelInput,
    editValueInput,
    editColorInput,
    labelGroup,
    valueGroup,
    colorGroup,
    optionsGroup,
    estadoAtualDoGrafico,
    label,
    value = '',
    color = '#000000',
    chartTypeSelect,
    yMinInput,
    yMaxInput,
    showDatalabelsCheckbox
) {
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

        // Atualiza os campos de personalização do gráfico
        if (chartTypeSelect) chartTypeSelect.value = estadoAtualDoGrafico.tipo;
        if (yMinInput) yMinInput.value = estadoAtualDoGrafico.yMin;
        if (yMaxInput) yMaxInput.value = estadoAtualDoGrafico.yMax;
        if (showDatalabelsCheckbox) showDatalabelsCheckbox.checked = estadoAtualDoGrafico.showDatalabels;
    }
}

export function salvarAlteracoes(
    estadoAtualDoGrafico,
    contextoEdicao,
    elementoEmEdicaoIndex,
    editLabelInput,
    editValueInput,
    editColorInput,
    criarGrafico,
    chartTypeSelect,
    yMinInput,
    yMaxInput,
    showDatalabelsCheckbox
) {
    if (contextoEdicao === 'titulo') {
        estadoAtualDoGrafico.titulo = editLabelInput.value;
    } else {
        if (elementoEmEdicaoIndex === null) return;
        estadoAtualDoGrafico.labels[elementoEmEdicaoIndex] = editLabelInput.value;
        estadoAtualDoGrafico.valores[elementoEmEdicaoIndex] = Number(editValueInput.value);
        estadoAtualDoGrafico.cores[elementoEmEdicaoIndex] = editColorInput.value;

        // Atualiza as opções
        if (chartTypeSelect) estadoAtualDoGrafico.tipo = chartTypeSelect.value;
        if (yMinInput) estadoAtualDoGrafico.yMin = yMinInput.value ? Number(yMinInput.value) : null;
        if (yMaxInput) estadoAtualDoGrafico.yMax = yMaxInput.value ? Number(yMaxInput.value) : null;
        if (showDatalabelsCheckbox) estadoAtualDoGrafico.showDatalabels = showDatalabelsCheckbox.checked;
    }
    criarGrafico(estadoAtualDoGrafico);
}