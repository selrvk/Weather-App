"use server"

import { WeatherData } from "@/types/weather";

export async function getWeatherData(city : string): Promise<{data?:WeatherData}>

{
    try{
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
        const data = await response.json();
        return {data};

    } catch (error){
        console.error(error);
        return{}
    }
}

export async function getForecastData(city : string): Promise<{data?:WeatherData}>

{
    try{
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.xml?hey=${process.env.WEATHER_API_KEY}&q=${city}&days=7`);
        const data = await response.json();
        return {data};

    } catch (error){
        console.error(error);
        return{}
    }
}