import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import { loadData } from "./dataLoader";

const ReportPage = () => {
  const location = useLocation();
  const { cityInfo, selectedDistrict, selectedIndustry } = location.state || {};
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    loadData('/path/to/final_data.csv', (data) => {
      setReportData(data);
    });
  }, []);

  // 필터링된 데이터
  const filteredData = reportData.filter(row => 
    row.district === selectedDistrict && row.industry === selectedIndustry
  );

  return (
    <ReportContainer>
      <Header>
        <h1>{cityInfo?.title} 리포트</h1>
        <p>선택된 동: {selectedDistrict || "전체 동"}</p>
        <p>선택된 업종: {selectedIndustry || "전체 업종"}</p>
      </Header>
      <Content>
        <Section>
          <h2>요약</h2>
          {/* 요약 정보 표시 */}
          <p>업소수: {filteredData.length}</p>
          <p>평균 매출액: {calculateAverage(filteredData, '매출액')} 백만원</p>
          <p>평균 유동인구: {calculateAverage(filteredData, '유동인구')} 명</p>
        </Section>
        <Section>
          <h2>업종 분석</h2>
          {/* 업소수 추이, 업력현황 등 */}
        </Section>
        <Section>
          <h2>매출 분석</h2>
          {/* 매출추이, 매출특성 등 */}
        </Section>
        <Section>
          <h2>인구 분석</h2>
          {/* 유동인구, 주거인구, 직장인구 등 */}
        </Section>
        <Section>
          <h2>지역 현황</h2>
          {/* 주택 현황, 주요시설, 교통시설 현황 등 */}
        </Section>
      </Content>
    </ReportContainer>
  );
};

export default ReportPage;

const ReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  p {
    font-size: 1.2rem;
    margin-bottom: 5px;
  }
`;

const Content = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.div`
  width: 100%;
  margin: 20px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 10px;
    font-size: 1.5rem;
  }

  p {
    margin-bottom: 5px;
    font-size: 1.2rem;
  }
`;

// calculateAverage 함수
const calculateAverage = (data, key) => {
  if (data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + parseFloat(item[key] || 0), 0);
  return (total / data.length).toFixed(2);
};