import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";
import PropTypes from "prop-types";

const SalesAnalysis = ({
  csvPath,
  selectedDistrict,
  cityInfo,
  selectedIndustry,
}) => {
  const [chartData, setChartData] = useState(null);
  const [timeChartData, setTimeChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");
  const [countMessage2, setCountMessage2] = useState("");
  const [trendMessage2, setTrendMessage2] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, cityInfo, selectedDistrict, selectedIndustry);
      processAndSetTimeData(data, selectedDistrict, selectedIndustry);
    });
  }, [csvPath, cityInfo, selectedDistrict, selectedIndustry]);

  const processAndSetData = (
    data,
    cityInfo,
    selectedDistrict,
    selectedIndustry
  ) => {
    const columnsOfInterest = [
      "기준_년분기_코드",
      "자치구_코드_명",
      "행정동_코드_명",
      "category20",
      "당월_매출_건수",
      "당월_매출_금액",
      "점포_수",
    ];

    const dataExtracted = data
      .filter((d) => {
        const 분기 = Number(String(d["기준_년분기_코드"]).slice(4));
        return 분기 >= 1 && 분기 <= 4 && d["category20"] === selectedIndustry;
      })
      .map((d) => {
        const 분기 = Number(String(d["기준_년분기_코드"]).slice(4));
        return {
          기준_년분기_코드: +d["기준_년분기_코드"],
          자치구_코드_명: d["자치구_코드_명"],
          행정동_코드_명: d["행정동_코드_명"],
          당월_매출_건수: +d["당월_매출_건수"],
          당월_매출_금액: +d["당월_매출_금액"],
          점포_수: +d["점포_수"],
          기준_년분기: `${String(d["기준_년분기_코드"]).slice(
            0,
            4
          )}년 ${분기}분기`,
        };
      });

    // 2023년 4분기까지만 포함하도록 필터링
    const filteredData = dataExtracted.filter(
      (d) => d["기준_년분기_코드"] <= 20234
    );

    const calculateMeans = (data) => {
      return d3
        .groups(data, (d) => d["기준_년분기"])
        .map(([key, values]) => ({
          기준_년분기: key,
          당월_매출_건수:
            d3.sum(values, (d) => d["당월_매출_건수"]) /
            d3.sum(values, (d) => d["점포_수"]),
          당월_매출_금액:
            d3.sum(values, (d) => d["당월_매출_금액"]) /
            d3.sum(values, (d) => d["점포_수"]),
        }));
    };

    // 전체 평균 계산
    const meanAll = calculateMeans(filteredData);

    // 자치구 평균 계산
    const meanCity = calculateMeans(
      filteredData.filter((d) => d["자치구_코드_명"] === cityInfo)
    );

    // 특정 동 매출 데이터 필터링
    const districtData = filteredData.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    const meanDistrict = calculateMeans(districtData);

    // X축 라벨 중복 제거 및 정렬
    const labels = Array.from(
      new Set(meanAll.map((d) => d["기준_년분기"]))
    ).sort();

    setChartData({
      labels: labels,
      datasets: [
        {
          label: "서울시 평균",
          data: meanAll.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
          borderColor: "grey",
          fill: false,
          tension: 0.4,
        },
        {
          label: `${cityInfo} 평균`,
          data: meanCity.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
          borderColor: "orange",
          fill: false,
          tension: 0.4,
        },
        {
          label: `${selectedDistrict} 매출`,
          data: meanDistrict.map((d) => d["당월_매출_금액"] / 10000), // 단위 변환
          borderColor: "skyblue",
          fill: false,
          tension: 0.4,
        },
      ],
    });

    setCountMessage(`서울시, ${cityInfo}, ${selectedDistrict} 매출액`);

    const thirdQuarter = meanDistrict.find(
      (d) => d["기준_년분기"] === "2023년 3분기"
    );
    const fourthQuarter = meanDistrict.find(
      (d) => d["기준_년분기"] === "2023년 4분기"
    );

    if (thirdQuarter && fourthQuarter) {
      if (fourthQuarter["당월_매출_금액"] > thirdQuarter["당월_매출_금액"]) {
        setTrendMessage(
          `${selectedDistrict}의 매출이 전분기에 비해 증가하였습니다. 이를 바탕으로 더 많은 고객 유입을 위한 마케팅 전략을 강화하세요.`
        );
      } else if (
        fourthQuarter["당월_매출_금액"] < thirdQuarter["당월_매출_금액"]
      ) {
        setTrendMessage(
          `${selectedDistrict}의 매출이 전분기에 비해 감소하였습니다. 고객 유입을 늘리기 위해 새로운 프로모션을 고려해보세요.`
        );
      } else {
        setTrendMessage(
          `${selectedDistrict}의 매출이 전분기와 동일합니다. 안정적인 매출을 유지하며 추가적인 성장 전략을 계획해보세요.`
        );
      }
    } else {
      setTrendMessage(
        `${selectedDistrict}의 2023년 3분기 또는 4분기 데이터가 부족합니다.`
      );
    }
  };

  const processAndSetTimeData = (data, selectedDistrict, selectedIndustry) => {
    const columns = [
      "자치구_코드_명",
      "행정동_코드_명",
      "category20",
      "시간대_00~06_매출_금액",
      "시간대_06~11_매출_금액",
      "시간대_11~14_매출_금액",
      "시간대_14~17_매출_금액",
      "시간대_17~21_매출_금액",
      "시간대_21~24_매출_금액",
    ];

    const dataExtracted = data
      .filter((d) => d["category20"] === selectedIndustry)
      .map((d) => ({
        자치구_코드_명: d["자치구_코드_명"],
        행정동_코드_명: d["행정동_코드_명"],
        category20: d["category20"],
        시간대_00_06_매출_금액: +d["시간대_00~06_매출_금액"],
        시간대_06_11_매출_금액: +d["시간대_06~11_매출_금액"],
        시간대_11_14_매출_금액: +d["시간대_11~14_매출_금액"],
        시간대_14_17_매출_금액: +d["시간대_14~17_매출_금액"],
        시간대_17_21_매출_금액: +d["시간대_17~21_매출_금액"],
        시간대_21_24_매출_금액: +d["시간대_21~24_매출_금액"],
      }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["시간대_00_06_매출_금액"] += cur["시간대_00_06_매출_금액"];
          acc["시간대_06_11_매출_금액"] += cur["시간대_06_11_매출_금액"];
          acc["시간대_11_14_매출_금액"] += cur["시간대_11_14_매출_금액"];
          acc["시간대_14_17_매출_금액"] += cur["시간대_14_17_매출_금액"];
          acc["시간대_17_21_매출_금액"] += cur["시간대_17_21_매출_금액"];
          acc["시간대_21_24_매출_금액"] += cur["시간대_21_24_매출_금액"];
          return acc;
        },
        {
          시간대_00_06_매출_금액: 0,
          시간대_06_11_매출_금액: 0,
          시간대_11_14_매출_금액: 0,
          시간대_14_17_매출_금액: 0,
          시간대_17_21_매출_금액: 0,
          시간대_21_24_매출_금액: 0,
        }
      );

      const totalSales = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const timeMapping = {
        시간대_00_06_매출_금액: "00~06시",
        시간대_06_11_매출_금액: "06~11시",
        시간대_11_14_매출_금액: "11~14시",
        시간대_14_17_매출_금액: "14~17시",
        시간대_17_21_매출_금액: "17~21시",
        시간대_21_24_매출_금액: "21~24시",
      };

      const labels = Object.keys(summedData).map((key) => timeMapping[key]);
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalSales) * 100
      );

      setTimeChartData({
        labels,
        datasets: [
          {
            label: `${selectedDistrict} ${selectedIndustry} 업종 시간대별 매출 비율 (%)`,
            data: dataValues,
            borderColor: "purple",
            backgroundColor: "rgba(128, 0, 128, 0.3)",
            fill: true,
            tension: 0.4,
          },
        ],
      });

      // 가장 매출이 많은 시간대 계산
      const maxTimePeriodIndex = dataValues.indexOf(Math.max(...dataValues));
      const maxTimePeriod = labels[maxTimePeriodIndex];

      setCountMessage2(
        `${selectedDistrict}은 ${maxTimePeriod}에 가장 많은 매출액이 발생합니다.`
      );

      // 시간대별 매출액에 따른 조언 추가
      if (maxTimePeriod === "00~06시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 심야 시간대에 집중하여 운영하는 것이 유리할 수 있습니다. 24시간 영업이나 심야 할인 이벤트를 고려해보세요.`
        );
      } else if (maxTimePeriod === "06~11시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 아침 시간대의 고객을 대상으로 한 프로모션이나 아침 메뉴 개발을 고려해보세요.`
        );
      } else if (maxTimePeriod === "11~14시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 점심 시간대에 맞춘 메뉴와 빠른 서비스를 제공하는 것이 좋습니다.`
        );
      } else if (maxTimePeriod === "14~17시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 오후 시간대에 적합한 마케팅 전략을 수립해보세요. 브런치나 커피 관련 이벤트를 고려해보세요.`
        );
      } else if (maxTimePeriod === "17~21시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 저녁 시간대에 맞춘 다양한 메뉴와 이벤트를 기획해보세요.`
        );
      } else if (maxTimePeriod === "21~24시") {
        setTrendMessage2(
          `${maxTimePeriod} 시간대에 가장 매출이 높습니다. 늦은 시간대까지 영업하며 야간 고객을 유치할 수 있는 전략을 세워보세요.`
        );
      }
    }
  };

  return (
    <div>
      <AnalysisContainer>
        <CountMessage>{countMessage}</CountMessage>
        <TrendMessage>{trendMessage}</TrendMessage>
        <ChartContainer>
          {chartData && (
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "기준 년분기",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "평균 매출액 (만원)",
                    },
                  },
                },
              }}
            />
          )}
        </ChartContainer>
      </AnalysisContainer>
      <AnalysisContainer>
        <CountMessage>{countMessage2}</CountMessage>
        <TrendMessage>{trendMessage2}</TrendMessage>
        <ChartContainer>
          {timeChartData && (
            <Line
              data={timeChartData}
              options={{
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "시간대",
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "매출 비율 (%)",
                    },
                  },
                },
              }}
            />
          )}
        </ChartContainer>
      </AnalysisContainer>
    </div>
  );
};

SalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  cityInfo: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default SalesAnalysis;

const div = styled.div`
  display: flex;
`;

const AnalysisContainer = styled.div`
  border: 3px solid #ddd;
  padding: 30px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const CountMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  text-align: start;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  margin: 15px 0 50px 0;
  text-align: start;
  color: red;
  line-height: 1.5;
`;
