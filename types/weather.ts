export interface WeatherData {

    
    location:{
        country:string, 
        name:string,
        region:string
    },

    current: {

        temp_c:number,
        temp_f:number,

        is_day:number,  
        feelslike_c:number,

        wind_kph:number,
        wind_dir:string,
        wind_degree:number,

        humidity:number,
        dewpoint_c:number,

        pressure_mb:number,

        uv:number,

        condition: {
            code:number,
            icon:string,
            text:string
        },
    }
}