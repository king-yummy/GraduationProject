import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Pie } from "react-chartjs-2";
import styled from "styled-components";
import Papa from "papaparse";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const FranchiseAnalysis = ({ csvPath, selectedDistrict, selectedIndustry }) => {
  const [pieData, setPieData] = useState(null);

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

            // 최신 분기의 점포 수 계산
            const storeCounts = filteredData.reduce((acc, curr) => {
              const quarter = curr.기준_년분기_코드;
              acc[quarter] = (acc[quarter] || 0) + parseInt(curr.점포_수, 10);
              return acc;
            }, {});

            const quarters = Object.keys(storeCounts).sort();
            const latestQuarter = quarters[quarters.length - 1];
            const latestStoreCount = storeCounts[latestQuarter];

            // 프랜차이즈 점포 수 계산
            let franchiseCount = 0;
            filteredData
              .filter((row) => row.기준_년분기_코드 === latestQuarter)
              .forEach((row) => {
                franchiseCount += parseInt(row.프랜차이즈_점포_수, 10);
              });

            // 파이차트 데이터 구성
            const generalCount = latestStoreCount; // 최신 분기의 점포수로 초기화
            const pieData = {
              labels: ["일반점포", "프랜차이즈"],
              datasets: [
                {
                  data: [generalCount - franchiseCount, franchiseCount],
                  backgroundColor: ["#36A2EB", "#4BC0C0"],
                },
              ],
            };
            setPieData(pieData);
          },
        });
      });
  }, [csvPath, selectedDistrict, selectedIndustry]);

  return (
    <AnalysisContainer>
      <ChartContainer>
        {pieData && (
          <Pie data={pieData} options={{ maintainAspectRatio: false }} />
        )}
      </ChartContainer>
    </AnalysisContainer>
  );
};

FranchiseAnalysis.propTypes = {
  csvPath: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.string.isRequired,
  selectedIndustry: PropTypes.string.isRequired,
};

export default FranchiseAnalysis;

const AnalysisContainer = styled.div`
  flex: 1;
  margin-bottom: 30px;
  display: flex;       // Flexbox 설정
  flex-direction: column; // 세로로 정렬
  justify-content: flex-end; // 하단 정렬
  align-items: center; // 중앙 정렬 (가로)
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 395px;
`;
