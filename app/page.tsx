"use client"

import Lottie from "lottie-react";
import CountUp from './../components/CountUp'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getWeatherData } from "./actions";
import { useEffect, useState } from "react";
import { WeatherData } from "@/types/weather";
import LottieWeather from "@/components/weather/lottieweather";
import { Card } from "@/components/ui/card";

function SubmitButton(){

  return (
    <Button type="submit" className="bg-black/70">
      <Search className="w-4"/>
    </Button>
  )
}

export default function Home() {

  const [weather, setWeather] = useState<WeatherData | null> (null);

  const handleSearch = async (formData : FormData) => {
    const city = formData.get("city") as string;
    const {data} = await getWeatherData(city);
    console.log(data);
    
    if(data){
      setWeather(data);
    }
  }

  useEffect(() => {
    async function fetchWeather() {
      const { data } = await getWeatherData("Manila");
      if (data) {
        setWeather(data);
        console.log(data);
      }
    }

    if (weather === null) {
      fetchWeather();
    }
  }, [weather]);

  const isDay = "from-sky-600 to-sky-200";
  const isNight = "from-black to-indigo-900";
  var isTime

  if(weather && weather.current.is_day === 1){
      isTime = isDay
  } else {
      isTime = isNight
  }

  return (

    <div className={`min-h-screen bg-linear-to-b ${isTime} pt-20`}>

      <form action={handleSearch} className="flex gap-5 pl-40 w-100">

            <Input
              name="city"
              type="text"
              placeholder="Change city"
              className="bg-white/60"
              required
            />
            <SubmitButton/>

      </form>

        {weather && (

          <>
          <div className="flex mt-10 px-40 justify-between w-full">
            
            <div className="flex flex-col">

              <h1 className="text-6xl text-amber-50 font-bold">
                {weather.location.region}
              </h1>

              <h2 className="text-3xl text-amber-50">
                {weather.location.country}
              </h2>

              <h3 className="text text-amber-50">
                Feels like {weather.current.feelslike_c}
              </h3>

            </div>

            <div className="flex flex-row gap-5">

              <LottieWeather
                currWeather={weather.current.condition.text}
                isDay={weather.current.is_day}
              />

              <div className="flex flex-col gap-3">
                <h2 className="text-3xl text-amber-50">
                  {weather.current.condition.text}
                </h2>

                <h1 className="text-6xl font-bold text-amber-50">
                  {weather.current.temp_c} °C
                </h1>
              </div>

            </div>

          </div>

          <Card
          
          />

          </>          

        )}

    </div>
  );
}
