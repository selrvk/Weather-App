import * as motion from "motion/react-client"

interface RotateProps {

    deg?: number
}

export default function Rotate({deg = 360} : RotateProps) {
    return (
        <motion.svg width="50" height="50" viewBox="0 0 100 100" animate={{ rotate: deg }} transition={{ duration: 1 }}>
            <polygon points="50,0 100,100 50,80 0,100" fill="#ff0088" />
        </motion.svg>
    )
}