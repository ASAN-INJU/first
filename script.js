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

let isSearching = false;


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


            stockCode.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        searchStock();

                    }

                }
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
   종목 찾기
   이름 또는 코드
===================================== */

function findStock(input) {

    const keyword =
        String(
            input || ""
        )
        .trim()
        .toLowerCase();


    if (
        !keyword
    ) {

        return null;

    }


    return stocks.find(
        stock => {

            const name =
                String(
                    stock.name || ""
                )
                .trim()
                .toLowerCase();


            const code =
                String(
                    stock.code || ""
                )
                .trim()
                .toLowerCase();


            return (
                name === keyword ||
                code === keyword
            );

        }
    );

}


/* =====================================
   자동완성
   종목명 + 종목코드 검색
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


    if (
        !inputElement ||
        !box
    ) {

        return;

    }


    const input =
        inputElement.value
            .trim()
            .toLowerCase();


    box.innerHTML =
        "";


    if (
        input.length < 1
    ) {

        return;

    }


    const result =
        stocks
            .filter(
                stock => {

                    const name =
                        String(
                            stock.name || ""
                        )
                        .toLowerCase();


                    const code =
                        String(
                            stock.code || ""
                        )
                        .toLowerCase();


                    return (

                        name.includes(
                            input
                        )

                        ||

                        code.includes(
                            input
                        )

                    );

                }
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
                        stock.name;


                    inputElement.dataset.stockName =
                        stock.name;


                    inputElement.dataset.stockCode =
                        stock.code;


                    box.innerHTML =
                        "";


                    console.log(
                        "종목 선택:",
                        stock.name,
                        stock.code
                    );

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
   종목명 + 종목코드 검색
===================================== */

