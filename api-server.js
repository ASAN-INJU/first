// =======================================
// V12 Ultimate API Server
// KIS + AI 단타 분석 버전
// =======================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const stocks = require("./stocks.json");
const {
    getCurrentPrice,
    getMovingAverage,
    getIchimoku
} = require("./kis");


const app = express();

app.use(cors());
app.use(express.json());


const PORT =
    process.env.PORT || 10000;


// =======================================
// AI 단타 점수 분석
// =======================================

function analyzeStock(data) {

    let score = 0;

    let validMA = true;

    let reasons = [];


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
    // 1. 현재가 vs MA5
    // -----------------------------------

    if (validMA) {

        if (
            data.price > data.ma5
        ) {

            score += 20;

            reasons.push(
                "현재가가 MA5 상회 +20"
            );

        }

        else {

            reasons.push(
                "현재가가 MA5 하회"
            );

        }


        // -----------------------------------
        // 2. MA5 vs MA20
        // -----------------------------------

        if (
            data.ma5 > data.ma20
        ) {

            score += 20;

            reasons.push(
                "MA5 > MA20 상승추세 +20"
            );

        }

        else {

            reasons.push(
                "MA5 < MA20"
            );

        }


        // -----------------------------------
        // 3. MA20 vs MA60
        // -----------------------------------

        if (
            data.ma20 > data.ma60
        ) {

            score += 20;

            reasons.push(
                "MA20 > MA60 상승추세 +20"
            );

        }

        else {

            reasons.push(
                "MA20 < MA60"
            );

        }

    }


    // -----------------------------------
    // 4. 등락률
    // -----------------------------------

    if (
        data.change >= 5
    ) {

        score += 20;

        reasons.push(
            "등락률 강세 +20"
        );

    }

    else if (
        data.change > 2
    ) {

        score += 10;

        reasons.push(
            "등락률 상승 +10"
        );

    }

    else if (
        data.change > 0
    ) {

        reasons.push(
            "등락률 상승"
        );

    }

    else {

        reasons.push(
            "등락률 약세"
        );

    }


    // -----------------------------------
    // 5. 거래량
    // -----------------------------------

    if (
        data.volume >= 10000000
    ) {

        score += 20;

        reasons.push(
            "거래량 매우 활발 +20"
        );

    }

    else if (
        data.volume >= 1000000
    ) {

        score += 10;

        reasons.push(
            "거래량 활발 +10"
        );

    }

    else {

        reasons.push(
            "거래량 부족"
        );

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
                validMA,

            reasons:
                reasons

        }
    );


    return {

        score:
            score,

        signal:
            signal,

        validMA:
            validMA,

        reasons:
            reasons

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
    req.params.code.trim();

console.log(
    "STOCK REQUEST",
    code
);


// --------------------------------
// 종목코드 유효성 검사
// --------------------------------

if (!/^\d{6}$/.test(code)) {

    console.log(
        "INVALID STOCK CODE",
        code
    );

    return res.status(400).json({

        success:
            false,

        message:
            "종목코드는 6자리 숫자를 입력해주세요.",

        code:
            code

    });

}

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
// 일목균형표 조회
// --------------------------------

const ichimoku =
    await getIchimoku(
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
            // 데이터 상태
            // --------------------------------

            const dataStatus = {

                price:
                    "LIVE",

                daily:
                    ma.ma5 > 0 &&
                    ma.ma20 > 0 &&
                    ma.ma60 > 0
                        ? "CACHE_OR_LIVE"
                        : "UNAVAILABLE"

            };


            // --------------------------------
            // 최종 응답
            // --------------------------------

            res.json({

                success:
                    true,

                code:
                    code,

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

ichimoku:
    ichimoku,

analysis:
    analysis,

                dataStatus:
                    dataStatus

            });


        }

        catch (error) {


            console.log(
                "API ERROR",
                error.response?.data ||
                error.message
            );


            res.status(500).json({

                success:
                    false,

                message:
                    error.message

            });


        }

    }
);


// =======================================
// 서버 시작
// =======================================
// =======================================
// 자동 단타 후보 스캔
// 1차 테스트 버전
// 최대 10개 종목
// =======================================

app.get(
    "/api/scan",
    async (req, res) => {

        try {

            console.log(
                "AUTO SCAN START"
            );


           // --------------------------------
// stocks.json 전체 종목 사용
// --------------------------------

const codes =
    stocks.map(
        stock => stock.code
    );

            const results = [];


            // --------------------------------
            // 종목 순차 조회
            // API 제한 방지
            // --------------------------------

            for (
                const code of codes
            ) {

                try {

                    console.log(
                        "SCAN STOCK",
                        code
                    );


                    // 현재가

                    const stock =
                        await getCurrentPrice(
                            code
                        );


                    // 이동평균

                    const ma =
                        await getMovingAverage(
                            code
                        );


                    // AI 분석

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
// 유효한 MA 데이터 종목 후보 등록
// 점수순 정렬 후 TOP 10 반환
// --------------------------------

                   if (
    analysis.validMA
) {

    results.push({

                            code:
                                code,
name:
    stocks.find(
        item => item.code === code
    )?.name || "",

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

                            score:
                                analysis.score,

                            signal:
                                analysis.signal,

                            reasons:
                                analysis.reasons

                        });


                        console.log(
                            "SCAN CANDIDATE",
                            code,
                            analysis.score,
                            analysis.signal
                        );

                    }

                }

                catch (error) {

                    console.log(
                        "SCAN ERROR",
                        code,
                        error.message
                    );

                }

            }


            // --------------------------------
            // 점수 높은 순 정렬
            // --------------------------------

            results.sort(

                (
                    a,
                    b
                ) =>

                    b.score -
                    a.score

            );


            console.log(
                "AUTO SCAN COMPLETE",
                results.length
            );


            // --------------------------------
            // 최종 응답
            // --------------------------------

            res.json({

                success:
                    true,

                count:
                    results.length,

                results:
    results.slice(
        0,
        10
    )
            });


        }

        catch (error) {

            console.log(
                "SCAN API ERROR",
                error.message
            );


            res.status(
                500
            )
            .json({

                success:
                    false,

                message:
                    error.message

            });

        }

    }
);
app.listen(
    PORT,
    () => {

        console.log(
            `V12 Ultimate Server Running ${PORT}`
        );

    }
);
