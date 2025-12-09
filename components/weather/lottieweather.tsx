"use client";

import Lottie from "lottie-react";
import rainyAnimation from "@/public/animations/rainy.json";
import sunnyAnimation from "@/public/animations/sunny.json";
import cloudyAnimation from "@/public/animations/cloudy.json";
import windyAnimation from "@/public/animations/windy.json";
import moonAnimation from "@/public/animations/moon.json"

interface LottieWeatherProps {

  currWeather: string;
  width?: number;
  height?: number;
  isDay:number;

}

export default function LottieWeather({ currWeather, width = 150, height = 150, isDay }: LottieWeatherProps) {

  let animationData;
  const condition = currWeather.toLowerCase();

  if (condition === "clear" && isDay === 0) {
  animationData = moonAnimation;

} else if (condition === "sunny" || (condition === "clear" && isDay === 1)) {
  animationData = sunnyAnimation;

} else if (condition === "rainy" || condition === "light rain" || condition === "moderate rain") {
  animationData = rainyAnimation;

} else if (condition === "windy") {
  animationData = windyAnimation;

} else if (condition === "cloudy" || condition === "partly cloudy") {
  animationData = cloudyAnimation;

} else {
  animationData = sunnyAnimation;
}
  return <Lottie animationData={animationData} loop style={{ width, height }} />;
}
