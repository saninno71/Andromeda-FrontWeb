import { lazy } from "react";

const pages = import.meta.glob("../../modulos/**/*.jsx");
const pageAliases = {
    asientos:"../../modulos/asientos/ctbAsientosBQD.jsx"
};

export function getLazyPage(route) {

    const path =
        pageAliases[route] ||
        `../../modulos/${route}/${route}.jsx`;

    const importer = pages[path];

    if (!importer) {
        console.error(`Página no encontrada: ${path}`);
        return null;
    }

    return lazy(importer);
}
