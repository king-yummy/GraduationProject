import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import styled from "styled-components";

const FranchiseAnalysis = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCost, setSelectedCost] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/assets/data/프랜차이즈_cleaned.csv");
      const reader = response.body.getReader();
      const result = await reader.read();
      const decoder = new TextDecoder("utf-8");
      const csv = decoder.decode(result.value);
      const parsedData = Papa.parse(csv, { header: true });
      console.log("Parsed Data:", parsedData.data); // 데이터 확인
      const slicedData = parsedData.data.slice(0, 100); // 처음 100개 데이터만 사용
      setData(slicedData);
      setFilteredData(slicedData); // 초기 필터링된 데이터는 슬라이싱된 데이터와 동일
    };

    fetchData();
  }, []);

  const handleCostChange = (cost) => {
    setSelectedCost(cost);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const convertCostToNumber = (costString) => {
    return parseInt(costString.replace(/[^0-9]/g, ""), 10);
  };

  const groupCategory = (category) => {
    const categoryMap = {
      "음식점": ["한식", "일식", "중식", "서양식", "기타 외식"],
      "주점/카페": ["주점", "커피", "음료"],
      "치킨/피자": ["치킨", "피자", "패스트푸드"],
      "아이스크림/디저트": ["아이스크림/빙수", "제과제빵"],
      "기타 서비스": ["기타 서비스", "오락", "이미용", "반려동물 관련", "스포츠 관련"],
      "교육": ["교육 (외국어)", "교육 (교과)", "기타 교육"],
      "편의점/소매점": ["편의점", "종합소매점", "기타도소매"],
      "기타": ["농수산물", "(건강)식품", "약국", "인력 파견", "운송", "유아관련", "세탁", "이사", "부동산 중개", "의류 / 패션", "안경", "자동차 관련", "임대", "숙박", "화장품"]
    };

    for (const [key, value] of Object.entries(categoryMap)) {
      if (value.includes(category)) {
        return key;
      }
    }
    return "기타";
  };

  useEffect(() => {
    let filtered = data;

    if (selectedCost !== "전체") {
      filtered = filtered.filter((item) => {
        const initialCost = convertCostToNumber(item.initial_cost);
        switch (selectedCost) {
          case "6천만원 미만":
            return initialCost < 6000;
          case "6천만원-8천만원":
            return initialCost >= 6000 && initialCost <= 8000;
          case "8천만원-1억원":
            return initialCost > 8000 && initialCost <= 10000;
          case "1억원 이상":
            return initialCost > 10000;
          default:
            return true;
        }
      });
    }

    if (selectedCategory !== "전체") {
      filtered = filtered.filter((item) => groupCategory(item.category) === selectedCategory);
    }

    setFilteredData(filtered);
  }, [selectedCost, selectedCategory, data]);

  const categoryEmojis = {
    "음식점": "🍴",
    "주점/카페": "☕",
    "치킨/피자": "🍕",
    "아이스크림/디저트": "🍨",
    "기타 서비스": "💼",
    "교육": "📚",
    "편의점/소매점": "🏪",
    "기타": "🔧",
  };

  return (
    <Container>
      <h1>프랜차이즈 분석</h1>
      <FilterAndDataContainer>
        <FilterTableContainer>
          <FilterTable>
            <tbody>
              <FilterRow>
                <FilterTitleCell><FilterTitle>창업 비용</FilterTitle></FilterTitleCell>
                <FilterButtonCell>
                  {["전체", "6천만원 미만", "6천만원-8천만원", "8천만원-1억원", "1억원 이상"].map((cost) => (
                    <FilterButton
                      key={cost}
                      selected={selectedCost === cost}
                      onClick={() => handleCostChange(cost)}
                    >
                      {cost}
                    </FilterButton>
                  ))}
                </FilterButtonCell>
              </FilterRow>
              <FilterRow>
                <FilterTitleCell><FilterTitle>업종</FilterTitle></FilterTitleCell>
                <FilterButtonCell>
                  {[
                    "전체",
                    "음식점",
                    "주점/카페",
                    "치킨/피자",
                    "아이스크림/디저트",
                    "기타 서비스",
                    "교육",
                    "편의점/소매점",
                    "기타",
                  ].map((category) => (
                    <FilterButton
                      key={category}
                      selected={selectedCategory === category}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {categoryEmojis[category]} {category}
                    </FilterButton>
                  ))}
                </FilterButtonCell>
              </FilterRow>
            </tbody>
          </FilterTable>
        </FilterTableContainer>
        <DataContainer>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <Card key={index}>
                <CardContent>
                  <h3>{item.brand_name}</h3>
                  <p>{item.category} · {item.store_count}개</p>
                  <p><GrayText>창업비용:</GrayText> <BoldText>{item.initial_cost} 만원</BoldText></p>
                  <p><GrayText>인테리어비용:</GrayText> <BoldText>{item.interior_cost} 만원</BoldText></p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>해당 조건에 맞는 데이터가 없습니다.</p>
          )}
        </DataContainer>
      </FilterAndDataContainer>
    </Container>
  );
};

export default FranchiseAnalysis;

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FilterAndDataContainer = styled.div`
  width: 100%;
`;

const FilterTableContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  background-color: #f9f9f9; /* 테이블 배경색 */
  padding: 20px;
  border-radius: 10px; /* 테두리 둥글게 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 약간의 그림자 */
`;

const FilterTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const FilterRow = styled.tr`
  display: flex;
  align-items: center;
`;

const FilterTitleCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  display: flex;
  align-items: center;
  width: 20%;
`;

const FilterButtonCell = styled.td`
  padding: 10px;
  vertical-align: middle;
  width: 80%;
`;

const FilterTitle = styled.h2`
  margin: 0;
  font-size: 18px;
`;

const FilterButton = styled.button`
  background-color: ${(props) => (props.selected ? "#e0f7ff" : "transparent")};
  border: ${(props) => (props.selected ? "2px solid #007bff" : "1px solid #ccc")};
  color: ${(props) => (props.selected ? "#007bff" : "#000")};
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin: 5px;
  &:hover {
    background-color: #e0f7ff;
    border: 2px solid #007bff;
    color: #007bff;
  }
`;

const DataContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: flex-start; /* 왼쪽 정렬 */
  max-width: 1200px; /* 카드 컨테이너 최대 너비 설정 */
`;

const Card = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  width: calc(25% - 20px); /* 카드의 너비를 25%로 설정하고, 간격을 고려하여 조정 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px; /* 카드 사이의 간격 추가 */
`;

const CardContent = styled.div`
  padding: 10px;

  h3 {
    margin: 0 0 10px;
    font-size: 18px;
  }

  p {
    margin: 0 0 5px;
    color: #555;
  }
`;

const GrayText = styled.span`
  color: gray;
`;

const BoldText = styled.span`
  font-weight: bold;
  color: black;
`;
