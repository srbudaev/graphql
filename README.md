# GraphQL Profile Dashboard

Современная веб-страница профиля пользователя с использованием GraphQL API и JWT аутентификации.

A modern user profile web page using GraphQL API and JWT authentication.

## 🚀 Features / Возможности

### Authentication / Аутентификация
- **JWT-based login** / JWT авторизация
- **Secure token storage** / Безопасное хранение токенов
- **Session management** / Управление сессиями
- **Auto-logout on token expiration** / Автоматический выход при истечении токена

### User Information Display / Отображение информации пользователя
- **Basic Information** / Основная информация:
  - Login, User ID, Name / Логин, ID пользователя, Имя
  - Email, Phone, Gender / Email, Телефон, Пол
  - Nationality / Национальность

- **Academic Information** / Академическая информация:
  - Campus / Кампус
  - Audit Ratio / Рейтинг аудита
  - Total XP earned / Общий заработанный XP

### Real-time Data Visualization / Визуализация данных в реальном времени
- **XP Progress Chart** / График прогресса XP:
  - Cumulative XP over time / Накопительный XP во времени
  - Interactive line chart / Интерактивный линейный график
  - Hover tooltips / Всплывающие подсказки

- **Project Success Rate** / Показатель успешности проектов:
  - Pie chart with completion statistics / Круговая диаграмма со статистикой завершения
  - Success/Failure/In Progress breakdown / Разбивка на успешные/неудачные/в процессе

- **Audit Activity** / Активность аудита:
  - Monthly audit points bar chart / Столбчатая диаграмма месячных очков аудита
  - Last 6 months overview / Обзор за последние 6 месяцев

### Recent Activity / Недавняя активность
- **Recent XP Gains** / Недавние получения XP:
  - Last 5 XP transactions / Последние 5 XP транзакций
  - Project names and dates / Названия проектов и даты
  - Formatted XP amounts (KB/MB) / Форматированные суммы XP

- **Project Statistics** / Статистика проектов:
  - Total projects count / Общее количество проектов
  - Completion rate / Процент завершения
  - Success rate percentage / Процент успешности

## 🛠 Technology Stack / Технологический стек

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Authentication**: JWT (JSON Web Tokens)
- **API**: GraphQL with Bearer token authentication
- **Charts**: Native SVG generation
- **Styling**: Modern CSS Grid, Flexbox, Gradients
- **Responsive**: Mobile-first design

## 📊 Data Sources / Источники данных

The application fetches real data from GraphQL API:
Приложение получает реальные данные из GraphQL API:

### User Query / Запрос пользователя
```graphql
{
  user {
    id
    login
    attrs
    auditRatio
    campus
  }
}
```

### XP Transactions / XP транзакции
```graphql
{
  transaction(
    where: {type: {_eq: "xp"}}
    order_by: {createdAt: desc}
    limit: 50
  ) {
    amount
    createdAt
    path
  }
}
```

### Progress & Results / Прогресс и результаты
```graphql
{
  progress {
    id
    grade
    createdAt
    path
    object {
      name
      type
    }
  }
  result {
    id
    grade
    createdAt
    path
    object {
      name
      type
    }
  }
}
```

## 🎨 Design Features / Особенности дизайна

- **Modern UI** / Современный интерфейс:
  - Gradient backgrounds / Градиентные фоны
  - Card-based layout / Макет на основе карточек
  - Smooth animations / Плавные анимации
  - Hover effects / Эффекты при наведении

- **Responsive Design** / Адаптивный дизайн:
  - Mobile-first approach / Подход mobile-first
  - CSS Grid for layouts / CSS Grid для макетов
  - Flexible chart sizing / Гибкое изменение размера графиков

- **Interactive Elements** / Интерактивные элементы:
  - Chart tooltips / Всплывающие подсказки графиков
  - Button hover animations / Анимации кнопок при наведении
  - Card lift effects / Эффекты поднятия карточек

## 🚀 Getting Started / Начало работы

1. **Clone the repository** / Клонируйте репозиторий:
   ```bash
   git clone <repository-url>
   cd graphql-profile
   ```

2. **Open in browser** / Откройте в браузере:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Login with your credentials** / Войдите с вашими учетными данными:
   - Enter your username/email and password
   - Введите ваш логин/email и пароль

## 📁 Project Structure / Структура проекта

```
/
├── index.html              # Main HTML file / Основной HTML файл
├── assets/
│   ├── css/
│   │   └── style.css       # Styles / Стили
│   └── js/
│       ├── auth.js         # Authentication / Аутентификация
│       ├── main.js         # Main logic / Основная логика
│       ├── graphql.js      # GraphQL queries / GraphQL запросы
│       └── charts.js       # SVG chart generation / Генерация SVG графиков
├── README.md               # Documentation / Документация
└── plan.md                 # Development plan / План разработки
```

## 🔧 Configuration / Конфигурация

The application is configured to work with:
Приложение настроено для работы с:

- **API Endpoint**: `https://01.gritlab.ax/api/graphql-engine/v1/graphql`
- **Auth Endpoint**: `https://01.gritlab.ax/api/auth/signin`

## 📈 Performance / Производительность

- **Lightweight**: No external dependencies / Без внешних зависимостей
- **Fast loading**: Optimized assets / Оптимизированные ресурсы
- **Efficient**: Minimal API calls / Минимальные API вызовы
- **Responsive**: Smooth interactions / Плавные взаимодействия

## 🔒 Security / Безопасность

- **JWT token validation** / Валидация JWT токенов
- **Secure token storage** / Безопасное хранение токенов
- **HTTPS API calls** / HTTPS API вызовы
- **Input validation** / Валидация ввода
- **XSS protection** / Защита от XSS

## 🌐 Browser Support / Поддержка браузеров

- Chrome 60+ / Хром 60+
- Firefox 55+ / Файрфокс 55+
- Safari 12+ / Сафари 12+
- Edge 79+ / Эдж 79+

## 📝 License / Лицензия

This project is open source and available under the MIT License.
Этот проект имеет открытый исходный код и доступен под лицензией MIT. 