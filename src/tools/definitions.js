// tools/definitions.js — описания функций (tools) в формате OpenAI function calling.
// Именно этот список отправляется модели вместе с запросом, и модель сама решает,
// какую функцию вызвать и с какими аргументами, исходя из сообщения пользователя.
//
// Формат полей подобран так, чтобы совпадать со структурой данных, которая уже
// используется в App.jsx (notes, checklists, workouts, events, quizzes) —
// это позволяет напрямую сохранять результат в state без доп. преобразований.

export const toolDefinitions = [
  // ---------- ЗАМЕТКИ ----------
  {
    type: "function",
    function: {
      name: "create_note",
      description:
        "Создаёт новую заметку во вкладке «Заметки». Используй, когда пользователь просит сохранить информацию, записать что-то, оформить найденные данные в заметку.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Заголовок заметки" },
          text: { type: "string", description: "Текст содержимого заметки" },
          categoryId: {
            type: "number",
            description: "ID категории (1 — Учёба, 2 — Работа, 3 — Личное). Если не уверен — не указывай.",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Список тегов для заметки",
          },
        },
        required: ["title", "text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_note",
      description: "Изменяет существующую заметку по её id (например, дописывает текст или меняет заголовок).",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID заметки, которую нужно изменить" },
          title: { type: "string" },
          text: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_notes",
      description: "Ищет заметки пользователя по тексту или тегу. Используй перед тем как что-то дописать в заметку или сослаться на неё.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Поисковый запрос" },
        },
        required: ["query"],
      },
    },
  },

  // ---------- ЧЕК-ЛИСТЫ ----------
  {
    type: "function",
    function: {
      name: "create_checklist",
      description:
        "Создаёт новый чек-лист во вкладке «Чек-листы». Используй для списков задач, покупок, привычек.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          type: { type: "string", enum: ["once", "habit"], description: "once — разовый список, habit — повторяющаяся привычка" },
          icon: { type: "string", description: "Эмодзи-иконка чек-листа" },
          items: {
            type: "array",
            items: { type: "string" },
            description: "Список пунктов чек-листа (просто текст каждого пункта)",
          },
        },
        required: ["title", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_checklist_item",
      description: "Добавляет один или несколько пунктов в уже существующий чек-лист.",
      parameters: {
        type: "object",
        properties: {
          checklistId: { type: "string" },
          items: { type: "array", items: { type: "string" } },
        },
        required: ["checklistId", "items"],
      },
    },
  },

  // ---------- КАЛЕНДАРЬ ----------
  {
    type: "function",
    function: {
      name: "create_event",
      description:
        "Создаёт событие в календаре. Используй, когда пользователь просит добавить встречу, смену, напоминание на конкретную дату/время. Даты передавай в формате ISO 8601 (например 2026-07-10T09:00:00).",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Название события" },
          startTime: { type: "string", description: "Дата и время начала в формате ISO 8601" },
          endTime: { type: "string", description: "Дата и время окончания в формате ISO 8601 (необязательно)" },
          type: {
            type: "string",
            enum: ["personal", "work", "study", "health"],
            description: "Категория события",
          },
          location: { type: "string" },
          repeat: {
            type: "string",
            enum: ["none", "daily", "weekly", "monthly"],
            description: "Повторение события. Например 'смена сутки через двое' лучше уточнить у пользователя или создать несколько отдельных событий.",
          },
          note: { type: "string", description: "Дополнительная заметка к событию" },
        },
        required: ["title", "startTime"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_recurring_shift_events",
      description:
        "Создаёт серию событий по графику 'сутки через N' (например сутки/трое, сутки/двое). Генерирует отдельные события на каждую рабочую дату в заданном диапазоне.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Название смены, например 'Смена'" },
          firstDate: { type: "string", description: "Дата первой смены в формате YYYY-MM-DD" },
          shiftLengthHours: { type: "number", description: "Длительность смены в часах, обычно 24" },
          cycleDays: { type: "number", description: "Через сколько дней повторяется смена (2 = сутки через двое значит цикл 3 дня; уточни у пользо��ателя точную формулировку)" },
          repeatCount: { type: "number", description: "Сколько смен сгенерировать вперёд" },
        },
        required: ["title", "firstDate", "shiftLengthHours", "cycleDays", "repeatCount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_events",
      description: "Возвращает события календаря в заданном диапазоне дат.",
      parameters: {
        type: "object",
        properties: {
          from: { type: "string", description: "Начало диапазона YYYY-MM-DD" },
          to: { type: "string", description: "Конец диапазона YYYY-MM-DD" },
        },
        required: ["from", "to"],
      },
    },
  },

  // ---------- СПОРТ ----------
  {
    type: "function",
    function: {
      name: "create_workout",
      description: "Записывает тренировку во вкладку «Спорт».",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["run", "strength", "yoga", "swim", "bike", "walk"],
            description: "Тип тренировки",
          },
          title: { type: "string" },
          startTime: { type: "string", description: "Дата и время тренировки в формате ISO 8601" },
          durationMin: { type: "number", description: "Длительность в минутах" },
          distanceKm: { type: "number", description: "Дистанция в км (для бега/плавания/велосипеда/ходьбы)" },
          note: { type: "string" },
        },
        required: ["type", "startTime"],
      },
    },
  },

  // ---------- ТЕСТЫ (КВИЗЫ) ----------
  {
    type: "function",
    function: {
      name: "create_quiz",
      description:
        "Создаёт тест (квиз) на основе материала — например по содержанию заметки, конспекта или расшифровки лекции. Используй, когда пользователь просит 'сделай тест по этому', 'проверь меня по материалу'.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          sourceNoteId: { type: "string", description: "ID заметки-источника, если тест делается по конкретной заметке" },
          questions: {
            type: "array",
            description: "Список вопросов теста",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correctIndex: { type: "number", description: "Индекс правильного варианта в options" },
              },
              required: ["question", "options", "correctIndex"],
            },
          },
        },
        required: ["title", "questions"],
      },
    },
  },
];
