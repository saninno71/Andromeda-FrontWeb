import { lazy } from "react";

const pages = import.meta.glob("../../modulos/**/*.jsx");

export function getLazyPage(route) {

    const path = `../../modulos/${route}/${route}.jsx`;

    const importer = pages[path];

    if (!importer) {
        console.error(`Página no encontrada: ${path}`);
        return null;
    }

    return lazy(importer);
}