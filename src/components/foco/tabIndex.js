export function crearTabIndexOrdenado(campos,inicio = 1) {

    return campos.reduce((tabIndexPorCampo,campo,indice) => ({
        ...tabIndexPorCampo,
        [campo]:inicio + indice
    }),{});

}

export function crearTabIndexConEntrada(campos) {

    return {
        entrada:1,
        controles:crearTabIndexOrdenado(campos,2)
    };

}

export function enfocarControl(refControl) {

    window.setTimeout(() => {
        refControl.current?.focus?.();
    },0);

}

export const ESTILO_ENTRADA_FOCO = {
    position:"fixed",
    width:"1px",
    height:"1px",
    opacity:0,
    pointerEvents:"none"
};
