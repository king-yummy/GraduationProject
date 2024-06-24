import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const WeekPopulationAnalysis = ({ csvPath, selectedDistrict }) => {
  const [weekChartData, setWeekChartData] = useState(null);
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        processWeekData(result.data, selectedDistrict);
      },
    });
  }, [csvPath, selectedDistrict]);

  const processWeekData = (data, selectedDistrict) => {
    const columns = [
      "자치구_코드_명",
      "행정동_코드_명",
      "월요일_유동인구_수",
      "화요일_유동인구_수",
      "수요일_유동인구_수",
      "목요일_유동인구_수",
      "금요일_유동인구_수",
      "토요일_유동인구_수",
      "일요일_유동인구_수",
    ];

    const dataExtracted = data.map((d) => ({
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      월요일_유동인구_수: +d["월요일_유동인구_수"],
      화요일_유동인구_수: +d["화요일_유동인구_수"],
      수요일_유동인구_수: +d["수요일_유동인구_수"],
      목요일_유동인구_수: +d["목요일_유동인구_수"],
      금요일_유동인구_수: +d["금요일_유동인구_수"],
      토요일_유동인구_수: +d["토요일_유동인구_수"],
      일요일_유동인구_수: +d["일요일_유동인구_수"],
    }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["월요일_유동인구_수"] += cur["월요일_유동인구_수"];
          acc["화요일_유동인구_수"] += cur["화요일_유동인구_수"];
          acc["수요일_유동인구_수"] += cur["수요일_유동인구_수"];
          acc["목요일_유동인구_수"] += cur["목요일_유동인구_수"];
          acc["금요일_유동인구_수"] += cur["금요일_유동인구_수"];
          acc["토요일_유동인구_수"] += cur["토요일_유동인구_수"];
          acc["일요일_유동인구_수"] += cur["일요일_유동인구_수"];
          return acc;
        },
        {
          월요일_유동인구_수: 0,
          화요일_유동인구_수: 0,
          수요일_유동인구_수: 0,
          목요일_유동인구_수: 0,
          금요일_유동인구_수: 0,
          토요일_유동인구_수: 0,
          일요일_유동인구_수: 0,
        }
      );

      const totalPopulation = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const weekMapping = {
        월요일_유동인구_수: "월요일",
        화요일_유동인구_수: "화요일",
        수요일_유동인구_수: "수요일",
        목요일_유동인구_수: "목요일",
        금요일_유동인구_수: "금요일",
        토요일_유동인구_수: "토요일",
        일요일_유동인구_수: "일요일",
      };

      const labels = Object.keys(summedData).map((key) => weekMapping[key]);
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalPopulation) * 100
      );

      // Find the index of the max value
      const maxIndex = dataValues.indexOf(Math.max(...dataValues));

      // Set colors, highlight the day with the max value
      const backgroundColors = dataValues.map((_, index) =>
        index === maxIndex ? "skyblue" : "grey"
      );

      setWeekChartData({
        labels,
        datasets: [
          {
            label: `${selectedDistrict} 요일별 유동인구 비율 (%)`,
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((color) =>
              color === "skyblue" ? "blue" : "grey"
            ),
            borderWidth: 1,
          },
        ],
      });

      // Calculate the trend message
      const maxDay = labels[maxIndex];
      setTrendMessage(`가장 많은 유동인구가 발생하는 요일은 ${maxDay}입니다.`);
    }
  };

  return (
    <AnalysisContainer>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {weekChartData && (
          <Bar data={weekChartData} options={{ maintainAspectRatio: false }} />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

WeekPopulationAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default WeekPopulationAnalysis;

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
  margin-bottom: 20px;
  text-align: start;
  color: #474242;
`;
