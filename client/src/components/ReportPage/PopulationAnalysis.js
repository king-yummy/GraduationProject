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
    }
  };

  return (
    <AnalysisContainer>
      <CountMessage>유동인구 수</CountMessage>
      <TrendMessage>분기별 유동인구 수 (만 명)</TrendMessage>
      <ChartContainer>
        {chartData && (
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        )}
      </ChartContainer>
      <TrendMessage>시간대별 유동인구 수 (2023년 4분기 기준)</TrendMessage>
      <ChartContainer>
        {timeChartData && (
          <Line data={timeChartData} options={{ maintainAspectRatio: false }} />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

export default PopulationAnalysis;

const AnalysisContainer = styled.div`
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const CountMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: start;
  color: #000000;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  margin: 20px 0;
  text-align: start;
  color: #474242;
`;
