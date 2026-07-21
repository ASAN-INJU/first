/* =====================================
   V12 Ultimate
   AI 주식 단타 분석 시스템
   script.js
===================================== */


/* =====================================
   Render API 서버
===================================== */

const API_SERVER =
    "https://first-gqm8.onrender.com";


/* =====================================
   전역 변수
===================================== */

let stocks = [];

let chart = null;


/* =====================================
   페이지 시작
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadStocks();


        const searchBtn =
            document.getElementById(
                "searchBtn"
            );


        if (searchBtn) {

            searchBtn.addEventListener(
                "click",
                searchStock
            );

        }


        const stockCode =
            document.getElementById(
                "stockCode"
            );


        if (stockCode) {

            stockCode.addEventListener(
                "input",
                autoComplete
            );

        }

    }
);


/* =====================================
   종목 리스트 불러오기
===================================== */

async function loadStocks() {

    try {

        const response =
            await fetch(
                "stocks.json"
            );


        if (!response.ok) {

            throw new Error(
                "stocks.json 불러오기 실패"
            );

        }


        stocks =
            await response.json();


        console.log(
            "종목 리스트 로딩 완료",
            stocks.length
        );

    }

    catch (error) {

        console.error(
            "종목 리스트 오류",
            error
        );

        stocks = [];

    }

}


/* =====================================
   자동완성
===================================== */

function autoComplete() {

    const inputElement =
        document.getElementById(
            "stockCode"
        );


    const box =
        document.getElementById(
            "suggestions"
        );


    if (!inputElement || !box) {

        return;

    }


    const input =
        inputElement.value
        .trim();


    box.innerHTML = "";


    if (
        input.length < 1
    ) {

        return;

    }


    const result =
        stocks
        .filter(
            stock =>

                String(
                    stock.name || ""
                )
                .includes(input)

                ||

                String(
                    stock.code || ""
                )
                .includes(input)
        )
        .slice(
            0,
            10
        );


    result.forEach(
        stock => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "suggestion-item";


            div.innerText =
                `${stock.name} (${stock.code})`;


            div.addEventListener(
                "click",
                () => {

                    inputElement.value =
                        stock.code;


                    box.innerHTML =
                        "";

                }
            );


            box.appendChild(
                div
            );

        }
    );

}


/* =====================================
   주식 조회
===================================== */

async function searchStock() {

    const inputElement =
        document.getElementById(
            "stockCode"
        );


    if (!inputElement) {

        alert(
            "종목 입력창을 찾을 수 없습니다."
        );

        return;

    }


    const code =
        inputElement.value
        .trim();


    if (!code) {

        alert(
            "종목코드를 입력하세요."
        );

        return;

    }


    console.log(
        "주식 조회 시작:",
        code
    );


    const apiUrl =
        `${API_SERVER}/api/stock/${encodeURIComponent(code)}`;


    console.log(
        "API 요청:",
        apiUrl
    );


    try {

        const response =
            await fetch(
                apiUrl,
                {
                    method:
                        "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "API 응답 상태:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `서버 응답 오류: ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "API 데이터:",
            data
        );


        if (
            data.success === false
        ) {

            alert(
                data.message ||
                "주가 조회에 실패했습니다."
            );

            return;

        }


        displayStock(
            data
        );


    }

    catch (error) {

        console.error(
            "주식 조회 오류:",
            error
        );


        alert(
            "서버 연결 실패\n\n" +
            "API 서버:\n" +
            API_SERVER +
            "\n\n" +
            "오류:\n" +
            error.message
        );

    }

}


/* =====================================
   화면 표시
===================================== */

function displayStock(
    data
) {

    const stockName =
        document.getElementById(
            "stockName"
        );


    const price =
        document.getElementById(
            "price"
        );


    const change =
        document.getElementById(
            "change"
        );


    const volume =
        document.getElementById(
            "volume"
        );


    const ma5 =
        document.getElementById(
            "ma5"
        );


    const ma20 =
        document.getElementById(
            "ma20"
        );


    const ma60 =
        document.getElementById(
            "ma60"
        );


    if (stockName) {

        stockName.innerText =
            data.name ||
            data.code ||
            "종목";

    }


    if (price) {

        price.innerText =
            Number(
                data.price || 0
            )
            .toLocaleString() +
            "원";

    }


    if (change) {

        change.innerText =
            Number(
                data.change || 0
            ) +
            "%";

    }


    if (volume) {

        volume.innerText =
            Number(
                data.volume || 0
            )
            .toLocaleString();

    }


    if (ma5) {

        ma5.innerText =
            data.ma5 ??
            "-";

    }


    if (ma20) {

        ma20.innerText =
            data.ma20 ??
            "-";

    }


    if (ma60) {

        ma60.innerText =
            data.ma60 ??
            "-";

    }


    analyzeStock(
        data
    );


    drawChart(
        data
    );

}


/* =====================================
   AI 단타 점수 분석
===================================== */

function analyzeStock(
    data
) {

    /*
       서버에서 계산한 AI 분석 결과가 있으면
       서버 결과를 우선 사용합니다.
    */


    let score = 50;

    let signal =
        "관망";


    if (
        data.analysis
        &&
        typeof data.analysis.score
            !== "undefined"
    ) {

        score =
            Number(
                data.analysis.score
            );


        signal =
            data.analysis.signal ||
            "관망";

    }

    else {

        const change =
            Number(
                data.change || 0
            );


        const volume =
            Number(
                data.volume || 0
            );


        if (
            change > 2
        ) {

            score += 10;

        }


        if (
            change < -3
        ) {

            score -= 10;

        }


        if (
            volume > 1000000
        ) {

            score += 10;

        }


        if (
            score > 100
        ) {

            score = 100;

        }


        if (
            score < 0
        ) {

            score = 0;

        }


        if (
            score >= 80
        ) {

            signal =
                "매수 관심";

        }

        else if (
            score >= 60
        ) {

            signal =
                "상승관찰";

        }

        else {

            signal =
                "약세";

        }

    }


    const scoreElement =
        document.getElementById(
            "score"
        );


    const recommendElement =
        document.getElementById(
            "recommend"
        );


    const analysisElement =
        document.getElementById(
            "analysis"
        );


    if (scoreElement) {

        scoreElement.innerText =
            score +
            "점";

    }


    if (recommendElement) {

        recommendElement.innerText =
            signal;

    }


    if (analysisElement) {

        analysisElement.innerText =

`AI 분석 결과

점수 : ${score}점

등락률 : ${Number(
    data.change || 0
)}%

거래량 : ${Number(
    data.volume || 0
).toLocaleString()}

MA5 : ${data.ma5 ?? "-"}

MA20 : ${data.ma20 ?? "-"}

MA60 : ${data.ma60 ?? "-"}

판정 : ${signal}

단타 기준 참고용 분석입니다.`;

    }

}


/* =====================================
   차트
===================================== */

function drawChart(
    data
) {

    const canvas =
        document.getElementById(
            "priceChart"
        );


    if (
        !canvas
    ) {

        console.log(
            "priceChart 없음"
        );

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js가 로드되지 않았습니다."
        );

        return;

    }


    if (
        chart
    ) {

        chart.destroy();

        chart = null;

    }


    chart =
        new Chart(
            canvas,
            {

                type:
                    "line",


                data: {

                    labels: [
                        "현재"
                    ],


                    datasets: [

                        {

                            label:
                                "현재가",


                            data: [

                                Number(
                                    data.price ||
                                    0
                                )

                            ]

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false

                }

            }
        );

}
