// Script de prueba para el sistema de interacción fluida
console.log('🧪 Probando sistema de interacción fluida...\n');

// Simular entorno de desarrollo
process.env.NODE_ENV = 'development';

// Importar el sistema (simulado para pruebas)
const mockFluidInteraction = {
  isReady: () => true,
  getConfig: () => ({
    autoMigration: true,
    performanceTracking: true,
    cssInjection: true,
    debugMode: true
  })
};

// Simular funciones del sistema
function bindFluidClick(element, action, options = {}) {
  const {
    immediateFeedback = true,
    deferAction = true,
    preventDefault = false
  } = options;

  console.log(`🔗 Vinculando elemento: ${element.tagName || 'Unknown'}`);
  console.log(`   - Feedback inmediato: ${immediateFeedback}`);
  console.log(`   - Acción diferida: ${deferAction}`);
  console.log(`   - Prevent default: ${preventDefault}`);

  // Simular feedback inmediato
  if (immediateFeedback) {
    element.classList.add('pressed');
    element.style.transform = 'scale(0.98)';
    element.style.filter = 'brightness(0.96)';
  }

  // Simular acción diferida
  if (deferAction) {
    setTimeout(() => {
      action(new Event('click'));
      // Limpiar estado visual
      element.classList.remove('pressed');
      element.style.transform = '';
      element.style.filter = '';
    }, 100);
  } else {
    action(new Event('click'));
  }

  return () => {
    console.log(`🧹 Limpieza para elemento: ${element.tagName || 'Unknown'}`);
    element.classList.remove('pressed');
    element.style.transform = '';
    element.style.filter = '';
  };
}

function deferHeavyWork(fn, timeout = 300) {
  console.log(`⏳ Diferiendo trabajo pesado (timeout: ${timeout}ms)`);
  
  // Simular requestIdleCallback
  setTimeout(() => {
    console.log('🚀 Ejecutando trabajo pesado...');
    fn();
    console.log('✅ Trabajo pesado completado');
  }, 50);
}

function markInput(name = 'input') {
  const t0 = performance.now();
  console.log(`📊 Marcando input: ${name}`);
  
  // Simular medición de rendimiento
  setTimeout(() => {
    const dt = performance.now() - t0;
    console.log(`   ⏱️ Input delay: ${dt.toFixed(2)}ms`);
    
    if (dt > 16) {
      console.warn(`   ⚠️ Input delay alto detectado: ${dt.toFixed(2)}ms`);
    } else {
      console.log(`   ✅ Input delay óptimo: ${dt.toFixed(2)}ms`);
    }
  }, 10);
}

// Crear elementos de prueba
function createTestElements() {
  console.log('\n🎨 Creando elementos de prueba...');
  
  const container = document.createElement('div');
  container.id = 'test-container';
  container.style.cssText = `
    padding: 20px;
    border: 2px solid #ccc;
    border-radius: 8px;
    margin: 20px;
    font-family: Arial, sans-serif;
  `;
  
  // Título
  const title = document.createElement('h2');
  title.textContent = '🧪 Pruebas de Interacción Fluida';
  title.style.color = '#333';
  container.appendChild(title);
  
  // Botón básico
  const basicBtn = document.createElement('button');
  basicBtn.textContent = 'Botón Básico';
  basicBtn.className = 'btn btn-primary';
  basicBtn.style.cssText = `
    padding: 10px 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    background: #007acc;
    color: white;
    cursor: pointer;
    font-size: 16px;
  `;
  container.appendChild(basicBtn);
  
  // Botón de acción pesada
  const heavyBtn = document.createElement('button');
  heavyBtn.textContent = 'Acción Pesada';
  heavyBtn.className = 'btn btn-heavy';
  heavyBtn.style.cssText = `
    padding: 10px 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    background: #ff6b6b;
    color: white;
    cursor: pointer;
    font-size: 16px;
  `;
  container.appendChild(heavyBtn);
  
  // Tarjeta de héroe simulada
  const heroCard = document.createElement('div');
  heroCard.className = 'hero-card';
  heroCard.textContent = '🦸 Héroe de Prueba';
  heroCard.style.cssText = `
    padding: 15px;
    margin: 10px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    text-align: center;
    font-weight: bold;
  `;
  container.appendChild(heroCard);
  
  // Botón de migración
  const migrateBtn = document.createElement('button');
  migrateBtn.textContent = '🔄 Migrar Elementos';
  migrateBtn.style.cssText = `
    padding: 10px 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    background: #28a745;
    color: white;
    cursor: pointer;
    font-size: 16px;
  `;
  container.appendChild(migrateBtn);
  
  // Botón de estadísticas
  const statsBtn = document.createElement('button');
  statsBtn.textContent = '📊 Ver Estadísticas';
  statsBtn.style.cssText = `
    padding: 10px 20px;
    margin: 10px;
    border: none;
    border-radius: 4px;
    background: #6f42c1;
    color: white;
    cursor: pointer;
    font-size: 16px;
  `;
  container.appendChild(statsBtn);
  
  // Área de resultados
  const resultsArea = document.createElement('div');
  resultsArea.id = 'test-results';
  resultsArea.style.cssText = `
    margin-top: 20px;
    padding: 15px;
    background: #f1f3f4;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    white-space: pre-wrap;
  `;
  container.appendChild(resultsArea);
  
  return container;
}

