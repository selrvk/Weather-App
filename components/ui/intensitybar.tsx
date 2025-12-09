
interface Levels {

    max:number,
    current:number

}

export default function IntensityBar({max = 100, current} : Levels){

    const barHeight = 80;
    const circlePosition = (current / max) * barHeight;

    return (
    <div className="flex flex-col items-center">
        
      <h1 className="mb-2">{max}</h1>

      <div className="w-5 h-[100px] bg-purple-200 rounded-2xl relative">

        <div
          className="w-5 h-5 bg-purple-400 rounded-full absolute"
          style={{ bottom: `${circlePosition}px`}}>
        </div>

      </div>

    </div>
  );
}
