// ============================================
// EDITOR DE IMÁGENES CON ÁLGEBRA MATRICIAL
// ============================================
// Nombre del estudiante: Noe Euan Herrera 
// Fecha: 18/11/2925
// Grupo: 1C 

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Importar funciones auxiliares (puedes usarlas)
const {
  crearMatrizVacia,
  validarMatriz,
  obtenerDimensiones,
  limitarValorColor,
  crearPixel,
  copiarMatriz,
  asegurarDirectorio
} = require('./utilidades');

// Importar operaciones matriciales (puedes usarlas)
const {
  sumarMatrices,
  restarMatrices,
  multiplicarPorEscalar,
  multiplicarMatrices,
  transponerMatriz
} = require('./matriz');

// ============================================
// SECCIÓN 1: FUNDAMENTOS (20 puntos)
// Conversión entre imágenes y matrices
// ============================================

function imagenAMatriz(rutaImagen) {
  if (!fs.existsSync(rutaImagen)) {
    throw new Error(`Archivo no encontrado: ${rutaImagen}`);
  }
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);
  const width = png.width;
  const height = png.height;
  const matriz = [];

  for (let y = 0; y < height; y++) {
    const fila = [];
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      fila.push({ r, g, b, a });
    }
    matriz.push(fila);
  }
  return matriz;
}

function matrizAImagen(matriz, rutaSalida) {
  if (typeof validarMatriz === 'function') validarMatriz(matriz);
  const dims = obtenerDimensiones(matriz);
  const filas = dims.filas;
  const columnas = dims.columnas;

  const png = new PNG({ width: columnas, height: filas });
  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {
      const idx = (columnas * y + x) * 4;
      const px = matriz[y][x];
      png.data[idx] = limitarValorColor(px.r);
      png.data[idx + 1] = limitarValorColor(px.g);
      png.data[idx + 2] = limitarValorColor(px.b);
      png.data[idx + 3] = limitarValorColor(px.a);
    }
  }

  if (typeof asegurarDirectorio === 'function') {
    asegurarDirectorio(path.dirname(rutaSalida));
  } else {
    const dir = path.dirname(rutaSalida);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(rutaSalida, buffer);
}

/**
 * Obtener canal: devuelve matriz en escala de grises
 * usando solo el canal seleccionado (r,g o b)
 */
function obtenerCanal(matriz, canal) {
  if (!['r', 'g', 'b'].includes(canal)) {
    throw new Error("El canal debe ser 'r', 'g' o 'b'");
  }
  const resultado = typeof copiarMatriz === 'function'
    ? copiarMatriz(matriz)
    : matriz.map(row => row.map(p => ({ ...p })));

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      const val = matriz[i][j][canal];
      const v = limitarValorColor(Math.round(val));
      resultado[i][j] = typeof crearPixel === 'function'
        ? crearPixel(v, v, v, matriz[i][j].a)
        : { r: v, g: v, b: v, a: matriz[i][j].a };
    }
  }
  return resultado;
}

function obtenerDimensionesImagen(rutaImagen) {
  if (!fs.existsSync(rutaImagen)) {
    throw new Error(`Archivo no encontrado: ${rutaImagen}`);
  }
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);
  const ancho = png.width;
  const alto = png.height;
  return { ancho, alto, totalPixeles: ancho * alto };
}

// ============================================
// SECCIÓN 2: OPERACIONES BÁSICAS (25 puntos)
// Aplicar álgebra matricial a píxeles
// ============================================

function ajustarBrillo(matriz, factor) {
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(matriz.length, matriz[0] ? matriz[0].length : 0)
    : matriz.map(row => row.map(() => null));

  for (let i = 0; i < matriz.length; i++) {
    const row = matriz[i];
    for (let j = 0; j < row.length; j++) {
      const orig = matriz[i][j];
      const r = limitarValorColor(Math.round(orig.r * factor));
      const g = limitarValorColor(Math.round(orig.g * factor));
      const b = limitarValorColor(Math.round(orig.b * factor));
      const a = orig.a;
      resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(r, g, b, a) : { r, g, b, a };
    }
  }
  return resultado;
}

function invertirColores(matriz) {
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(matriz.length, matriz[0] ? matriz[0].length : 0)
    : matriz.map(row => row.map(() => null));

  for (let i = 0; i < matriz.length; i++) {
    for (let j = 0; j < matriz[i].length; j++) {
      const p = matriz[i][j];
      const r = limitarValorColor(255 - p.r);
      const g = limitarValorColor(255 - p.g);
      const b = limitarValorColor(255 - p.b);
      const a = p.a;
      resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(r, g, b, a) : { r, g, b, a };
    }
  }
  return resultado;
}

function convertirEscalaGrises(matriz) {
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(matriz.length, matriz[0] ? matriz[0].length : 0)
    : matriz.map(row => row.map(() => null));

  for (let i = 0; i < matriz.length; i++) {
    for (let j = 0; j < matriz[i].length; j++) {
      const p = matriz[i][j];
      const grisFloat = 0.299 * p.r + 0.587 * p.g + 0.114 * p.b;
      const gris = limitarValorColor(Math.round(grisFloat));
      resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(gris, gris, gris, p.a) : { r: gris, g: gris, b: gris, a: p.a };
    }
  }
  return resultado;
}

