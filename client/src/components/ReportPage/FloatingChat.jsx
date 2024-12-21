import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom"; // 페이지 전환을 위해 추가
import cityData from "../../assets/data/updated_data_sorted.json"; // 지역 데이터
import { industryOptions, industrySynonyms } from "../Overview";

const FloatingChat = ({
  initialQuestion,
  district,
  area,
  industry,
  analysisData,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuestion) {
      setMessages([
        { user: true, text: initialQuestion },
        {
          user: false,
          text: `${district} ${area} ${industry} 상권분석 리포트입니다. 확인해보세요!`,
        },
      ]);
    }
  }, [initialQuestion, district, area, industry]);

  useEffect(() => {
    // 새 메시지가 추가될 때 스크롤 자동 이동
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 질문에서 지역/업종 추출
  const parseSearchQuery = (
    query,
    industryOptions,
    cityData,
    industrySynonyms
  ) => {
    const areaRegex = /(\S*동)/; // '동' 추출
    const area = query.match(areaRegex)?.[1] || "";

    // 업종 찾기 (옵션과 동의어 모두 활용)
    const industry = mapToIndustry(query, industrySynonyms, industryOptions);

    let district = "";
    let cityInfo = null;

    // '구' 찾기
    if (Array.isArray(cityData)) {
      cityInfo = cityData.find(
        (city) =>
          Array.isArray(city.districtOptions) &&
          city.districtOptions.includes(area)
      );
    }

    if (cityInfo) {
      district = cityInfo.title; // 해당 '구'의 이름
    }

    return { district, area, industry, cityInfo };
  };

  const mapToIndustry = (query, industrySynonyms, industryOptions) => {
    // 업종 옵션에서 직접 매칭
    const exactMatch = industryOptions.find((option) => query.includes(option));
    if (exactMatch) return exactMatch;

    // 유사 단어 매핑
    for (const [key, synonyms] of Object.entries(industrySynonyms)) {
      if (synonyms.some((synonym) => query.includes(synonym))) {
        return key; // 매핑된 업종 반환
      }
    }

    return ""; // 매칭되지 않으면 빈 문자열 반환
  };

  // 질문에서 분석 키워드 추출
  const parseQuestion = (question) => {
    const keywordMapping = {
      점포수: "StoreCountAnalysis",
      개업수: "OpenCloseAnalysis",
      폐업수: "OpenCloseAnalysis",
      생존률: "SurvivalRateAnalysis",
      매출: "SalesAnalysis",
      유동인구: "PopulationAnalysis",
      // 추가 키워드 매핑...
    };

    return Object.keys(keywordMapping).find((keyword) =>
      question.includes(keyword)
    );
  };

  // 메시지 전송 핸들러
  const handleSendMessage = async () => {
    console.log("handleSendMessage 호출됨:", input);

    if (input.trim() === "") return;

    setMessages((prev) => [...prev, { user: true, text: input }]);
    setInput("");

    // 지역, 업종 추출
    const { district, area, industry, cityInfo } = parseSearchQuery(
      input,
      industryOptions,
      cityData,
      industrySynonyms
    );
    console.log("검색 결과:", { district, area, industry, cityInfo });

    if (!district || !area || !industry) {
      setMessages((prev) => [
        ...prev,
        {
          user: false,
          text: "검색어에서 '구', '동', '업종'을 찾을 수 없습니다. 다시 시도해주세요.",
        },
      ]);
      return;
    }

    // 분석 키워드 파싱
    const matchedKey = parseQuestion(input);
    console.log("매칭된 분석 키:", matchedKey);

    if (matchedKey) {
      const analysis = analysisData[matchedKey];
      console.log("매칭된 분석 데이터:", analysis);

      if (analysis) {
        const response = `
        ${analysis.countMessages.join(" ")} 
        ${analysis.trendMessages.join(" ")}
      `;
        setMessages((prev) => [...prev, { user: false, text: response }]);
        return;
      } else {
        setMessages((prev) => [
          ...prev,
          { user: false, text: "해당 분석 데이터를 찾을 수 없습니다." },
        ]);
        return;
      }
    }

    // 리포트 페이지로 이동
    console.log("리포트 페이지로 이동:", { district, area, industry });
    navigate("/report", {
      state: {
        searchQuery: input,
        selectedDistrict: area,
        selectedIndustry: industry,
        cityInfo,
      },
    });

    // 백엔드 호출 (새 리포트 요청)
    try {
      console.log("Fetching to server 시작");
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          analysisData,
        }),
      });

      console.log("서버 응답 확인:", response);

      const data = await response.json();
      console.log("서버에서 받은 데이터:", data);

      if (data.reply) {
        setMessages((prev) => [...prev, { user: false, text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { user: false, text: "분석 데이터를 찾을 수 없습니다." },
        ]);
      }
    } catch (error) {
      console.error("fetch 요청 중 에러 발생:", error);
      setMessages((prev) => [
        ...prev,
        { user: false, text: "오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>채팅</ChatHeader>
      <ChatMessages>
        {messages.map((msg, index) => (
          <ChatMessage key={index} user={msg.user}>
            {msg.text}
          </ChatMessage>
        ))}
        <div ref={chatEndRef} />
      </ChatMessages>
      <ChatInputContainer>
        <ChatInput
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          placeholder="질문을 입력하세요..."
        />
        <ChatSendButton
          onClick={() => {
            console.log("Send 버튼 클릭됨"); // 디버깅 추가
            handleSendMessage();
          }}
        >
          보내기
        </ChatSendButton>{" "}
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default FloatingChat;

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 320px;
  max-height: 450px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const ChatHeader = styled.div`
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  margin: 8px 0;
  padding: 10px 15px;
  border-radius: 16px;
  align-self: ${(props) => (props.user ? "flex-end" : "flex-start")};
  background-color: ${(props) => (props.user ? "#007bff" : "#f1f1f1")};
  color: ${(props) => (props.user ? "white" : "black")};
  max-width: 75%;
  word-wrap: break-word;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const ChatSendButton = styled.button`
  padding: 10px 15px;
  margin-left: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: #0056b3;
  }
`;
