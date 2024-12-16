'use client';

import { useState, useEffect } from "react";
import { titleFont, textFont } from '@/app/fonts';
import { useRouter } from 'next/navigation';

const BACKEND_URL = process.env.BACKEND_URL;

type Holiday = {
  id: number;
  theme: string;
  guests_count: number;
  guests: any[];
  details: string;
  latitude: number;
  longitude: number;
  location_address: string;
  created_at: string;
  updated_at: string;
};

export default function HolidaysPage() {
  const router = useRouter();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiGuestCount, setAiGuestCount] = useState("");
  const [aiDate, setAiDate] = useState("");

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BACKEND_URL}/holidays`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHolidays(data);
        } else {
          setError("Failed to load holidays");
        }
      } catch (error) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAISubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/holidays/ai-generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: aiDescription,
          guests_count: parseInt(aiGuestCount),
          date: aiDate
        })
      });

      if (response.ok) {
        setShowAIModal(false);
        router.refresh();
      } else {
        setError("Failed to generate event");
      }
    } catch (error) {
      setError("Error connecting to server");
    }
  };

  return (
    <div
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${textFont.className}`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-4xl text-white text-center mb-12 ${titleFont.className}`}>
          Мои Праздники
        </h1>

        {loading ? (
          <div className="text-center text-white">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-500/70 text-white rounded-lg p-4 text-center">
            {error}
          </div>
        ) : holidays.length === 0 ? (
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-8 text-center">
            <p className="text-white text-lg">У вас пока нет праздников</p>
            <div className="relative">
              <button
                className={`mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition transform hover:scale-105 ${titleFont.className}`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Создать праздник
              </button>
              {showDropdown && (
                <div className="absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => router.push('/holidays/new')}
                    >
                      Создать вручную
                    </button>
                    <button
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowAIModal(true)}
                    >
                      AI помощник
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-6 hover:border-pink-500/50 transition duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-2xl text-white mb-2 ${titleFont.className}`}>
                      {holiday.theme}
                    </h3>
                    <p className="text-gray-300">
                      {formatDate(holiday.created_at)}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300">
                    {holiday.guests_count} гостей
                  </span>
                </div>

                <p className="text-gray-300 mb-4">
                  {holiday.details}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {holiday.location_address}
                  </span>
                  <button
                    onClick={() => router.push(`/holidays/${holiday.id}`)}
                    className={`text-pink-400 hover:text-pink-300 transition ${titleFont.className}`}
                  >
                    Подробнее →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAIModal(false)}>
          <div 
            className="backdrop-blur-sm bg-purple-950/90 rounded-xl border border-purple-500/20 p-6 max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl text-white ${titleFont.className}`}>AI Помощник</h2>
              <button 
                onClick={() => setShowAIModal(false)}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Описание праздника</label>
                <textarea
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  rows={5}
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Опишите желаемый праздник..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Количество гостей</label>
                <input
                  type="number"
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  value={aiGuestCount}
                  onChange={(e) => setAiGuestCount(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-white mb-2">Дата</label>
                <input
                  type="date"
                  className="w-full p-3 rounded-lg bg-purple-900/50 text-white border border-purple-500/20 focus:border-pink-500/50"
                  value={aiDate}
                  onChange={(e) => setAiDate(e.target.value)}
                />
              </div>

              <button
                onClick={handleAISubmit}
                className={`w-full mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition transform hover:scale-105 ${titleFont.className}`}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}