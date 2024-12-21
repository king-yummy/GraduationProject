import React, { useState } from "react";
import styled from "styled-components";

export default function ChatSection() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // OpenAI API 키를 직접 하드코딩
  const OPENAI_API_KEY =
    "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";
  const FINE_TUNED_MODEL =
    "ft:gpt-4o-mini-2024-07-18:personal:sanggon-final:AZfKqVN2"; // 파인튜닝된 모델 이름

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // 초기 system 메시지
    const systemMessage = {
      role: "system",
      content: "당신은 서울시 상권분석 챗봇입니다.",
    };

    // 사용자 메시지
    const userMessage = {
      role: "user",
      content: input,
    };

    // 기존 messages에 system 메시지를 추가하여 컨텍스트 유지
    const updatedMessages =
      messages.length === 0
        ? [systemMessage, userMessage] // 처음 대화일 때
        : [...messages, userMessage]; // 기존 대화 이어갈 때

    setMessages(updatedMessages);
    setInput("");

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: FINE_TUNED_MODEL,
            messages: updatedMessages,
            max_tokens: 1024,
            temperature: 0.3,
            top_p: 0.4, // 확률 분포 제한
            frequency_penalty: 0, // 단어 반복 억제
            presence_penalty: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch response from OpenAI API");
      }

      const data = await response.json();
      const botMessage = {
        role: "assistant",
        content: data.choices[0].message.content,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content: "에러가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    }
  };

  return (
    <ChatWrapper>
      <ChatWindow>
        {messages.map((message, index) => (
          <Message key={index} role={message.role}>
            {message.content}
          </Message>
        ))}
      </ChatWindow>
      <ChatInputWrapper>
        <ChatInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <SendButton onClick={handleSendMessage}>보내기</SendButton>
      </ChatInputWrapper>
    </ChatWrapper>
  );
}

const ChatWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
`;

const ChatWindow = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
`;

const Message = styled.div`
  padding: 8px 12px;
  margin: 4px 0;
  background-color: ${({ role }) => (role === "user" ? "#d1e7ff" : "#f1f1f1")};
  border-radius: 8px;
  align-self: ${({ role }) => (role === "user" ? "flex-end" : "flex-start")};
`;

const ChatInputWrapper = styled.div`
  display: flex;
  padding: 8px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SendButton = styled.button`
  margin-left: 8px;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;
