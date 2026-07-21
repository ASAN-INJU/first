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

    let validMA = true;


    // -----------------------------------
    // MA 데이터 유효성 확인
    // -----------------------------------

    if (
        !data.ma5 ||
        !data.ma20 ||
        !data.ma60
    ) {

        validMA = false;

        console.log(
            "MA DATA INVALID",
            {
                ma5: data.ma5,
                ma20: data.ma20,
                ma60: data.ma60
            }
        );

    }


    // -----------------------------------
    // 1~3. 이동평균 분석
    // -----------------------------------

    if (validMA) {

        // 현재가 > MA5
        if (
            data.price > data.ma5
        ) {

            score += 20;

        }


        // MA5 > MA20
        if (
            data.ma5 > data.ma20
        ) {

            score += 20;

        }


        // MA20 > MA60
        if (
            data.ma20 > data.ma60
        ) {

            score += 20;

        }

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
        !validMA
    ) {

        signal =
            "데이터부족";

    }

    else if (
        score >= 80
    ) {

        signal =
            "매수관심";

    }

    else if (
        score >= 60
    ) {

        signal =
            "상승관찰";

    }

    else if (
        score >= 40
    ) {

        signal =
            "관망";

    }

    else {

        signal =
            "약세";

    }


    // ===================================
    // AI 분석 로그
    // ===================================

    console.log(
        "AI ANALYSIS",
        {
            price:
                data.price,

            ma5:
                data.ma5,

            ma20:
                data.ma20,

            ma60:
                data.ma60,

            change:
                data.change,

            volume:
                data.volume,

            score:
                score,

            signal:
                signal,

            validMA:
                validMA

        }
    );


    return {

        score:
            score,

        signal:
            signal,

        validMA:
            validMA

    };

}
