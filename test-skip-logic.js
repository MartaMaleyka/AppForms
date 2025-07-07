// Script de prueba para verificar la lógica de saltos condicionales

const testForm = {
  id: 1,
  title: "Test Mostrar/Ocultar",
  questions: [
    {
      id: 1,
      question_text: "¿Te gusta el color azul?",
      question_type: "radio",
      options: ["Sí", "No"],
      skip_logic: {
        enabled: true,
        conditions: [
          { option: "Sí", skip_to_question: 2 },
          { option: "No", skip_to_question: 3 }
        ]
      }
    },
    {
      id: 2,
      question_text: "¿Cuál es tu tono favorito de azul?",
      question_type: "select",
      options: ["Azul claro", "Azul marino", "Azul cielo", "Azul eléctrico"],
      skip_logic: { enabled: false, conditions: [] }
    },
    {
      id: 3,
      question_text: "¿Por qué no te gusta el azul?",
      question_type: "textarea",
      options: [],
      skip_logic: { enabled: false, conditions: [] }
    },
    {
      id: 4,
      question_text: "¿Recomendarías este formulario?",
      question_type: "radio",
      options: ["Definitivamente sí", "Probablemente sí", "No estoy seguro", "No"],
      skip_logic: { enabled: false, conditions: [] }
    }
  ]
};

function calculateVisibleQuestions(form, answers) {
  console.log('=== INICIO CÁLCULO DE PREGUNTAS VISIBLES ===');
  console.log('Respuestas actuales:', answers);

  // Inicialmente, todas las preguntas son visibles
  let visible = form.questions.map(q => q.id);
  console.log('Preguntas inicialmente visibles:', visible);

  // Aplicar lógica de saltos de manera secuencial
  for (let i = 0; i < form.questions.length; i++) {
    const question = form.questions[i];
    const questionId = question.id;
    
    console.log(`\n--- Evaluando pregunta ${i + 1}: ${question.question_text} ---`);
    console.log('Skip logic:', question.skip_logic);
    console.log('Respuesta actual:', answers[questionId]);
    
    // Solo evaluar si la pregunta actual es visible y tiene skip_logic habilitado
    if (visible.includes(questionId) && question.skip_logic?.enabled && answers[questionId]) {
      const answer = answers[questionId];
      console.log('Respuesta para saltos:', answer);
      
      // Buscar condición que coincida
      const skipCondition = question.skip_logic.conditions.find(condition => {
        const matches = Array.isArray(answer) 
          ? answer.includes(condition.option)
          : answer === condition.option;
        console.log(`Comparando "${answer}" con "${condition.option}": ${matches}`);
        return matches;
      });

      if (skipCondition) {
        console.log('✅ Condición de salto encontrada:', skipCondition);
        
        if (skipCondition.skip_to_question === 0) {
          // Ocultar todas las preguntas después de esta
          const beforeFilter = [...visible];
          visible = visible.filter(id => {
            const qIndex = form.questions.findIndex(q => q.id === id);
            return qIndex <= i;
          });
          console.log('Ocultando todas las preguntas después de la actual');
          console.log('Antes del filtro:', beforeFilter);
          console.log('Después del filtro:', visible);
        } else {
          // Ocultar preguntas entre la actual y la de destino
          const targetIndex = skipCondition.skip_to_question - 1;
          console.log(`🎯 Saltando de pregunta ${i + 1} a pregunta ${targetIndex + 1}`);
          
          if (targetIndex >= 0 && targetIndex < form.questions.length) {
            const beforeFilter = [...visible];
            // Ocultar las preguntas que están entre la actual y la de destino
            visible = visible.filter(id => {
              const qIndex = form.questions.findIndex(q => q.id === id);
              // Mantener la pregunta actual y la de destino, ocultar las del medio
              const shouldKeep = qIndex <= i || qIndex >= targetIndex;
              console.log(`Pregunta ${qIndex + 1} (ID: ${id}): ${shouldKeep ? 'MANTENER' : 'OCULTAR'}`);
              return shouldKeep;
            });
            console.log('Antes del filtro:', beforeFilter);
            console.log('Después del filtro:', visible);
          } else {
            console.log('❌ Índice de destino inválido:', targetIndex);
          }
        }
      } else {
        console.log('❌ No se encontró condición de salto');
      }
    } else {
      console.log('❌ No hay skip_logic habilitado, no hay respuesta, o la pregunta no es visible');
    }
  }

  console.log('\n=== RESULTADO FINAL ===');
  console.log('Preguntas visibles finales:', visible);
  console.log('=== FIN CÁLCULO ===\n');
  return visible;
}

// Casos de prueba
console.log('🧪 PRUEBA 1: Sin respuestas');
const test1 = calculateVisibleQuestions(testForm, {});
console.log('Resultado:', test1);
console.log('✅ Esperado: [1, 2, 3, 4] - Todas las preguntas visibles\n');

console.log('🧪 PRUEBA 2: Respuesta "Sí" en pregunta 1');
const test2 = calculateVisibleQuestions(testForm, { 1: "Sí" });
console.log('Resultado:', test2);
console.log('✅ Esperado: [1, 2, 4] - Pregunta 3 oculta\n');

console.log('🧪 PRUEBA 3: Respuesta "No" en pregunta 1');
const test3 = calculateVisibleQuestions(testForm, { 1: "No" });
console.log('Resultado:', test3);
console.log('✅ Esperado: [1, 3, 4] - Pregunta 2 oculta\n');

console.log('🧪 PRUEBA 4: Respuesta "Sí" en pregunta 1 y "Azul marino" en pregunta 2');
const test4 = calculateVisibleQuestions(testForm, { 1: "Sí", 2: "Azul marino" });
console.log('Resultado:', test4);
console.log('✅ Esperado: [1, 2, 4] - Pregunta 3 oculta\n');

console.log('🧪 PRUEBA 5: Respuesta "No" en pregunta 1 y texto en pregunta 3');
const test5 = calculateVisibleQuestions(testForm, { 1: "No", 3: "No me gusta el azul" });
console.log('Resultado:', test5);
console.log('✅ Esperado: [1, 3, 4] - Pregunta 2 oculta\n');

console.log('🎯 RESUMEN DE PRUEBAS:');
console.log('Test 1:', test1.length === 4 ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 2:', test2.length === 3 && !test2.includes(3) ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 3:', test3.length === 3 && !test3.includes(2) ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 4:', test4.length === 3 && !test4.includes(3) ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 5:', test5.length === 3 && !test5.includes(2) ? '✅ PASÓ' : '❌ FALLÓ'); 