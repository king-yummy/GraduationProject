import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const StoreCountAnalysis = ({
  csvPath,
  selectedDistrict,
  selectedIndustry,
}) => {
  const [chartData, setChartData] = useState(null);
  const [latestStoreCount, setLatestStoreCount] = useState("");
  const [storeCountMessage, setStoreCountMessage] = useState("");

  useEffect(() => {
    fetch(csvPath)
      .then((response) => response.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const parsedData = results.data;
            const filteredData = parsedData.filter(
              (row) =>
                row.category20 === selectedIndustry &&
                row.행정동_코드_명 === selectedDistrict
            );

            const storeCounts = filteredData.reduce((acc, curr) => {
              const quarter = curr.기준_년분기_코드;
              acc[quarter] = (acc[quarter] || 0) + parseInt(curr.점포_수, 10);
              return acc;
            }, {});

            const quarters = Object.keys(storeCounts).sort();
            const counts = quarters.map((quarter) => storeCounts[quarter]);
            const latestStoreCount = counts[counts.length - 1];
            setLatestStoreCount(latestStoreCount);

            let storeCountMessage = "점포 수 데이터를 분석할 수 없습니다.";
            if (counts.length > 1) {
              const lastCount = counts[counts.length - 1];
              const previousCount = counts[counts.length - 2];
              if (lastCount > previousCount) {
                storeCountMessage = "점포수가 전분기대비 증가하고 있습니다.";
              } else if (lastCount === previousCount) {
                storeCountMessage = "점포수가 전분기대비 정체 상태입니다.";
              } else {
                storeCountMessage =
                  "점포수가 전년동기에 비해 감소하고 있습니다.";
              }
            }

            setStoreCountMessage(storeCountMessage);

            const chartData = {
              labels: quarters,
              datasets: [
                {
                  label: "점포 수",
                  data: counts,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            };
            setChartData(chartData);
          },
        });
      });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  return (
    <AnalysisContainer>
      <CountMessage>점포수는 {latestStoreCount}개 입니다.</CountMessage>
      <TrendMessage>{storeCountMessage}</TrendMessage>
      <ChartContainer>
        {chartData && (
          <Bar data={chartData} options={{ maintainAspectRatio: false }} />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

StoreCountAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default StoreCountAnalysis;

const AnalysisContainer = styled.div`
  flex: 1;
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
