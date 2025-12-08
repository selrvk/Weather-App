export interface WeatherData {

    
    location:{
        country:string, 
        name:string,
        region:string
    },

    current: {

        temp_c:number,
        temp_f:number,
        humidity:number,
        is_day:number,  

        condition: {
            code:number,
            icon:string,
            text:string
        },
    }

}