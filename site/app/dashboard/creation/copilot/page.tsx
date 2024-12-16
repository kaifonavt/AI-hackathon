'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { titleFont, textFont } from '@/app/fonts';

const BACKEND_URL = process.env.BACKEND_URL;

type FormData = {
  theme: string;
  details: string;
  guests_count: string;
  location_address: string;
};

export default function CreateHolidayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    theme: "",
    details: "",
    guests_count: "",
    location_address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/holidays`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          guests_count: parseInt(formData.guests_count),
        }),
      });

      if (!response.ok) throw new Error("Failed to create holiday");

      router.push('/holidays');
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creating holiday");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${textFont.className}`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`text-4xl text-white text-center mb-12 ${titleFont.className}`}>
          Создать Праздник
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Тема праздника</label>
                <input
                  type="text"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Описание</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Количество гостей</label>
                <input
                  type="number"
                  name="guests_count"
                  value={formData.guests_count}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Адрес</label>
                <input
                  type="text"
                  name="location_address"
                  value={formData.location_address}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-500/70 text-white rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg border border-gray-400 text-gray-300 hover:bg-gray-700/50 transition"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}