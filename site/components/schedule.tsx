"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface Schedule {
  id: number;
  code: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const BACKEND_URL = process.env.BACKEND_URL || "https://expera-5a7911691b55.herokuapp.com";

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await axios.get<Schedule[]>(`${BACKEND_URL}/schedules`);
        setSchedules(data);
      } catch (error) {
        setError("Failed to load schedule. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const formatTime = (time: string) => time.substring(0, 5);

  const getClass = (timeSlot: string, day: number) => {
    const [startTime, endTime] = timeSlot.split("-");
    return (
      schedules.find(
        (schedule) =>
          formatTime(schedule.start_time) === startTime &&
          formatTime(schedule.end_time) === endTime &&
          schedule.day_of_week === day
      )?.code || ""
    );
  };

  const timeSlots = ["08:00-09:00", "09:10-10:10", "10:20-11:20", "11:30-12:30"];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
      </div>
    );
  }

  return (
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-sm bg-purple-950/30 rounded-xl border border-purple-500/20 p-4 md:p-6">
            <table className="border-collapse">
              <thead className="bg-purple-900/50">
                <tr>
                  <th className="border border-purple-500/20 p-2 md:px-4 md:py-2 font-pixel uppercase text-pink-400">
                    Time
                  </th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                    <th key={day} className="border border-purple-500/20 p-2 md:px-4 md:py-2 font-pixel uppercase tracking-wider text-pink-400">
                      <span className="hidden md:inline">{day}</span>
                      <span className="md:hidden">{day.substring(0, 3)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-purple-500/20 p-2 md:px-4 md:py-2 font-pixel text-sm whitespace-nowrap tracking-wider">
                      {timeSlot}
                    </td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const classCode = getClass(timeSlot, day);
                      return (
                        <td
                          key={`${timeSlot}-${day}`}
                          className={`border border-purple-500/20 p-2 md:px-4 md:py-2 text-center font-pixel text-sm tracking-wider [text-shadow:_2px_2px_0_rgb(0_0_0_/_100%)] ${
                            classCode ? "bg-purple-900/50" : ""
                          }`}
                        >
                          {classCode}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  );
}