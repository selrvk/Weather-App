"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getWeatherData } from "./actions";
import { useState } from "react";
import { WeatherData } from "@/types/weather";
import { Card, CardContent } from "@/components/ui/card";

function SubmitButton(){

  return (
    <Button type="submit">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-sky-800 flex items-center justify-center">
      <div className="w-full max-w-md">

        <form action={handleSearch} className="flex">
          <Input
            name="city"
            type="text"
            placeholder="Enter city name..."
            className="bg-white/80"
            required
          />
          <SubmitButton/>
        </form>

        {weather && (
          <div>
            <Card className="bg-white mt-20">
              <CardContent className="flex flex-col items-center">

                <h1 className="text-4xl">
                  {weather.location.name}
                </h1>

                <h2 className="text-2xl">
                  {weather.location.country}
                </h2>

                <img src={weather.current.condition.icon} className="w-20"></img>

              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
