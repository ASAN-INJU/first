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
// AI 단타 점수 분석
// =======================================

function analyzeStock(data){

    let score = 0;


    if(data.price > data.ma5)
        score += 20;


    if(data.ma5 > data.ma20)
        score += 20;


    if(data.ma20 > data.ma60)
        score += 20;


    if(data.change > 2)
        score += 20;


    if(data.volume > 1000000)
        score += 20;


    let signal = "관망";


    if(score >= 80)
        signal = "매수관심";

    else if(score >= 60)
        signal = "상승관찰";

    else if(score < 40)
        signal = "약세";


    return {
        score,
        signal
    };

}

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

        res.json({
const ma =
await getMovingAverage(code);


const analysis =
analyzeStock({

    price:stock.price,

    change:stock.change,

    volume:stock.volume,

    ma5:ma.ma5,

    ma20:ma.ma20,

    ma60:ma.ma60

});
            success:true,

            code:code,

            price:stock.price,

            change:stock.change,

            volume:stock.volume,

            ma5:ma.ma5,

            ma20:ma.ma20,

            ma60:ma.ma60,

analysis:analysis

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
// 서버 시작
// =======================================

app.listen(
    PORT,
    ()=>{
        console.log(
            `V12 Ultimate Server Running ${PORT}`
        );
    }
);
