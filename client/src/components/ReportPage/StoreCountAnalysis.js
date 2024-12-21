import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";

const StoreCountAnalysis = ({
  csvPath,
  selectedDistrict,
  selectedIndustry,
  onAnalysisComplete, // 추가: 상위 컴포넌트로 데이터 전달을 위한 콜백
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

            // 상위 컴포넌트로 분석 결과 전달
            if (onAnalysisComplete) {
              onAnalysisComplete({
                countMessages: [`점포수는 ${latestStoreCount}개 입니다.`],
                trendMessages: [storeCountMessage],
              });
            }

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
  onAnalysisComplete: PropTypes.func, // 추가: Prop 검증
};

export default StoreCountAnalysis;

const AnalysisContainer = styled.div`
  flex: 1;
  margin-bottom: 20px;
  width: 50%;
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
