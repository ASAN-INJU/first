// =======================================
// V12 Ultimate Stock API Server
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { getStockInfo } = require("./kis");

const app = express();

app.use(cors());
app.use(express.json());


// 서버 확인
app.get("/", (req,res)=>{
    res.send("V12 Ultimate API Server Running");
});


// 주식 조회 API
app.get("/api/stock/:code", async(req,res)=>{

    try{

        const result = await getStockInfo(
            req.params.code
        );

        res.json({
            success:true,
            data:result
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

});


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

    console.log(
        `Server running ${PORT}`
    );

});