// ============================================
// SECCIÓN 3: TRANSFORMACIONES GEOMÉTRICAS (30 puntos)
// Aplicar operaciones matriciales para transformar
// ============================================

function voltearHorizontal(matriz) {
  const copia = typeof copiarMatriz === 'function'
    ? copiarMatriz(matriz)
    : matriz.map(row => row.map(p => ({ ...p })));
  for (let i = 0; i < copia.length; i++) {
    copia[i] = copia[i].slice().reverse();
  }
  return copia;
}

function voltearVertical(matriz) {
  const copia = typeof copiarMatriz === 'function'
    ? copiarMatriz(matriz)
    : matriz.map(row => row.map(p => ({ ...p })));
  return copia.slice().reverse();
}

function rotar90Grados(matriz) {
  const filas = matriz.length;
  if (filas === 0) return [];
  const columnas = matriz[0].length;
  const nueva = Array.from({ length: columnas }, () => new Array(filas));
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const orig = matriz[i][j];
      const r = orig.r, g = orig.g, b = orig.b, a = orig.a;
      nueva[j][filas - 1 - i] = typeof crearPixel === 'function' ? crearPixel(r, g, b, a) : { r, g, b, a };
    }
  }
  return nueva;
}

// ============================================
// SECCIÓN 4: FILTROS AVANZADOS (25 puntos)
// Operaciones más complejas
// ============================================

function mezclarImagenes(matriz1, matriz2, factor) {
  const d1 = obtenerDimensiones(matriz1);
  const d2 = obtenerDimensiones(matriz2);
  if (!d1 || !d2 || d1.filas !== d2.filas || d1.columnas !== d2.columnas) {
    throw new Error('Las imágenes deben tener el mismo tamaño');
  }
  const filas = d1.filas;
  const columnas = d1.columnas;
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(filas, columnas)
    : Array.from({ length: filas }, () => new Array(columnas));

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const p1 = matriz1[i][j];
      const p2 = matriz2[i][j];
      const r = limitarValorColor(Math.round(p1.r * (1 - factor) + p2.r * factor));
      const g = limitarValorColor(Math.round(p1.g * (1 - factor) + p2.g * factor));
      const b = limitarValorColor(Math.round(p1.b * (1 - factor) + p2.b * factor));
      const a = limitarValorColor(Math.round(p1.a * (1 - factor) + p2.a * factor));
      resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(r, g, b, a) : { r, g, b, a };
    }
  }
  return resultado;
}

function aplicarSepia(matriz) {
  const dims = obtenerDimensiones(matriz);
  const filas = dims.filas;
  const columnas = dims.columnas;
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(filas, columnas)
    : Array.from({ length: filas }, () => new Array(columnas));

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const p = matriz[i][j];
      const rn = 0.393 * p.r + 0.769 * p.g + 0.189 * p.b;
      const gn = 0.349 * p.r + 0.686 * p.g + 0.168 * p.b;
      const bn = 0.272 * p.r + 0.534 * p.g + 0.131 * p.b;
      const r = limitarValorColor(Math.round(rn));
      const g = limitarValorColor(Math.round(gn));
      const b = limitarValorColor(Math.round(bn));
      resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(r, g, b, p.a) : { r, g, b, a: p.a };
    }
  }
  return resultado;
}

function detectarBordes(matriz, umbral = 50) {
  const filas = matriz.length;
  if (filas === 0) return [];
  const columnas = matriz[0].length;

  const grisMat = convertirEscalaGrises(matriz);
  const resultado = typeof crearMatrizVacia === 'function'
    ? crearMatrizVacia(filas, columnas)
    : Array.from({ length: filas }, () => new Array(columnas));

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const actual = grisMat[i][j];
      const actualVal = actual.r;
      let esBorde = false;

      if (j + 1 < columnas) {
        const derecho = grisMat[i][j + 1];
        if (Math.abs(actualVal - derecho.r) > umbral) esBorde = true;
      }
      if (i + 1 < filas) {
        const abajo = grisMat[i + 1][j];
        if (Math.abs(actualVal - abajo.r) > umbral) esBorde = true;
      }

      if (esBorde) {
        resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(255, 255, 255, 255) : { r: 255, g: 255, b: 255, a: 255 };
      } else {
        resultado[i][j] = typeof crearPixel === 'function' ? crearPixel(0, 0, 0, 255) : { r: 0, g: 0, b: 0, a: 255 };
      }
    }
  }
  return resultado;
}

// ============================================
// NO MODIFICAR - Exportación de funciones
// ============================================
module.exports = {
  // Sección 1: Fundamentos
  imagenAMatriz,
  matrizAImagen,
  obtenerCanal,
  obtenerDimensionesImagen,
  
  // Sección 2: Operaciones Básicas
  ajustarBrillo,
  invertirColores,
  convertirEscalaGrises,
  
  // Sección 3: Transformaciones
  voltearHorizontal,
  voltearVertical,
  rotar90Grados,
  
  // Sección 4: Filtros Avanzados
  mezclarImagenes,
  aplicarSepia,
  detectarBordes
};