async function searchStock() {

    /* ---------------------------------
       중복 검색 방지
    --------------------------------- */

    if (
        isSearching
    ) {

        console.log(
            "이미 조회 중입니다."
        );

        return;

    }


    const inputElement =
        document.getElementById(
            "stockCode"
        );


    if (
        !inputElement
    ) {

        alert(
            "종목 입력창을 찾을 수 없습니다."
        );

        return;

    }


    let input =
        inputElement.value
            .trim();


    if (
        !input
    ) {

        alert(
            "종목명 또는 종목코드를 입력하세요."
        );

        return;

    }


    /* ---------------------------------
       종목명 또는 코드 검색
    --------------------------------- */

    let stock =
        findStock(
            input
        );


    let code =
        "";


    let stockName =
        "";


    /* ---------------------------------
       stocks.json에서 종목 찾음
    --------------------------------- */

    if (
        stock
    ) {

        code =
            String(
                stock.code
            )
            .trim();


        stockName =
            stock.name;


        console.log(
            "종목 변환 성공:",
            stockName,
            "→",
            code
        );

    }


    /* ---------------------------------
       자동완성 선택 데이터 사용
    --------------------------------- */

    else if (
        inputElement.dataset.stockCode
    ) {

        code =
            inputElement.dataset.stockCode;


        stockName =
            inputElement.dataset.stockName ||
            input;

    }


    /* ---------------------------------
       6자리 숫자 코드 직접 입력
    --------------------------------- */

    else if (
        /^\d{6}$/.test(
            input
        )
    ) {

        code =
            input;


        const codeStock =
            findStock(
                code
            );


        if (
            codeStock
        ) {

            stockName =
                codeStock.name;

        }

    }


    /* ---------------------------------
       종목을 찾지 못함
    --------------------------------- */

    else {

        console.log(
            "INVALID STOCK INPUT",
            input
        );


        alert(

            "종목을 찾을 수 없습니다.\n\n" +

            "종목명 또는 6자리 종목코드를\n" +

            "정확하게 입력해주세요."

        );


        return;

    }


    /* ---------------------------------
       최종 코드 검증
    --------------------------------- */

    if (
        !/^\d{6}$/.test(
            code
        )
    ) {

        console.log(
            "INVALID STOCK CODE",
            code
        );


        alert(
            "잘못된 종목코드입니다."
        );


        return;

    }


    /* ---------------------------------
       입력창 표시
    --------------------------------- */

    inputElement.value =
        code;


    inputElement.dataset.stockCode =
        code;


    inputElement.dataset.stockName =
        stockName;


    console.log(
        "주식 조회 시작:",
        stockName ||
        "종목명 없음",
        code
    );


    /* ---------------------------------
       API 요청
    --------------------------------- */

    const apiUrl =
        `${API_SERVER}/api/stock/${encodeURIComponent(code)}`;


    console.log(
        "API 요청:",
        apiUrl
    );


    isSearching =
        true;


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


        if (
            !response.ok
        ) {

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


        /* ---------------------------------
           종목명 추가
        --------------------------------- */

        if (
            stockName &&
            !data.name
        ) {

            data.name =
                stockName;

        }


        /* ---------------------------------
           화면 표시
        --------------------------------- */

        displayStock(
            data
        );


    }

    catch (
        error
    ) {

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

    finally {

        isSearching =
            false;

    }

}


/* =====================================
   주식 데이터 화면 표시
===================================== */

function displayStock(
    data
) {

    /* ---------------------------------
       화면 요소
    --------------------------------- */

    const stockNameElement =
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


    /* ---------------------------------
       데이터 상태 요소
    --------------------------------- */

    const priceStatus =
        document.getElementById(
            "priceStatus"
        );


    const dailyStatus =
        document.getElementById(
            "dailyStatus"
        );


    /* ---------------------------------
       종목명
    --------------------------------- */

    if (
        stockNameElement
    ) {

        stockNameElement.innerText =
            data.name ||
            data.code ||
            "종목";

    }


    /* ---------------------------------
       현재가
    --------------------------------- */

    if (
        price
    ) {

        price.innerText =
            Number(
                data.price || 0
            )
            .toLocaleString() +
            "원";

    }


    /* ---------------------------------
       등락률
    --------------------------------- */

    if (
        change
    ) {

        const changeValue =
            Number(
                data.change || 0
            );


        change.innerText =
            changeValue +
            "%";

    }


    /* ---------------------------------
       거래량
    --------------------------------- */

    if (
        volume
    ) {

        volume.innerText =
            Number(
                data.volume || 0
            )
            .toLocaleString();

    }


    /* ---------------------------------
       MA5
    --------------------------------- */

    if (
        ma5
    ) {

        ma5.innerText =
            data.ma5 > 0

                ?

                Number(
                    data.ma5
                )
                .toLocaleString()

                :

                "-";

    }


    /* ---------------------------------
       MA20
    --------------------------------- */

    if (
        ma20
    ) {

        ma20.innerText =
            data.ma20 > 0

                ?

                Number(
                    data.ma20
                )
                .toLocaleString()

                :

                "-";

    }


    /* ---------------------------------
       MA60
    --------------------------------- */

    if (
        ma60
    ) {

        ma60.innerText =
            data.ma60 > 0

                ?

                Number(
                    data.ma60
                )
                .toLocaleString()

                :

                "-";

    }


    /* ---------------------------------
       현재가 상태
    --------------------------------- */

    if (
        priceStatus
    ) {

        priceStatus.innerText =
            data.dataStatus?.price ||
            "UNKNOWN";

    }


    /* ---------------------------------
       일봉 상태
    --------------------------------- */

    if (
        dailyStatus
    ) {

        dailyStatus.innerText =
            data.dataStatus?.daily ||
            "UNKNOWN";

    }


    /* ---------------------------------
       AI 분석
    --------------------------------- */

    analyzeStock(
        data
    );


    /* ---------------------------------
       차트
    --------------------------------- */

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

    /* ---------------------------------
       서버 AI 분석 결과 사용
    --------------------------------- */

    let score =
        0;


    let signal =
        "데이터부족";


    let validMA =
        false;


    if (
        data.analysis
    ) {

        score =
            Number(
                data.analysis.score || 0
            );


        signal =
            data.analysis.signal ||
            "관망";


        validMA =
            data.analysis.validMA ===
            true;

    }


    /* ---------------------------------
       화면 요소
    --------------------------------- */

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


    /* ---------------------------------
       점수
    --------------------------------- */

    if (
        scoreElement
    ) {

        scoreElement.innerText =
            score +
            "점";

    }


    /* ---------------------------------
       신호
    --------------------------------- */

    if (
        recommendElement
    ) {

        recommendElement.innerText =
            signal;

    }


    /* ---------------------------------
       상세 분석
    --------------------------------- */

    if (
        analysisElement
    ) {

        if (
            !validMA
        ) {

            analysisElement.innerText =

`AI 분석 결과

점수 : ${score}점

현재가 : ${Number(
    data.price || 0
).toLocaleString()}원

등락률 : ${Number(
    data.change || 0
)}%

거래량 : ${Number(
    data.volume || 0
).toLocaleString()}

MA 데이터가 부족합니다.

현재 단타 분석을 진행할 수 없습니다.`;

        }

        else {

            analysisElement.innerText =

`AI 분석 결과

점수 : ${score}점

현재가 : ${Number(
    data.price || 0
).toLocaleString()}원

등락률 : ${Number(
    data.change || 0
)}%

거래량 : ${Number(
    data.volume || 0
).toLocaleString()}

MA5 : ${Number(
    data.ma5 || 0
).toLocaleString()}

MA20 : ${Number(
    data.ma20 || 0
).toLocaleString()}

MA60 : ${Number(
    data.ma60 || 0
).toLocaleString()}

판정 : ${signal}

단타 기준 참고용 분석입니다.`;

        }

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

                        "MA60",

                        "MA20",

                        "MA5",

                        "현재가"

                    ],


                    datasets: [

                        {

                            label:
                                "주가 / 이동평균",


                            data: [

                                Number(
                                    data.ma60 ||
                                    0
                                ),

                                Number(
                                    data.ma20 ||
                                    0
                                ),

                                Number(
                                    data.ma5 ||
                                    0
                                ),

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
                        false,


                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    }

                }

            }
        );

}
