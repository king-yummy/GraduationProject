import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import * as d3 from "d3";
import styled from "styled-components";

const IncomeAnalysis = ({ csvPath, cityInfo, selectedDistrict }) => {
  const [chartData, setChartData] = useState(null);
  const [trendMessage, setTrendMessage] = useState("");

  useEffect(() => {
    d3.csv(csvPath).then((data) => {
      processAndSetData(data, cityInfo, selectedDistrict);
    });
  }, [csvPath, cityInfo, selectedDistrict]);

  const processAndSetData = (data, cityInfo, selectedDistrict) => {
    const dataExtracted = data.map((d) => ({
      자치구_코드_명: d["자치구_코드_명"],
      행정동_코드_명: d["행정동_코드_명"],
      소득_구간_코드: +d["소득_구간_코드"],
    }));

    const cityData = dataExtracted.filter(
      (d) => d["자치구_코드_명"] === cityInfo
    );

    const districtData = cityData.filter(
      (d) => d["행정동_코드_명"] === selectedDistrict
    );

    const meanCity =
      cityData.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
      cityData.length;

    const meanDistrict =
      districtData.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
      districtData.length;

    const meanCityRounded = Math.ceil(meanCity);
    const meanDistrictRounded = Math.ceil(meanDistrict);
    const meanSeoul = Math.ceil(
      dataExtracted.reduce((acc, cur) => acc + cur["소득_구간_코드"], 0) /
        dataExtracted.length
    );

    setChartData({
      labels: [selectedDistrict, cityInfo, "서울시"],
      datasets: [
        {
          label: `평균 소득 구간`,
          data: [meanDistrictRounded, meanCityRounded, meanSeoul],
          backgroundColor: ["skyblue", "orange", "grey"],
          borderColor: ["deepskyblue", "darkorange", "darkgrey"],
          borderWidth: 1,
        },
      ],
    });

    setTrendMessage(
      `${selectedDistrict}, ${cityInfo}, 서울시의 평균 소득 구간`
    );
  };

  return (
    <AnalysisContainer>
      <CountMessage>{trendMessage}</CountMessage>
      <ChartContainer>
        {chartData && (
          <Bar
            data={chartData}
            options={{
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "구분",
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: "평균 소득 구간",
                  },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.raw} 구간`,
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

IncomeAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  cityInfo: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
};

export default IncomeAnalysis;

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
