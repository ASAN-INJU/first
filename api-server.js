// =======================================
// V12 Ultimate API Server
// KIS 현재가 안정화 버전
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {
    getCurrentPrice
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


        const code =
        req.params.code;


        const stock =
        await getCurrentPrice(code);



        res.json({

            success:true,

            code:code,

            price:
            stock.price,

            change:
            stock.change,

            volume:
            stock.volume,

            ma5:0,

            ma20:0,

            ma60:0

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



// =======================================
// 시작
// =======================================

app.listen(
PORT,
()=>{

console.log(
`V12 Ultimate Server Running ${PORT}`
);

});
