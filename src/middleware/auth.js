// middleware/auth.js — минимальная проверка личности пользователя.
//
// Для старта достаточно простого варианта: клиент присылает заголовок
// Authorization: Bearer <userId>, где userId — любой стабильный идентификатор
// устройства/аккаунта, сгенерированный один раз на клиенте и сохранённый
// (например через crypto.randomUUID() при первом запуске приложения).
//
// Это НЕ полноценная защита (userId можно подделать), но она уже разделяет
// данные разных пользователей друг от друга и достаточна, пока в приложении
// нет полноценной регистрации/входа. Когда появится авторизация (email/пароль,
// вход через Google и т.п.) — замени этот middleware на настоящую проверку JWT
// (см. закомментированный вариант ниже).

export function requireUser(req, res, next) {
  const header = req.headers.authorization || "";
  const userId = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!userId) {
    return res.status(401).json({ error: "Не указан идентификатор пользователя" });
  }

  req.userId = userId;
  next();
}

/*
// Вариант с настоящими JWT-токенами, когда появится полноценный логин:
//
// import jwt from "jsonwebtoken";
//
// export function requireUser(req, res, next) {
//   const header = req.headers.authorization || "";
//   const token = header.startsWith("Bearer ") ? header.slice(7) : null;
//   if (!token) return res.status(401).json({ error: "Нет токена" });
//
//   try {
//     const payload = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = payload.userId;
//     next();
//   } catch (err) {
//     res.status(401).json({ error: "Невалидный токен" });
//   }
// }
*/
