console.log("NEW API SERVER VERSION 002");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { getCurrentPrice } = require("./kis");

const app = express();

app.use(cors());
app.use(express.json());


// 서버 확인
app.get("/", (req,res)=>{
    res.send("V11.2 CLEAN SERVER OK");
});


// ================================
// KIS 현재가 조회 API
// ================================
app.get("/api/stock/:code", async (req,res)=>{

    const code = req.params.code;

    try {

        const data = await getCurrentPrice(code);

        res.json({

            success:true,

            code:code,

            kis:data

        });


    } catch(error) {

        console.log(error.message);

        res.status(500).json({

            success:false,

            message:"KIS API 조회 실패"

        });

    }

});


// 서버 실행
const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{

    console.log("=== V11.2 CLEAN SERVER START ===");
    console.log("PORT:", PORT);

});
