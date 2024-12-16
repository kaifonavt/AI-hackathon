'use client';

import { useState, useEffect } from "react";
import { titleFont, textFont } from '@/app/fonts';
import { useParams } from 'next/navigation';

type Guest = {
  id: number;
  name: string;
  arrived: boolean;
  gift?: string;
};

type Holiday = {
  id: number;
  theme: string;
  guests_count: number;
  guests: Guest[];
  details: string;
  location_address: string;
  created_at: string;
  updated_at: string;
};

export default function HolidayDetailsPage() {
  const params = useParams();
  const [holiday, setHoliday] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newGuest, setNewGuest] = useState({ name: "", gift: "" });
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  useEffect(() => {
    fetchHoliday();
  }, [params.id]);

  const fetchHoliday = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.BACKEND_URL}/holidays/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHoliday(data);
        setEditedDetails(data.details);
        setEditedLocation(data.location_address);
      } else {
        setError("Failed to load holiday details");
      }
    } catch (error) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestArrival = async (guestId: number, arrived: boolean) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.BACKEND_URL}/holidays/${holiday?.id}/guests/${guestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ arrived }),
      });
      fetchHoliday();
    } catch (error) {
      setError("Failed to update guest status");
    }
  };

  const updateLocation = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.BACKEND_URL}/holidays/${holiday?.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location_address: editedLocation }),
      });
      setIsEditingLocation(false);
      fetchHoliday();
    } catch (error) {
      setError("Failed to update location");
    }
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.BACKEND_URL}/holidays/${holiday?.id}/guests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGuest),
      });
      setNewGuest({ name: "", gift: "" });
      fetchHoliday();
    } catch (error) {
      setError("Failed to add guest");
    }
  };

  const removeGuest = async (guestId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.BACKEND_URL}/holidays/${holiday?.id}/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchHoliday();
    } catch (error) {
      setError("Failed to remove guest");
    }
  };

  const updateDetails = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${process.env.BACKEND_URL}/holidays/${holiday?.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ details: editedDetails }),
      });
      setIsEditingDetails(false);
      fetchHoliday();
    } catch (error) {
      setError("Failed to update details");
    }
  };

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!holiday) return <div className="text-white">Holiday not found</div>;

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${textFont.className}`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className={`text-4xl text-white text-center mb-8 ${titleFont.className}`}>
          {holiday.theme}
        </h1>

        <div className="space-y-6">
          {/* Location */}
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl text-white ${titleFont.className}`}>Место проведения</h2>
              <button
                onClick={() => setIsEditingLocation(!isEditingLocation)}
                className="text-pink-400 hover:text-pink-300 transition"
              >
                {isEditingLocation ? "Отмена" : "Редактировать"}
              </button>
            </div>
            {isEditingLocation ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                  placeholder="Введите адрес"
                />
                <button
                  onClick={updateLocation}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <p className="text-gray-300">{holiday.location_address}</p>
            )}
          </div>

          {/* Details */}
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-2xl text-white ${titleFont.className}`}>Детали праздника</h2>
              <button
                onClick={() => setIsEditingDetails(!isEditingDetails)}
                className="text-pink-400 hover:text-pink-300 transition"
              >
                {isEditingDetails ? "Отмена" : "Редактировать"}
              </button>
            </div>
            {isEditingDetails ? (
              <div className="space-y-4">
                <textarea
                  value={editedDetails}
                  onChange={(e) => setEditedDetails(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                  rows={4}
                />
                <button
                  onClick={updateDetails}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                >
                  Сохранить
                </button>
              </div>
            ) : (
              <p className="text-gray-300">{holiday.details}</p>
            )}
          </div>

          {/* Guest List */}
          <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-6">
            <h2 className={`text-2xl text-white mb-6 ${titleFont.className}`}>Список гостей</h2>
            
            {/* Add Guest Form */}
            <form onSubmit={addGuest} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  placeholder="Имя гостя"
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                  required
                />
                <input
                  type="text"
                  value={newGuest.gift}
                  onChange={(e) => setNewGuest({ ...newGuest, gift: e.target.value })}
                  placeholder="Подарок (необязательно)"
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-900/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 transition"
                />
                <button
                  type="submit"
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                >
                  Добавить
                </button>
              </div>
            </form>

            {/* Guest List */}
            <div className="space-y-4">
              {holiday.guests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-4 bg-purple-900/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={guest.arrived}
                      onChange={(e) => handleGuestArrival(guest.id, e.target.checked)}
                      className="w-5 h-5 rounded border-purple-500"
                    />
                    <div>
                      <p className="text-white">{guest.name}</p>
                      {guest.gift && (
                        <p className="text-gray-400 text-sm">Подарок: {guest.gift}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}