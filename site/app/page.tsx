"use client";
import { useRouter } from "next/navigation";
import { titleFont, textFont } from "@/app/fonts";

export default function Home() {
  const router = useRouter();
  
  const handleLoginClick = () => {
    router.push("/login");
  };
  
  return (
    <div
      className={`min-h-screen relative flex items-center ${titleFont.variable} ${textFont.variable}`}
    >
      <div className="w-full">
        <div className="max-w-4xl mx-auto text-center text-white p-4">
          <h2 className={`font-title text-3xl md:text-4xl mb-2`}>
            The Wonderful World of
          </h2>
          <h1 className={`font-title text-6xl md:text-8xl`}>
            Christmas
          </h1>
          
          <button
            onClick={handleLoginClick}
            className={`mt-8 px-8 py-3 bg-white/20 backdrop-blur-sm 
                      border-2 border-white rounded-full
                      font-text text-xl text-white
                      hover:bg-white/30 transition-all duration-300
                      transform hover:scale-105`}
          >
            Enter the Magic
          </button>
        </div>
      </div>
    </div>
  );
}