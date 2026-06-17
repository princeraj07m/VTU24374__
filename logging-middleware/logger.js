import axios from "axios"
import dotenv from "dotenv"

dotenv.config()


const log = async ( stack, level, pkg,message)=>{
    try{
        await axios.post("http://4.224.186.213/evaluation-service/logs",{
            stack, level, package : pkg, message
        },{
            headers : {
                Authorization : `Bearer ${process.env.LOGGING_SERVICE_TOKEN}`
            }
        })
    }catch(err){
        console.log(err)
    }
}


export default log;