// =======================================
// V12 Ultimate API Server
// KIS + AI 단타 분석 버전
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

function analyzeStock(data) {

    let score = 0;


    // -----------------------------------
    // 1. 현재가 > MA5
    // 단기 상승 흐름
    // -----------------------------------

    if (
        data.price > data.ma5
    ) {

        score += 20;

    }


    // -----------------------------------
    // 2. MA5 > MA20
    // 단기 추세 상승
    // -----------------------------------

    if (
        data.ma5 > data.ma20
    ) {

        score += 20;

    }


    // -----------------------------------
    // 3. MA20 > MA60
    // 중기 추세 상승
    // -----------------------------------

    if (
        data.ma20 > data.ma60
    ) {

        score += 20;

    }


    // -----------------------------------
    // 4. 등락률 +2% 이상
    // -----------------------------------

    if (
        data.change > 2
    ) {

        score += 20;

    }


    // -----------------------------------
    // 5. 거래량 100만 이상
    // -----------------------------------

    if (
        data.volume > 1000000
    ) {

        score += 20;

    }


    // ===================================
    // 신호 판단
    // ===================================

    let signal = "관망";


    if (
        score >= 80
    ) {

        signal = "매수관심";

    }

    else if (
        score >= 60
    ) {

        signal = "상승관찰";

    }

    else if (
        score >= 40
    ) {

        signal = "관망";

    }

    else {

        signal = "약세";

    }


    // ===================================
    // 분석 로그
    // ===================================

    console.log(
        "AI ANALYSIS",
        {
            price: data.price,
            ma5: data.ma5,
            ma20: data.ma20,
            ma60: data.ma60,
            change: data.change,
            volume: data.volume,
            score: score,
            signal: signal
        }
    );


    return {

        score: score,

        signal: signal

    };

}


// =======================================
// 서버 확인
// =======================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "V12 Ultimate API Server Running"
        );

    }
);


// =======================================
// 주가 조회 API
// =======================================

app.get(
    "/api/stock/:code",
    async (req, res) => {


        try {


            // --------------------------------
            // 종목 코드
            // --------------------------------

            const code =
                req.params.code;


            console.log(
                "STOCK REQUEST",
                code
            );


            // --------------------------------
            // 현재가 조회
            // --------------------------------

            const stock =
                await getCurrentPrice(
                    code
                );


            // --------------------------------
            // 이동평균 조회
            // --------------------------------

            const ma =
                await getMovingAverage(
                    code
                );


            // --------------------------------
            // AI 분석
            // --------------------------------

            const analysis =
                analyzeStock({

                    price:
                        stock.price,

                    change:
                        stock.change,

                    volume:
                        stock.volume,

                    ma5:
                        ma.ma5,

                    ma20:
                        ma.ma20,

                    ma60:
                        ma.ma60

                });


            // --------------------------------
            // 최종 응답
            // --------------------------------

            res.json({

                success: true,

                code: code,

                price:
                    stock.price,

                change:
                    stock.change,

                volume:
                    stock.volume,

                ma5:
                    ma.ma5,

                ma20:
                    ma.ma20,

                ma60:
                    ma.ma60,

                analysis:
                    analysis

            });


        }

        catch (error) {


            console.log(
                "API ERROR",
                error.response?.data ||
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    error.message

            });


        }

    }
);


// =======================================
// 서버 시작
// =======================================

app.listen(
    PORT,
    () => {

        console.log(
            `V12 Ultimate Server Running ${PORT}`
        );

    }
);
