import React, { useEffect, useState } from "react";
import styled from "styled-components";
import geohash from "ngeohash";

const ZigbangStoreAnalysis = ({ gu, dong }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageDeposit, setAverageDeposit] = useState(0);
  const [averageRent, setAverageRent] = useState(0);

  // 동 이름을 포맷하는 함수
  const formatDongName = (dong) => {
    // 규칙 1: xx동 -> xx동 (숫자가 아닌 글자만 있는 동은 그대로)
    if (!/\d/.test(dong)) {
      return dong;
    }

    // 규칙 2: xx1가2동 -> xx동 (첫 숫자부터 마지막 글자 전까지 지움)
    const firstDigitIndex = dong.search(/\d/);
    return dong.substring(0, firstDigitIndex) + "동";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDong = formatDongName(dong);
        console.log(`검색할 주소: ${gu} ${formattedDong}`);
  
        // 주소로 검색하여 위도와 경도 얻기
        const searchUrl = `https://apis.zigbang.com/v2/search?leaseYn=N&q=${gu}&serviceType=상가`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
          console.error("Error fetching search data:", searchResponse.statusText);
          setError(`주소 검색 데이터 가져오기 오류: ${searchResponse.statusText}`);
          return;
        }
        const searchData = await searchResponse.json();
  
        console.log("searchData:", searchData);
  
        if (!searchData.items || searchData.items.length === 0) {
          console.error("No data found for the given address.");
          setError("해당 주소에 대한 데이터를 찾을 수 없습니다.");
          return;
        }
  
        const { lat, lng } = searchData.items[0];
        const geohashCode = geohash.encode(lat, lng, 6);
  
        // geohash를 사용하여 상가 목록 얻기
        const listUrl = "https://apis.zigbang.com/v2/store/article/stores";
        const listPayload = {
          domain: "zigbang",
          geohash: geohashCode,
          first_floor: false,
          sales_type: "전체",
          shuffle: false,
          업종: [],
        };
  
        const listResponse = await fetch(listUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(listPayload),
        });
        if (!listResponse.ok) {
          console.error("Error fetching list data:", listResponse.statusText);
          setError(`목록 데이터 가져오기 오류: ${listResponse.statusText}`);
          return;
        }
        const listData = await listResponse.json();
  
        console.log("listData:", listData);
  
        if (!listData || listData.length === 0) {
          console.error("No store data found for the given geohash.");
          setError("해당 지역에 대한 상가 정보를 찾을 수 없습니다.");
          return;
        }
  
        // item_id 추출
        const itemIds = listData.reduce((acc, section) => {
          section.item_locations.forEach(item => acc.push(item.item_id));
          return acc;
        }, []);
  
        if (itemIds.length === 0) {
          console.error("No item IDs found in the store data.");
          setError("해당 지역에 대한 상가 정보를 찾을 수 없습니다.");
          return;
        }
  
        // 아이템 리스트 얻기
        const detailsUrl = "https://apis.zigbang.com/v2/store/article/stores/list";
        const detailsPayload = {
          domain: "zigbang",
          item_ids: itemIds.slice(0, 900),
        };
  
        const detailsResponse = await fetch(detailsUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(detailsPayload),
        });
        if (!detailsResponse.ok) {
          console.error("Error fetching details data:", detailsResponse.statusText);
          setError(`상세 데이터 가져오기 오류: ${detailsResponse.statusText}`);
          return;
        }
        const detailsData = await detailsResponse.json();
  
        console.log("detailsData:", detailsData);
  
        // 월세금액이 0보다 큰 데이터만 필터링
        const filteredData = detailsData.filter(item => item.월세금액 > 0);
  
        // 평균 계산
        const totalDeposit = filteredData.reduce((sum, item) => sum + item.보증금액, 0);
        const totalRent = filteredData.reduce((sum, item) => sum + item.월세금액, 0);
        const depositAverage = (totalDeposit / filteredData.length) || 0;
        const rentAverage = (totalRent / filteredData.length) || 0;
  
        setAverageDeposit(depositAverage);
        setAverageRent(rentAverage);
  
        setData(filteredData.slice(0, 10));
        
      } catch (error) {
        console.error("Fetch error:", error.message);
        setError("데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [gu, dong]);

  if (loading) {
    return <Loading>데이터를 불러오는 중...</Loading>;
  }

  if (error) {
    return <Error>{error}</Error>;
  }

  return (
    <AnalysisContainer>
      <CountMessage>
        {gu} 상가의 임대시세
      </CountMessage>
      <AverageContainer>
        <AverageItem>
          평균 보증금액
          <AverageValue>{averageDeposit.toFixed(0)} 만 원</AverageValue>
        </AverageItem>
        <AverageItem>
          평균 월세금액
          <AverageValue>{averageRent.toFixed(0)} 만 원</AverageValue>
        </AverageItem>
      </AverageContainer>
      <Table>
        <thead>
          <tr>
            <th>구</th>
            <th>동</th>
            <th>업종</th>
            <th>보증금액</th>
            <th>월세금액</th>
            <th>관리금액</th>
            <th>크기(m²)</th>
            <th>층수</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.local2}</td>
              <td>{item.local3}</td>
              <td>{item.업종}</td>
              <td>{item.보증금액.toLocaleString()}</td>
              <td>{item.월세금액.toLocaleString()}</td>
              <td>{item.관리금액.toLocaleString()}</td>
              <td>{item.size_m2}</td>
              <td>{item.floor}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AnalysisContainer>
  );
};

export default ZigbangStoreAnalysis;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
  }

  th {
    background-color: #f2f2f2;
    text-align: left;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
`;

const Error = styled.div`
  color: red;
  text-align: center;
  padding: 20px;
`;

const CountMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: start;
  color: #000000;
`;

const AnalysisContainer = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const AverageContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
`;

const AverageItem = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AverageValue = styled.span`
  font-size: 26px;
  color: #000;
  margin-top: 10px;
`;
