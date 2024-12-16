"use client";

import { useState, useEffect } from "react";
import { titleFont, textFont } from "@/app/fonts";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

interface MenuItem {
  Название: string;
  Цена: number;
  Описание?: string;
}

interface Restaurant {
  id: number;
  name: string;
  address: string;
  menu: Record<string, Record<string, MenuItem | MenuItem[]>>;
  schedule_open: string;
  schedule_close: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMenu, setSelectedMenu] = useState<Restaurant["menu"] | null>(
    null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/restaurant`);
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        } else {
          setError("Failed to load restaurants");
        }
      } catch (error) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);
  const renderMenuItem = (dish: MenuItem) => (
    <div className="flex justify-between items-start border-b border-purple-500/20 pb-2">
      <div>
        <p className="text-white font-medium">{dish.Название}</p>
        {dish.Описание && (
          <p className="text-gray-300 text-sm">{dish.Описание}</p>
        )}
      </div>
      <span className="ml-4 whitespace-nowrap text-pink-400">
        {dish.Цена} ₸
      </span>
    </div>
  );

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${textFont.className}`}
    >
      <div className="max-w-4xl mx-auto">
        <h1
          className={`text-4xl text-white text-center mb-12 ${titleFont.className}`}
        >
          Рестораны
        </h1>

        {loading ? (
          <div className="text-center text-white">Загрузка...</div>
        ) : error ? (
          <div className="bg-red-500/70 text-white rounded-lg p-4 text-center">
            {error}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-8 text-center">
            <p className="text-white text-lg">Рестораны не найдены</p>
          </div>
        ) : (
          <div className="space-y-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-6 hover:border-pink-500/50 transition duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className={`text-2xl text-white mb-2 ${titleFont.className}`}
                    >
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-300">{restaurant.address}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300">
                    {formatTime(restaurant["schedule_open"])} -{" "}
                    {formatTime(restaurant["schedule_close"])}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedMenu(restaurant.menu);
                    setIsMenuOpen(true);
                  }}
                  className={`text-pink-400 hover:text-pink-300 transition ${titleFont.className}`}
                >
                  Посмотреть меню →
                </button>
              </div>
            ))}
          </div>
        )}

        {isMenuOpen && selectedMenu && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              className="backdrop-blur-sm bg-purple-950/90 rounded-xl border border-purple-500/20 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl text-white ${titleFont.className}`}>
                  Меню
                </h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-300 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {Object.entries(selectedMenu).map(([cuisine, categories]) => (
                <div key={cuisine} className="mb-8">
                  <h3
                    className={`text-xl text-white mb-4 ${titleFont.className}`}
                  >
                    {cuisine}
                  </h3>
                  {Object.entries(categories).map(([category, dishes]) => (
                    <div key={category} className="mb-6">
                      <h4
                        className={`text-lg text-pink-400 mb-3 ${titleFont.className}`}
                      >
                        {category}
                      </h4>
                      <div className="space-y-3">
                        {Array.isArray(dishes)
                          ? dishes.map((dish, index) => (
                              <div key={index}>{renderMenuItem(dish)}</div>
                            ))
                          : renderMenuItem(dishes as MenuItem)}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
