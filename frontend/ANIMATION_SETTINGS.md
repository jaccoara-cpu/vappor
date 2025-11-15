# Настройки анимации расшифровки текста

## Расположение настроек

Все настройки находятся в файле `frontend/src/pages/Welcome.jsx` в начале файла.

## Параметры для заголовка "VAPOR"

### `TITLE_ANIMATION.speed` (скорость)
- **Текущее значение**: 60 миллисекунд
- **Диапазон**: 30-150 мс
- **Как работает**: Интервал между обновлениями символов
- **Эффект**: 
  - Меньше значение (30-50) = быстрее анимация
  - Больше значение (100-150) = медленнее анимация

### `TITLE_ANIMATION.maxIterations` (количество итераций)
- **Текущее значение**: 20
- **Диапазон**: 5-30
- **Как работает**: Сколько раз символ "зашифруется" перед тем как раскрыться
- **Эффект**: 
  - Меньше значение (5-10) = быстрее раскрытие букв
  - Больше значение (25-30) = медленнее раскрытие, больше эффекта "дешифровки"

### `TITLE_ANIMATION.sequential` (последовательность)
- **Текущее значение**: true
- **Варианты**: true / false
- **Как работает**: 
  - `true` = буквы раскрываются по одной по очереди
  - `false` = все буквы дешифруются одновременно

### `TITLE_ANIMATION.revealDirection` (направление)
- **Текущее значение**: 'center'
- **Варианты**: 'center', 'start', 'end'
- **Как работает**:
  - `'center'` = буквы раскрываются от центра к краям (V-A-P-O-R)
  - `'start'` = слева направо (V→A→P→O→R)
  - `'end'` = справа налево (R→O→P→A→V)

### `TITLE_ANIMATION.useOriginalCharsOnly` (символы)
- **Текущее значение**: true
- **Варианты**: true / false
- **Как работает**:
  - `true` = используются только буквы из самого текста (V, A, P, O, R)
  - `false` = используются случайные символы из набора (A-Z, a-z, !@#$% и т.д.)

## Примеры настроек

### Быстрая анимация от центра
```javascript
const TITLE_ANIMATION = {
  speed: 40,
  maxIterations: 10,
  sequential: true,
  revealDirection: 'center',
  useOriginalCharsOnly: true,
};
```

### Медленная анимация слева направо
```javascript
const TITLE_ANIMATION = {
  speed: 100,
  maxIterations: 25,
  sequential: true,
  revealDirection: 'start',
  useOriginalCharsOnly: true,
};
```

### Быстрая одновременная дешифровка
```javascript
const TITLE_ANIMATION = {
  speed: 50,
  maxIterations: 15,
  sequential: false,  // все буквы сразу
  revealDirection: 'center',
  useOriginalCharsOnly: true,
};
```

### Эффект с случайными символами
```javascript
const TITLE_ANIMATION = {
  speed: 60,
  maxIterations: 20,
  sequential: true,
  revealDirection: 'center',
  useOriginalCharsOnly: false,  // случайные символы
};
```

## Как изменить настройки

1. Откройте файл `frontend/src/pages/Welcome.jsx`
2. Найдите константу `TITLE_ANIMATION` в начале файла
3. Измените нужные параметры
4. Сохраните файл - изменения применятся автоматически

## Дополнительные настройки

Вы также можете настроить символы для шифрования, изменив параметр `characters` в компоненте `DecryptedText`:

```javascript
<DecryptedText
  text="VAPOR"
  characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%"
  // ... другие параметры
/>
```

