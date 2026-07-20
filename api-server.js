// =======================================
// V12 Ultimate API Server
// KIS 현재가 안정화 버전
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    getCurrentPrice,
    getMovingAverage
} = require("./kis");


const app = express();

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 10000;


// =======================================
// 서버 확인
// =======================================

app.get("/", (req,res)=>{

    res.send(
        "V12 Ultimate API Server Running"
    );

});



// =======================================
// 주가 조회
// =======================================

app.get(
"/api/stock/:code",
async(req,res)=>{

    try{

        const code = req.params.code;

        const stock =
        await getCurrentPrice(code);


        const ma =
        await getMovingAverage(code);



        res.json({

            success:true,

            code:code,

            price:stock.price,

            change:stock.change,

            volume:stock.volume,

            ma5:ma.ma5,

            ma20:ma.ma20,

            ma60:ma.ma60

        });


    }
    catch(error){

        console.log(
            "API ERROR",
            error.message
        );


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});
