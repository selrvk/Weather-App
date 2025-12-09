"use client"

import * as motion from "motion/react-client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getWeatherData } from "./actions";
import { useEffect, useState } from "react";
import { WeatherData } from "@/types/weather";
import LottieWeather from "@/components/weather/lottieweather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Rotate from "@/components/animations/Rotate";
import IntensityBar from "@/components/ui/intensitybar";

const windOpposite: Record<string, string> = {
  N: "S",
  NNE: "SSW",
  NE: "SW",
  ENE: "WSW",
  E: "W",
  ESE: "WNW",
  SE: "NW",
  SSE: "NNW",
  S: "N",
  SSW: "NNE",
  SW: "NE",
  WSW: "ENE",
  W: "E",
  WNW: "ESE",
  NW: "SE",
  NNW: "SSE",
};

const isDay = "from-sky-600 to-sky-200";
const isNight = "from-black to-indigo-900";
var isTime

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

          <div className="flex flex-row">

          <Card id="wind-card" className="bg-indigo-950/40 w-60 ml-40 mt-20">

            <CardHeader>
              <CardTitle className="text-white">
                Wind
              </CardTitle>
            
            </CardHeader>

            <CardContent className="flex flex-row justify-between text-white">

              <div id="left-div" className="flex flex-col">
                <div className="flex flex-row gap-2">
                  <h1 className="text-3xl font-bold">
                    {weather.current.wind_kph}
                  </h1>
                  <h3 className="text-gray-300">
                    km/h
                  </h3>
                </div>
                
                <h2 className="mt-5">
                  From
                </h2>
                <h1 className="font-bold">
                  {windOpposite[weather.current.wind_dir]}
                </h1>
              </div>

              <motion.div className="flex flex-col gap-4">

                <Rotate deg={weather.current.wind_degree}/>

                <h2 className="font-bold">
                  {weather.current.wind_dir} 
                </h2>
                
              </motion.div>
            </CardContent>
          </Card>

          <Card id="humid-card" className="bg-indigo-950/40 w-60 ml-5 mt-20">

            <CardHeader>
              <CardTitle className="text-white">
                Humidity
              </CardTitle>
            
            </CardHeader>

            <CardContent className="flex flex-row justify-between text-white">

              <div id="left-div" className="flex flex-col">
                <div className="flex flex-row gap-2">
                  <h1 className="text-3xl font-bold">
                    {weather.current.humidity}
                  </h1>
                  <h3 className="text-gray-300">
                    %
                  </h3>
                </div>
                
                <h2 className="mt-5">
                  Dewpoint
                </h2>
                <h1 className="font-bold">
                  {weather.current.dewpoint_c} °C
                </h1>
              </div>

              <IntensityBar max={100} current={weather.current.humidity}/>

            </CardContent>
          </Card>

          </div>
          
            
  

          </>          

        )}

    </div>
  );
}
