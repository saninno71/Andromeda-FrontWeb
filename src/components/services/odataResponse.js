export function obtenerItemsOData(data) {

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.items)) {
        return data.items;
    }

    if (Array.isArray(data?.value)) {
        return data.value;
    }

    return [];

}

export function obtenerTotalOData(data) {

    const total =
        data?.count ??
        data?.Count ??
        data?.["@odata.count"] ??
        data?.total ??
        data?.totalCount ??
        data?.TotalCount;

    const totalNumero = Number(total);

    return Number.isFinite(totalNumero)
        ? totalNumero
        : null;

}
