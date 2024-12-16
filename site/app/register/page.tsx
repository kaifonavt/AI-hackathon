'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { titleFont, textFont } from '@/app/fonts';

const BACKEND_URL = process.env.BACKEND_URL;

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = () => {
    if (formData.password.length < 8) {
      setErrorMessage("Пароль должен содержать минимум 8 символов.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Пароли не совпадают.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Регистрация успешна! Перенаправляем...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Ошибка регистрации. Попробуйте снова.");
      }
    } catch (error) {
      setErrorMessage("Ошибка соединения. Проверьте подключение к интернету.");
    }
    
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${textFont.className}`}
      style={{
        backgroundImage: 'url("/images/main_back.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-md">
        <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-8">
          <h2 className={`text-3xl text-white text-center mb-8 ${titleFont.className}`}>
            Регистрация
          </h2>

          {errorMessage && (
            <div className="bg-red-500/70 text-white text-sm rounded-lg px-4 py-2 mb-4">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/70 text-white text-sm rounded-lg px-4 py-2 mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="text-gray-200 block text-sm mb-2">
                Имя пользователя
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="email" className="text-gray-200 block text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-gray-200 block text-sm mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-gray-200 block text-sm mb-2">
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className={`w-full text-xl bg-pink-600 text-white px-8 py-3 rounded-lg hover:bg-pink-700 transition transform hover:scale-105 shadow-lg ${titleFont.className}`}
            >
              Создать аккаунт
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300 mb-2">
              Уже есть аккаунт?
            </p>
            <button
              onClick={() => router.push("/login")}
              className={`text-pink-400 hover:text-pink-300 transition ${titleFont.className}`}
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}