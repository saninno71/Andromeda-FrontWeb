export function primerDiaMesActual() {

    const hoy = new Date();

    return new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        1
    );

}
