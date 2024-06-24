import React from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import StoreCountAnalysis from "./StoreCountAnalysis";
import OpenCloseAnalysis from "./OpenCloseAnalysis";
import FranchiseAnalysis from "./FranchiseAnalysis";
import SurvivalRateAnalysis from "./SurvivalRateAnalysis";
import PopulationAnalysis from "./PopulationAnalysis";
import WeekPopulationAnalysis from "./WeekPopulationAnalysis";
import LivingPopulationAnalysis from "./LivingPopulationAnalysis";
import WorkingPopulationAnalysis from "./WorkingPopulationAnalysis";
import SalesAnalysis from "./SalesAnalysis";
import WeekSalesAnalysis from "./WeekSalesAnalysis";
import GenderSalesAnalysis from "./GenderSalesAnalysis";
import AgeSalesAnalysis from "./AgeSalesAnalysis";
import TopSalesAnalysis from "./TopSalesAnalysis";
import IncomeAnalysis from "./IncomeAnalysis";

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
        <PopulationAnalysis
          csvPath="/assets/data/stay_live_work.csv"
          selectedDistrict={selectedDistrict}
          cityInfo={cityInfo.title}
        />
        <WeekPopulationAnalysis
          csvPath="/assets/data/stay_live_work.csv"
          selectedDistrict={selectedDistrict}
        />
        <LivingPopulationAnalysis
          csvPath="/assets/data/stay_live_work.csv"
          selectedDistrict={selectedDistrict}
        />
        <WorkingPopulationAnalysis
          csvPath="/assets/data/stay_live_work.csv"
          selectedDistrict={selectedDistrict}
        />
        <TopSalesAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
        />
        <SalesAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
          cityInfo={cityInfo.title}
          selectedIndustry={selectedIndustry}
        />
        <WeekSalesAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
        />
        <GenderSalesAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
        />
        <AgeSalesAnalysis
          csvPath="/assets/data/매출.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
        />
        <IncomeAnalysis
          csvPath="/assets/data/상권변화지표_소득소비(상권).csv"
          selectedDistrict={selectedDistrict}
          cityInfo={cityInfo.title}
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
  align-items: stretch;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-bottom: 20px;
`;
