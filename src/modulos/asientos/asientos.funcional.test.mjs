import assert from 'node:assert/strict';
import {crearAsientosFuncional} from './asientos.funcional.js';
const rows = Array.from({length:7},(_,i)=>({comprobanteID:i,monedaCodigo:'ARS',numero:i}));
let children=0;
const model=crearAsientosFuncional({
 cargarPagina:async (_, {top,skip})=>({items:rows.slice(skip,skip+top),total:7}),
 configuracion:{tamanoPrimeraPagina:2,tamanoPagina:2,topeRegistros:4,pausaEntrePaginas:0},
 hijos:{masFiltros:async()=>{children++;return {catalogo:['uno']};}}
});
model.actualizarFiltro('detalle','inicial');
const unopened=await model.prepararDatosInforme();
assert.equal(unopened.filas.length,7);
assert.equal(unopened.hijos.masFiltros.catalogo[0],'uno');
assert.equal(model.obtenerEstado().consulta.consultaEjecutada,false);
await model.consultar();
assert.equal(model.obtenerEstado().consulta.dataGrid.length,4);
model.actualizarFiltro('detalle','pendiente');
model.actualizarFilaLocal({filaOriginal:rows[0],filaNueva:{...rows[0],numero:99},keyFila:'0',cambios:[{campo:'numero'}]});
model.actualizarEdicion({borrador:{numero:123}});
const report=await model.prepararDatosInforme();
assert.equal(report.filtrosActuales.detalle,'pendiente');
assert.equal(report.filtrosAplicados.detalle,'inicial');
assert.equal(report.filas.length,7);
assert.equal(report.filas[0].numero,99);
assert.equal(report.edicionPendiente.borrador.numero,123);
assert.equal(report.completa,true);
assert.equal(children,2);
report.filtrosActuales.detalle='mutado';
assert.equal(model.obtenerEstado().filtros.detalle,'pendiente');
assert.equal((await model.prepararDatosInforme({todosLosRegistros:false})).completa,false);
let attempt=0;
model.registrarHijo('otro',async()=>{if (++attempt===1) throw Error('fallo hijo');return {ok:true};});
await assert.rejects(()=>model.prepararDatosInforme(),/fallo hijo/);
assert.equal((await model.prepararDatosInforme()).hijos.otro.ok,true);
const failed=crearAsientosFuncional({cargarPagina:async()=>{throw Error('API caída');}});
await failed.consultar();
await assert.rejects(()=>failed.prepararDatosInforme(),/API caída/);
let release;
const pending=new Promise(resolve=>release=resolve);
const racing=crearAsientosFuncional({cargarPagina:async (f)=>{
 if(f.detalle==='vieja') await pending;
 return {items:[{numero:f.detalle}],total:1};
}});
racing.actualizarFiltro('detalle','vieja');const first=racing.consultar();
racing.actualizarFiltro('detalle','nueva');await racing.consultar();release();await first;
assert.equal(racing.obtenerEstado().consulta.dataGrid[0].numero,'nueva');
assert.equal((await racing.prepararDatosInforme()).filas[0].numero,'nueva');
console.log('OK: informes sin montar, paginación completa, filtros actuales/aplicados, ediciones, aislamiento, errores y consultas concurrentes');
