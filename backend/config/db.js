const mongoose=require('mongoose')

const connectDb=async ()=>{
try{


    let conn=await mongoose.connect(`mongodb+srv://users-open-to-all:hiPassword123@cluster0.uh35t.mongodb.net/Mohammed_GhouseDB?authSource=admin&replicaSet=atlas-wwe75z-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true`,{
        useNewUrlParser: true,
        useUnifiedTopology: true
        
      })

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`connection error ${error.message}`);
    }

}

module.exports=connectDb