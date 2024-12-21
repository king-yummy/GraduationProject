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
import FloatingChat from "./FloatingChat";
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

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 추가
import Papa from "papaparse";

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
  const navigate = useNavigate(); // useNavigate 훅 초기화
  const location = useLocation();
  const { searchQuery, cityInfo, selectedDistrict, selectedIndustry } =
    location.state || {};
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState(null);
  const industryRef = useRef(null);
  const salesRef = useRef(null);
  const populationRef = useRef(null);
  const realEstateRef = useRef(null);
  const [analysisData, setAnalysisData] = useState({});
  const [rsScore, setRsScore] = useState(null);

  useEffect(() => {
    // CSV 파일 로드
    Papa.parse("/assets/data/rs점수.csv", {
      download: true,
      header: true,
      encoding: "UTF-8", // 인코딩 강제 지정

      complete: (results) => {
        const data = results.data;

        console.log("CSV 로드 결과:", results.data); // CSV 데이터를 로그로 확인

        console.log("파싱된 CSV 데이터:", results.data); // 데이터 확인
        console.log("첫 번째 데이터의 키:", Object.keys(results.data[0])); // 헤더 확인

        // 업종별 매출합 컬럼 이름 정의
        const industryColumnMapping = {
          교육: "Total_RS_교육_매출합",
          기타: "Total_RS_기타_개인_서비스_매출합",
          보건: "Total_RS_보건_매출합",
          소매업: "Total_RS_소매업_매출합",
          스포츠: "Total_RS_스포츠_및_오락관련_서비스업_매출합",
          식료품: "Total_RS_식료품_매출합",
          음료: "Total_RS_음료_매출합",
          음식점: "Total_RS_음식점_매출합",
          의류: "Total_RS_의류_미용_매출합",
        };

        // 선택한 업종에 대응하는 컬럼 찾기
        const industryColumn = industryColumnMapping[selectedIndustry];
        if (!industryColumn) {
          setRsScore("N/A"); // 업종 매칭 실패
          return;
        }

        // 선택한 지역에 해당하는 데이터 찾기
        const matchingEntry = data.find(
          (entry) => entry.행정동_코드_명 === selectedDistrict
        );
        console.log("매칭된 데이터:", selectedDistrict);

        if (matchingEntry && matchingEntry[industryColumn]) {
          // 점수 반올림
          setRsScore(Math.round(parseFloat(matchingEntry[industryColumn])));
        } else {
          setRsScore("N/A"); // 데이터 없음
        }
      },
    });
  }, [selectedDistrict, selectedIndustry]);

  const updateAnalysisData = (key, data) => {
    setAnalysisData((prev) => {
      const newData = { ...prev, [key]: data };
      console.log("Updated analysisData:", newData); // 디버깅용
      return newData;
    });
  };

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

  // 기본값 처리
  const district = cityInfo?.title || "지역 정보 없음";
  const area = selectedDistrict || "동 정보 없음";
  const industry = selectedIndustry || "업종 정보 없음";

  const reportRef = useRef(null); // 리포트를 감싸는 ref 생성

  // PDF 저장 함수
  const saveAsPDF = async () => {
    if (!reportRef.current) {
      alert("PDF로 저장할 콘텐츠를 찾을 수 없습니다.");
      return;
    }

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 1, // 해상도를 낮춰 용량 줄이기
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.8); // JPEG로 변환, 품질 조정
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const imgPageHeight = (pdfWidth * imgHeight) / imgWidth;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        pdfWidth,
        imgPageHeight,
        undefined,
        "FAST"
      );
      heightLeft -= imgPageHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          pdfWidth,
          imgPageHeight,
          undefined,
          "FAST"
        );
        heightLeft -= imgPageHeight;
      }

      const fileName = `${district}_${area}_${industry}_리포트.pdf`; // 파일 이름 동적으로 지정
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF 저장 중 오류 발생:", error);
      alert("PDF 저장 중 오류가 발생했습니다.");
    }
  };

  const goToHome = () => {
    navigate("/"); // 메인 페이지로 이동
  };

  return (
    <ReportContainer>
      <RSScore>
        <TitleContainer>
          <h1>상권 추천 점수</h1>
          <ScoreTooltip>ℹ️</ScoreTooltip>
        </TitleContainer>
        <Score>{rsScore}</Score>
      </RSScore>

      <Header isScrolled={isScrolled}>
        <HeaderTitle>
          <HomeButton onClick={goToHome}>🔙</HomeButton> {/* 홈 버튼 추가 */}
          <h1>{`${district} ${area} ${industry} 상권분석`}</h1>
          <SaveButton onClick={saveAsPDF}>💾</SaveButton> {/* 저장 버튼 */}
        </HeaderTitle>
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
      <Content ref={reportRef}>
        <Part ref={industryRef}>✅ 업종 분석</Part>
        <Row>
          <StoreCountAnalysis
            csvPath="/assets/data/매출.csv"
            selectedDistrict={selectedDistrict}
            selectedIndustry={selectedIndustry}
            onAnalysisComplete={(data) => {
              console.log("StoreCountAnalysis 데이터:", data); // 콜백 데이터 출력
              updateAnalysisData("StoreCountAnalysis", data);
            }}
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
          onAnalysisComplete={(data) =>
            updateAnalysisData("OpenCloseAnalysis", data)
          }
        />
        <SurvivalRateAnalysis
          csvPath="/assets/data/연차별_생존율.csv"
          selectedDistrict={selectedDistrict}
          selectedIndustry={selectedIndustry}
          cityInfo={cityInfo.title}
          onAnalysisComplete={(data) =>
            updateAnalysisData("SurvivalRateAnalysis", data)
          }
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
          onAnalysisComplete={(data) =>
            updateAnalysisData("SalesAnalysis", data)
          }
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
          onAnalysisComplete={(data) =>
            updateAnalysisData("PopulationAnalysis", data)
          }
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
      <FloatingChat
        initialQuestion={searchQuery}
        district={cityInfo?.title}
        area={selectedDistrict}
        industry={selectedIndustry}
        analysisData={analysisData}
      />
    </ReportContainer>
  );
};

export default ReportPage;

const RSScore = styled.div`
  background-color: #f4f6f8;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px; /* h1과 툴팁 간의 간격 조정 */
`;

const Score = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #007bff;
  margin-top: 10px;
`;

const ScoreTooltip = styled.div`
  display: inline-block;
  position: relative;
  cursor: pointer;

  &:hover::after {
    content: "상권 추천 점수는 매출, 유동인구, 상주인구 등 다양한 지표를 분석해 산출한 점수입니다.";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    white-space: nowrap;
    font-size: 12px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
`;

const HomeButton = styled.button`
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  border: 1px solid #ccc; /* 테두리 색상 및 스타일 추가 */
  border-radius: 4px;

  &:hover {
    background-color: #0056b3;
  }
`;

const SaveButton = styled.button`
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  background: white;
  border: 1px solid #ccc; /* 테두리 색상 및 스타일 추가 */
  border-radius: 4px;
`;

const ReportContainer = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: auto;
`;

const Header = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가로 중앙 정렬 추가 */
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

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 10px; /* 버튼과 텍스트 간격 조정 */
  width: 100%; /* 부모 요소의 너비 채우기 */
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
  font-size: 18px;
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
