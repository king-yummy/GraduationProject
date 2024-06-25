import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const AgeSalesAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [ageChartData, setAgeChartData] = useState(null);
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, selectedDistrict, selectedIndustry);
    });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  const processAndSetData = (data, selectedDistrict, selectedIndustry) => {
    const dataExtracted = data
      .filter((d) => d["category20"] === selectedIndustry)
      .map((d) => ({
        자치구_코드_명: d["자치구_코드_명"],
        행정동_코드_명: d["행정동_코드_명"],
        category20: d["category20"],
        연령대_10_매출_금액: +d["연령대_10_매출_금액"],
        연령대_20_매출_금액: +d["연령대_20_매출_금액"],
        연령대_30_매출_금액: +d["연령대_30_매출_금액"],
        연령대_40_매출_금액: +d["연령대_40_매출_금액"],
        연령대_50_매출_금액: +d["연령대_50_매출_금액"],
        연령대_60_이상_매출_금액: +d["연령대_60_이상_매출_금액"],
      }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["연령대_10_매출_금액"] += cur["연령대_10_매출_금액"];
          acc["연령대_20_매출_금액"] += cur["연령대_20_매출_금액"];
          acc["연령대_30_매출_금액"] += cur["연령대_30_매출_금액"];
          acc["연령대_40_매출_금액"] += cur["연령대_40_매출_금액"];
          acc["연령대_50_매출_금액"] += cur["연령대_50_매출_금액"];
          acc["연령대_60_이상_매출_금액"] += cur["연령대_60_이상_매출_금액"];
          return acc;
        },
        {
          연령대_10_매출_금액: 0,
          연령대_20_매출_금액: 0,
          연령대_30_매출_금액: 0,
          연령대_40_매출_금액: 0,
          연령대_50_매출_금액: 0,
          연령대_60_이상_매출_금액: 0,
        }
      );

      const totalSales = Object.values(summedData).reduce(
        (acc, val) => acc + val,
        0
      );

      const labels = [
        "10대",
        "20대",
        "30대",
        "40대",
        "50대",
        "60대 이상",
      ];
      const dataValues = Object.values(summedData).map(
        (value) => (value / totalSales) * 100
      );

      // 최대값의 색깔 지정
      const maxIndex = dataValues.indexOf(Math.max(...dataValues));
      const backgroundColors = dataValues.map((_, index) =>
        index === maxIndex ? "skyblue" : "grey"
      );

      setAgeChartData({
        labels,
        datasets: [
          {
            label: `${selectedIndustry}의 연령대별 매출 현황 (%)`,
            data: dataValues,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((color) =>
              color === "skyblue" ? "deepskyblue" : "darkgrey"
            ),
            borderWidth: 1,
          },
        ],
      });

      const maxAgeGroup = labels[maxIndex];
      setTrendMessage(`선택 상권의 ${selectedIndustry} 업종에서는 ${maxAgeGroup}(${dataValues[maxIndex].toFixed(1)}%)가 가장 높은 매출을 보입니다.`);
    }
  };

  return (
    <AnalysisContainer>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {ageChartData && (
          <Bar
            data={ageChartData}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "연령대",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "매출 비율 (%)",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw.toFixed(1)}%`,
                  },
                },
              },
            }}
          />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

AgeSalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default AgeSalesAnalysis;

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
