import modalPruebaDatos from "./modalPruebaDatos.json";

const cuentasIniciales = [
    {
        cuentaID:1,
        codigo:"1.1.1.01.01",
        nombre:"Caja administracion",
        tipo:"Activo",
        naturaleza:"Deudora",
        imputable:true,
        orden:10,
        saldoInicial:12500.50
    },
    {
        cuentaID:2,
        codigo:"1.1.1.02.02",
        nombre:"Banco de Galicia y Bs. As.",
        tipo:"Activo",
        naturaleza:"Deudora",
        imputable:true,
        orden:20,
        saldoInicial:48000
    },
    {
        cuentaID:3,
        codigo:"1.1.2.01.01",
        nombre:"Deudores por ventas",
        tipo:"Activo",
        naturaleza:"Deudora",
        imputable:true,
        orden:30,
        saldoInicial:0
    },
    {
        cuentaID:4,
        codigo:"2.1.2.01.01",
        nombre:"Acreedores varios",
        tipo:"Pasivo",
        naturaleza:"Acreedora",
        imputable:true,
        orden:40,
        saldoInicial:0
    },
    {
        cuentaID:5,
        codigo:"4.2.1.03.15",
        nombre:"Seguros",
        tipo:"Resultado",
        naturaleza:"Deudora",
        imputable:true,
        orden:50,
        saldoInicial:3200
    }
];

export async function cargarPlanDeCuentas() {

    return cuentasIniciales.map(cuenta => ({
        ...cuenta
    }));

}

export async function cargarDatosModalPrueba() {

    return modalPruebaDatos.map(fila => ({
        ...fila
    }));

}
