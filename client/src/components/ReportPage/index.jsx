import React, { useState, useEffect, useRef } from "react";
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
import ZigbangStoreAnalysis from "./ZigbangStoreAnalysis";
import SalesCountAnalysis from "./SalesCountAnalysis";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReportPage = () => {
  const location = useLocation();
  const { cityInfo, selectedDistrict, selectedIndustry } = location.state || {};
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(null);
  const industryRef = useRef(null);
  const salesRef = useRef(null);
  const populationRef = useRef(null);
  const realEstateRef = useRef(null);

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
    const industryOffsetTop = industryRef.current.offsetTop - 130;
    const salesOffsetTop = salesRef.current.offsetTop - 130;
    const populationOffsetTop = populationRef.current.offsetTop - 130;
    const realEstateOffsetTop = realEstateRef.current.offsetTop - 130;
    const scrollPosition = window.scrollY;

    if (scrollPosition >= realEstateOffsetTop) {
      setActiveNavItem(3);
    } else if (scrollPosition >= populationOffsetTop) {
      setActiveNavItem(2);
    } else if (scrollPosition >= salesOffsetTop) {
      setActiveNavItem(1);
    } else if (scrollPosition >= industryOffsetTop) {
      setActiveNavItem(0);
    }
  };

  const handleNavItemClick = (ref, index) => {
    scrollToSection(ref);
    setActiveNavItem(index);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 130, // Adjust the offset as needed
      behavior: "smooth",
    });
  };

  return (
    <ReportContainer>
      <Header isScrolled={isScrolled}>
        <h1>
          {cityInfo?.title} {selectedDistrict} {selectedIndustry} 상권분석
        </h1>
        <Nav>
          <NavItem
            active={activeNavItem === 0}
            onClick={() => handleNavItemClick(industryRef, 0)}
          >
            업종 분석
          </NavItem>
          <NavItem
            active={activeNavItem === 1}
            onClick={() => handleNavItemClick(salesRef, 1)}
          >
            매출 분석
          </NavItem>
          <NavItem
            active={activeNavItem === 2}
            onClick={() => handleNavItemClick(populationRef, 2)}
          >
            인구 분석
          </NavItem>
          <NavItem
            active={activeNavItem === 3}
            onClick={() => handleNavItemClick(realEstateRef, 3)}
          >
            지역/부동산 분석
          </NavItem>
        </Nav>
      </Header>
      <Content>
        <Part ref={industryRef}>✅ 업종 분석</Part>
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
          cityInfo={cityInfo.title}
        />
        <Part ref={salesRef}>✅ 매출 분석</Part>
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
        <SalesCountAnalysis
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
        <Part ref={populationRef}>✅ 인구 분석</Part>
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

        <Part ref={realEstateRef}>✅ 지역/부동산 분석</Part>
        <IncomeAnalysis
          csvPath="/assets/data/상권변화지표_소득소비(상권).csv"
          selectedDistrict={selectedDistrict}
          cityInfo={cityInfo.title}
        />
        <ZigbangStoreAnalysis
          gu={cityInfo?.title}
          dong={selectedDistrict || ""}
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
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  gap: 15px;
  position: sticky;
  top: 0;
  background-color: ${(props) => (props.isScrolled ? "white" : "white")};
  padding: 10px;
  box-shadow: ${(props) =>
    props.isScrolled ? "0px 6px 10px rgba(0, 0, 0, 0.1)" : "none"};
  transition: background-color 0.3s, box-shadow 0.3s;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  gap: 30px;
`;

const NavItem = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.active ? "#0000a8" : "black")};
  cursor: pointer;
  font-size: 16px;
  padding: 10px;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: #0000a8;
  }

  &::after {
    content: "";
    display: block;
    width: ${(props) => (props.active ? "100%" : "0")};
    height: 2px;
    background: black;
    transition: width 0.3s;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &:hover::after {
    width: 100%;
  }
`;

const Part = styled.h2`
  color: #0000a8;
  margin-bottom: 15px;
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
  border: 3px solid #ddd;
  padding: 30px 20px 10px 20px;
  border-radius: 5px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

