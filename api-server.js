require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


// 서버 확인
app.get("/", (req,res)=>{
    res.send("V11.2 CLEAN SERVER OK");
});


// 주식 API 테스트
app.get("/api/stock/:code",(req,res)=>{

    res.json({

        success:true,
        code:req.params.code,
        message:"API 연결 성공"

    });

});


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{

    console.log("=== V11.2 CLEAN SERVER START ===");
    console.log("PORT:",PORT);

});
