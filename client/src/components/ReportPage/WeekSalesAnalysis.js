import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const WeekSalesAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [weekChartData, setWeekChartData] = useState(null);
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    Papa.parse(csvPath, {
      download: true,
      header: true,
      complete: (result) => {
        processWeekData(result.data, selectedDistrict, selectedIndustry);
      },
    });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  const processWeekData = (data, selectedDistrict, selectedIndustry) => {
    const columns = [
      "자치구_코드_명",
      "행정동_코드_명",
      "category20",
      "월요일_매출_금액",
      "화요일_매출_금액",
      "수요일_매출_금액",
      "목요일_매출_금액",
      "금요일_매출_금액",
      "토요일_매출_금액",
      "일요일_매출_금액",
    ];

    const dataExtracted = data
      .filter(d => d["category20"] === selectedIndustry)
      .map((d) => ({
        자치구_코드_명: d["자치구_코드_명"],
        행정동_코드_명: d["행정동_코드_명"],
        category20: d["category20"],
        월요일_매출_금액: +d["월요일_매출_금액"],
        화요일_매출_금액: +d["화요일_매출_금액"],
        수요일_매출_금액: +d["수요일_매출_금액"],
        목요일_매출_금액: +d["목요일_매출_금액"],
        금요일_매출_금액: +d["금요일_매출_금액"],
        토요일_매출_금액: +d["토요일_매출_금액"],
        일요일_매출_금액: +d["일요일_매출_금액"],
      }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["월요일_매출_금액"] += cur["월요일_매출_금액"];
          acc["화요일_매출_금액"] += cur["화요일_매출_금액"];
          acc["수요일_매출_금액"] += cur["수요일_매출_금액"];
          acc["목요일_매출_금액"] += cur["목요일_매출_금액"];
          acc["금요일_매출_금액"] += cur["금요일_매출_금액"];
          acc["토요일_매출_금액"] += cur["토요일_매출_금액"];
          acc["일요일_매출_금액"] += cur["일요일_매출_금액"];
          return acc;
        },
        {
          월요일_매출_금액: 0,
          화요일_매출_금액: 0,
          수요일_매출_금액: 0,
          목요일_매출_금액: 0,
          금요일_매출_금액: 0,
          토요일_매출_금액: 0,
          일요일_매출_금액: 0,
        }
      );

      const totalSales = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const weekMapping = {
        월요일_매출_금액: "월요일",
        화요일_매출_금액: "화요일",
        수요일_매출_금액: "수요일",
        목요일_매출_금액: "목요일",
        금요일_매출_금액: "금요일",
        토요일_매출_금액: "토요일",
        일요일_매출_금액: "일요일",
      };

      const labels = Object.keys(summedData).map((key) => weekMapping[key]);
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalSales) * 100
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
            label: `${selectedDistrict} ${selectedIndustry} 업종 요일별 매출 비율 (%)`,
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
      setTrendMessage(
        `가장 많은 매출이 발생하는 요일은 ${maxDay}입니다.`
      );
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

WeekSalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default WeekSalesAnalysis;

const AnalysisContainer = styled.div`
  margin-bottom: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
`;

const TrendMessage = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
  text-align: start;
  color: #474242;
`;
