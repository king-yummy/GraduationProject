import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";
import { Chart, Filler } from "chart.js";

// Filler 플러그인 등록
Chart.register(Filler);

const PopulationAnalysis = ({ csvPath, selectedDistrict, cityInfo }) => {
  const [chartData, setChartData] = useState(null);
  const [timeChartData, setTimeChartData] = useState(null);
  const [countMessage, setCountMessage] = useState("");
  const [trendMessage, setTrendMessage] = useState("");
  const [countMessage2, setCountMessage2] = useState("");
  const [trendMessage2, setTrendMessage2] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, cityInfo, selectedDistrict);
      processAndSetTimeData(data, selectedDistrict);
    });
  }, [csvPath, cityInfo, selectedDistrict]);

  const processAndSetData = (data, cityInfo, selectedDistrict) => {
    const filteredData = data.filter((d) => +d["기준_년분기_코드"] > 20230);

    const dataExtracted = filteredData.map((d) => ({
      기준_년분기_코드: +d["기준_년분기_코드"],
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      총_유동인구_수: +d["총_유동인구_수"],
      기준_년분기: `${String(d["기준_년분기_코드"]).slice(0, 4)}년 ${Number(
        String(d["기준_년분기_코드"]).slice(4)
      )}분기`,
    }));

    const cityData = dataExtracted.filter(
      (d) => d["자치구_코드_명"] === cityInfo
    );

    const groupedCityData = d3
      .groups(cityData, (d) => d["기준_년분기_코드"])
      .flatMap(([기준_년분기_코드, 기준_년분기_코드_group]) =>
        d3
          .groups(기준_년분기_코드_group, (d) => d["자치구_코드_명"])
          .flatMap(([자치구_코드_명, 자치구_코드_명_group]) =>
            d3
              .groups(자치구_코드_명_group, (d) => d["행정동_코드_명"])
              .map(([행정동_코드_명, 행정동_코드_명_group]) => ({
                기준_년분기_코드,
                자치구_코드_명,
                행정동_코드_명,
                총_유동인구_수: d3.sum(
                  행정동_코드_명_group,
                  (d) => d["총_유동인구_수"]
                ),
                기준_년분기: 행정동_코드_명_group[0]["기준_년분기"],
              }))
          )
      );

    // 서울시 전체 평균 계산
    const meanAll = d3
      .groups(dataExtracted, (d) => d["기준_년분기_코드"])
      .map(([key, value]) => ({
        기준_년분기_코드: key,
        총_유동인구_수:
          d3.sum(value, (d) => d["총_유동인구_수"]) /
          new Set(value.map((d) => d["행정동_코드_명"])).size,
        기준_년분기: value[0]["기준_년분기"],
      }));

    // 자치구 평균 계산
    const meanCity = d3
      .groups(groupedCityData, (d) => d["기준_년분기"])
      .map(([key, value]) => ({
        기준_년분기: key,
        총_유동인구_수:
          d3.sum(value, (d) => d["총_유동인구_수"]) /
          new Set(value.map((d) => d["행정동_코드_명"])).size,
      }));

    const districtData = groupedCityData.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    setChartData({
      labels: meanAll.map((d) => d["기준_년분기"]),
      datasets: [
        {
          label: "서울시",
          data: meanAll.map((d) => d["총_유동인구_수"] / 10000),
          borderColor: "grey",
          fill: false,
          tension: 0.4,
        },
        {
          label: cityInfo,
          data: meanCity.map((d) => d["총_유동인구_수"] / 10000),
          borderColor: "orange",
          fill: false,
          tension: 0.4,
        },
        {
          label: selectedDistrict,
          data: districtData.map((d) => d["총_유동인구_수"] / 10000),
          borderColor: "skyblue",
          fill: false,
          tension: 0.4,
        },
      ],
    });

    const thirdQuarter = districtData.find(
      (d) => d["기준_년분기_코드"] === 20233
    );
    const fourthQuarter = districtData.find(
      (d) => d["기준_년분기_코드"] === 20234
    );

    if (thirdQuarter && fourthQuarter) {
      if (fourthQuarter["총_유동인구_수"] > thirdQuarter["총_유동인구_수"]) {
        setCountMessage(`${selectedDistrict}의 유동인구가 전분기에 비해 증가했습니다.`)
        setTrendMessage(
          `신규 고객 유입이 활발하니 마케팅을 강화할 좋은 기회입니다.`
        );
      } else if (
        fourthQuarter["총_유동인구_수"] < thirdQuarter["총_유동인구_수"]
      ) {
        setCountMessage(`${selectedDistrict}의 유동인구가 전분기에 비해 감소했습니다.`)
        setTrendMessage(
          `감소한 유동인구에 대비하고, 고객 유입에 유의하세요.`
        );
      } else {
        setCountMessage(`${selectedDistrict}의 유동인구가 전분기와 동일합니다.`)
        setTrendMessage(
          `안정적인 유동인구를 바탕으로 추가적인 성장 전략을 고려해보세요.`
        );
      }
    } else {
      setTrendMessage(
        `${selectedDistrict}의 23년 3분기 또는 4분기 데이터가 부족합니다.`
      );
    }
  };

  const processAndSetTimeData = (data, selectedDistrict) => {
    const columns = [
      "자치구_코드_명",
      "행정동_코드_명",
      "시간대_00_06_유동인구_수",
      "시간대_06_11_유동인구_수",
      "시간대_11_14_유동인구_수",
      "시간대_14_17_유동인구_수",
      "시간대_17_21_유동인구_수",
      "시간대_21_24_유동인구_수",
    ];

    const dataExtracted = data.map((d) => ({
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      시간대_00_06_유동인구_수: +d["시간대_00_06_유동인구_수"],
      시간대_06_11_유동인구_수: +d["시간대_06_11_유동인구_수"],
      시간대_11_14_유동인구_수: +d["시간대_11_14_유동인구_수"],
      시간대_14_17_유동인구_수: +d["시간대_14_17_유동인구_수"],
      시간대_17_21_유동인구_수: +d["시간대_17_21_유동인구_수"],
      시간대_21_24_유동인구_수: +d["시간대_21_24_유동인구_수"],
    }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["시간대_00_06_유동인구_수"] += cur["시간대_00_06_유동인구_수"];
          acc["시간대_06_11_유동인구_수"] += cur["시간대_06_11_유동인구_수"];
          acc["시간대_11_14_유동인구_수"] += cur["시간대_11_14_유동인구_수"];
          acc["시간대_14_17_유동인구_수"] += cur["시간대_14_17_유동인구_수"];
          acc["시간대_17_21_유동인구_수"] += cur["시간대_17_21_유동인구_수"];
          acc["시간대_21_24_유동인구_수"] += cur["시간대_21_24_유동인구_수"];
          return acc;
        },
        {
          시간대_00_06_유동인구_수: 0,
          시간대_06_11_유동인구_수: 0,
          시간대_11_14_유동인구_수: 0,
          시간대_14_17_유동인구_수: 0,
          시간대_17_21_유동인구_수: 0,
          시간대_21_24_유동인구_수: 0,
        }
      );

      const totalPopulation = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const timeMapping = {
        시간대_00_06_유동인구_수: "00-06시",
        시간대_06_11_유동인구_수: "06-11시",
        시간대_11_14_유동인구_수: "11-14시",
        시간대_14_17_유동인구_수: "14-17시",
        시간대_17_21_유동인구_수: "17-21시",
        시간대_21_24_유동인구_수: "21-24시",
      };

      const labels = Object.keys(summedData).map((key) => timeMapping[key]);
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalPopulation) * 100
      );

      setTimeChartData({
        labels,
        datasets: [
          {
            label: `${selectedDistrict} 시간대별 유동인구 비율 (%)`,
            data: dataValues,
            borderColor: "purple",
            fill: true,
            backgroundColor: "rgba(128, 0, 128, 0.3)",
            tension: 0.4,
          },
        ],
      });

      // 가장 유동인구가 많은 시간대 계산
      const maxTimePeriodIndex = dataValues.indexOf(Math.max(...dataValues));
      const maxTimePeriod = labels[maxTimePeriodIndex];

      setCountMessage2(
        `${selectedDistrict}은 ${maxTimePeriod}에 가장 많은 사람들이 움직입니다.`
      );

      if (maxTimePeriod === "00-06시") {
        setTrendMessage2(
          `이 시간대에는 야간 영업이 유리할 수 있습니다. 심야 시간대의 편의점, 24시간 카페, 배달 음식점 등을 고려해보세요.`
        );
      } else if (maxTimePeriod === "06-11시") {
        setTrendMessage2(
          `아침 시간대에 맞춰 영업을 준비하세요. 직장인들을 위한 아침 식사 메뉴나 커피 전문점을 운영하는 것이 좋습니다.`
        );
      } else if (maxTimePeriod === "11-14시") {
        setTrendMessage2(
          `점심 시간대에 많은 고객을 유치할 수 있습니다. 점심 식사 중심의 레스토랑이나 패스트푸드점을 고려해보세요.`
        );
      } else if (maxTimePeriod === "14-17시") {
        setTrendMessage2(
          `오후 시간대에 대비한 마케팅 전략을 고려해보세요. 오후의 여유로운 시간을 보내기 위한 디저트 카페나 소규모 쇼핑 매장이 유리할 수 있습니다.`
        );
      } else if (maxTimePeriod === "17-21시") {
        setTrendMessage2(
          `저녁 시간대에 맞춘 영업 전략이 필요합니다. 저녁 식사와 함께 즐길 수 있는 레스토랑이나 펍, 와인 바 등을 운영해보세요.`
        );
      } else if (maxTimePeriod === "21-24시") {
        setTrendMessage2(
          `늦은 시간대의 고객 유입을 위한 준비가 필요합니다. 늦은 시간까지 영업하는 음식점이나 야간 쇼핑을 위한 편의점을 고려해보세요.`
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
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
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
              options={{ maintainAspectRatio: false }}
            />
          )}
        </ChartContainer>
      </AnalysisContainer>
    </div>
  );
};

export default PopulationAnalysis;

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
