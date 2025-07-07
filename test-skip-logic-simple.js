// Script de prueba simplificado para verificar la lógica de saltos condicionales

const testForm = {
  questions: [
    {
      id: 1,
      question_text: "¿Te gusta el color azul?",
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
      skip_logic: { enabled: false, conditions: [] }
    },
    {
      id: 3,
      question_text: "¿Por qué no te gusta el azul?",
      skip_logic: { enabled: false, conditions: [] }
    },
    {
      id: 4,
      question_text: "¿Recomendarías este formulario?",
      skip_logic: { enabled: false, conditions: [] }
    }
  ]
};

function calculateVisibleQuestions(form, answers) {
  let visible = form.questions.map(q => q.id);

  for (let i = 0; i < form.questions.length; i++) {
    const question = form.questions[i];
    const questionId = question.id;
    
    if (visible.includes(questionId) && question.skip_logic?.enabled && answers[questionId]) {
      const answer = answers[questionId];
      
      const skipCondition = question.skip_logic.conditions.find(condition => {
        const matches = Array.isArray(answer) 
          ? answer.includes(condition.option)
          : answer === condition.option;
        return matches;
      });

      if (skipCondition) {
        if (skipCondition.skip_to_question === 0) {
          visible = visible.filter(id => {
            const qIndex = form.questions.findIndex(q => q.id === id);
            return qIndex <= i;
          });
        } else {
          const targetIndex = skipCondition.skip_to_question - 1;
          
          if (targetIndex >= 0 && targetIndex < form.questions.length) {
            visible = visible.filter(id => {
              const qIndex = form.questions.findIndex(q => q.id === id);
              // Si targetIndex > i, ocultar las preguntas entre i+1 y targetIndex-1
              // Si targetIndex < i, ocultar las preguntas entre targetIndex+1 y i-1
              let shouldKeep;
              if (targetIndex > i) {
                // Saltando hacia adelante: mantener hasta i y desde targetIndex
                shouldKeep = qIndex <= i || qIndex >= targetIndex;
              } else {
                // Saltando hacia atrás: mantener desde targetIndex hasta i
                shouldKeep = qIndex >= targetIndex && qIndex <= i;
              }
              return shouldKeep;
            });
          }
        }
      }
    }
  }

  return visible;
}

// Casos de prueba
console.log('🧪 PRUEBA 1: Sin respuestas');
const test1 = calculateVisibleQuestions(testForm, {});
console.log('Resultado:', test1);
console.log('Esperado: [1, 2, 3, 4] - Todas las preguntas visibles\n');

console.log('🧪 PRUEBA 2: Respuesta "Sí" en pregunta 1');
const test2 = calculateVisibleQuestions(testForm, { 1: "Sí" });
console.log('Resultado:', test2);
console.log('Esperado: [1, 2, 4] - Pregunta 3 oculta\n');

console.log('🧪 PRUEBA 3: Respuesta "No" en pregunta 1');
const test3 = calculateVisibleQuestions(testForm, { 1: "No" });
console.log('Resultado:', test3);
console.log('Esperado: [1, 3, 4] - Pregunta 2 oculta\n');

console.log('🎯 RESUMEN DE PRUEBAS:');
console.log('Test 1:', test1.length === 4 ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 2:', test2.length === 3 && !test2.includes(3) ? '✅ PASÓ' : '❌ FALLÓ');
console.log('Test 3:', test3.length === 3 && !test3.includes(2) ? '✅ PASÓ' : '❌ FALLÓ'); 