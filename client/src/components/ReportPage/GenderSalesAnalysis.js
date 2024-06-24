import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const GenderSalesAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [genderChartData, setGenderChartData] = useState(null);
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
        남성_매출_금액: +d["남성_매출_금액"],
        여성_매출_금액: +d["여성_매출_금액"],
      }));

    const districtData = dataExtracted.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    if (districtData.length > 0) {
      const summedData = districtData.reduce(
        (acc, cur) => {
          acc["남성_매출_금액"] += cur["남성_매출_금액"];
          acc["여성_매출_금액"] += cur["여성_매출_금액"];
          return acc;
        },
        {
          남성_매출_금액: 0,
          여성_매출_금액: 0,
        }
      );

      const totalSales = summedData["남성_매출_금액"] + summedData["여성_매출_금액"];

      const malePercentage = ((summedData["남성_매출_금액"] / totalSales) * 100).toFixed(1);
      const femalePercentage = ((summedData["여성_매출_금액"] / totalSales) * 100).toFixed(1);

      // 트렌드 메시지 생성
      const trendMessage = summedData["남성_매출_금액"] > summedData["여성_매출_금액"]
        ? `남성 매출이 여성보다 ${(malePercentage - femalePercentage).toFixed(1)}% 높습니다.`
        : `여성 매출이 남성보다 ${(femalePercentage - malePercentage).toFixed(1)}% 높습니다.`;

      setGenderChartData({
        labels: ["남성", "여성"],
        datasets: [
          {
            data: [malePercentage, femalePercentage],
            backgroundColor: ["skyblue", "lightcoral"],
            hoverBackgroundColor: ["deepskyblue", "lightpink"],
          },
        ],
      });

      setTrendMessage(trendMessage);
    }
  };

  return (
    <AnalysisContainer>
      <TrendMessage>{trendMessage}</TrendMessage>
      <ChartContainer>
        {genderChartData && (
          <Pie
            data={genderChartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`,
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

GenderSalesAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default GenderSalesAnalysis;

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