// Función para mostrar resultados
function showResult(message) {
  const resultsArea = document.getElementById('test-results');
  if (resultsArea) {
    resultsArea.textContent += message + '\n';
  }
  console.log(message);
}

// Configurar eventos de prueba
function setupTestEvents(container) {
  console.log('\n🔧 Configurando eventos de prueba...');
  
  const basicBtn = container.querySelector('.btn-primary');
  const heavyBtn = container.querySelector('.btn-heavy');
  const heroCard = container.querySelector('.hero-card');
  const migrateBtn = container.querySelector('button:nth-child(4)');
  const statsBtn = container.querySelector('button:nth-child(5)');
  
  // Botón básico
  bindFluidClick(basicBtn, () => {
    markInput('basic-button');
    showResult('✅ Botón básico clickeado - Feedback inmediato aplicado');
  });
  
  // Botón de acción pesada
  bindFluidClick(heavyBtn, () => {
    markInput('heavy-button');
    showResult('⏳ Iniciando acción pesada...');
    
    deferHeavyWork(() => {
      showResult('🚀 Trabajo pesado completado después de 50ms');
    });
  });
  
  // Tarjeta de héroe
  bindFluidClick(heroCard, () => {
    markInput('hero-card');
    showResult('🦸 Tarjeta de héroe clickeada - Feedback visual aplicado');
  });
  
  // Botón de migración
  migrateBtn.onclick = () => {
    markInput('migrate-button');
    showResult('🔄 Simulando migración de elementos...');
    
    // Simular migración
    const elements = container.querySelectorAll('.btn, .hero-card');
    elements.forEach(el => {
      el.setAttribute('data-fluid-migrated', 'true');
      el.classList.add('interactive-element');
    });
    
    showResult(`✅ ${elements.length} elementos migrados`);
  };
  
  // Botón de estadísticas
  statsBtn.onclick = () => {
    markInput('stats-button');
    showResult('📊 Estadísticas del sistema:');
    showResult(`   - Sistema listo: ${mockFluidInteraction.isReady()}`);
    showResult(`   - Configuración: ${JSON.stringify(mockFluidInteraction.getConfig(), null, 2)}`);
    showResult(`   - Elementos migrados: ${container.querySelectorAll('[data-fluid-migrated]').length}`);
  };
  
  console.log('✅ Eventos de prueba configurados');
}

// Función principal de prueba
function runTests() {
  console.log('\n🚀 Ejecutando pruebas del sistema...');
  
  // Crear elementos de prueba
  const testContainer = createTestElements();
  document.body.appendChild(testContainer);
  
  // Configurar eventos
  setupTestEvents(testContainer);
  
  // Verificar sistema
  console.log('\n🔍 Verificando sistema...');
  console.log(`✅ Sistema listo: ${mockFluidInteraction.isReady()}`);
  console.log(`⚙️ Configuración:`, mockFluidInteraction.getConfig());
  
  // Mostrar instrucciones
  showResult('🎯 INSTRUCCIONES DE PRUEBA:');
  showResult('1. Haz clic en "Botón Básico" para ver feedback inmediato');
  showResult('2. Haz clic en "Acción Pesada" para ver trabajo diferido');
  showResult('3. Haz clic en "Héroe de Prueba" para ver interacción de tarjeta');
  showResult('4. Haz clic en "Migrar Elementos" para simular migración');
  showResult('5. Haz clic en "Ver Estadísticas" para ver estado del sistema');
  
  console.log('\n🎉 Pruebas del sistema configuradas correctamente');
  console.log('💡 Haz clic en los botones para probar la funcionalidad');
}

// Ejecutar pruebas cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTests);
} else {
  runTests();
}

// Exponer funciones para debugging
if (typeof window !== 'undefined') {
  window.__testFluidInteraction = {
    bindFluidClick,
    deferHeavyWork,
    markInput,
    runTests
  };
}
