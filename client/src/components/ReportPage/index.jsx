import React from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import StoreCountAnalysis from "./StoreCountAnalysis";
import OpenCloseAnalysis from "./OpenCloseAnalysis";
import FranchiseAnalysis from "./FranchiseAnalysis";
import SurvivalRateAnalysis from "./SurvivalRateAnalysis";

const ReportPage = () => {
  const location = useLocation();
  const { cityInfo, selectedDistrict, selectedIndustry } = location.state || {};

  return (
    <ReportContainer>
      <Header>
        <h1>{cityInfo?.title} 리포트</h1>
        <p>선택된 동: {selectedDistrict || "전체 동"}</p>
        <p>선택된 업종: {selectedIndustry || "전체 업종"}</p>
      </Header>
      <Content>
        <Row>
          <StoreCountAnalysis
            csvPath="/assets/data/매출.csv"
            selectedDistrict={selectedDistrict}
            selectedIndustry={selectedIndustry}
          />
          <FranchiseAnalysis
            csvPath="/assets/data/매출.csv"
            selectedDistrict={selectedDistrict}
            selectedIndustry={selectedIndustry}
          />
        </Row>
        <OpenCloseAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
        />
        <SurvivalRateAnalysis
          csvPath="/assets/data/연차별_생존율.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
        />
      </Content>
    </ReportContainer>
  );
};

export default ReportPage;

const ReportContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 20px;
`;
