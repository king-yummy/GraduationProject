import React, { useState, useEffect } from "react";
import styled from "styled-components";
import axios from "axios";

const NewsBanner = () => {
  const [newsData, setNewsData] = useState([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNewsUrl = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "https://api.allorigins.win/get?url=" +
            encodeURIComponent(
              "https://search.naver.com/search.naver?ssc=tab.news.all&where=news&sm=tab_jum&query=%EC%84%9C%EC%9A%B8%EC%8B%9C+%EC%83%81%EA%B6%8C"
            )
        );

        const html = response.data.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const newsElements = [
          "#sp_nws1 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws5 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws6 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws8 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws11 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws13 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
          "#sp_nws14 > div.news_wrap.api_ani_send > div > div.news_contents > a.news_tit",
        ];

        const newsData = newsElements
          .map((selector) => {
            const element = doc.querySelector(selector);
            return element
              ? { url: element.href, title: element.innerText }
              : null;
          })
          .filter((data) => data !== null);

        if (newsData.length === 0) {
          setNewsData([
            { url: "#", title: "뉴스 데이터를 불러올 수 없습니다." },
          ]);
        } else {
          setNewsData(newsData);
        }
      } catch (error) {
        console.error("Failed to fetch news URL", error);
        setNewsData([{ url: "#", title: "뉴스 데이터를 불러올 수 없습니다." }]);
      }
      setLoading(false);
    };

    fetchNewsUrl();
  }, []);

  useEffect(() => {
    if (newsData.length > 0) {
      const intervalId = setInterval(() => {
        setCurrentNewsIndex((prevIndex) => (prevIndex + 1) % newsData.length);
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [newsData]);

  const currentNews = newsData[currentNewsIndex];

  return (
    <ClickableBanner
      onClick={() => currentNews && window.open(currentNews.url, "_blank")}
    >
      <span>
        📢{" "}
        {loading
          ? "Loading..."
          : currentNews
          ? currentNews.title
          : "뉴스 제목을 불러올 수 없습니다."}
      </span>
    </ClickableBanner>
  );
};

const ClickableBanner = styled.div`
  background-color: rgb(52, 119, 235);
  color: white;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  font-size: 13px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 20px;
  right: 150px; /* 왼쪽 상단으로 위치 변경 */
  z-index: 1000;
  width: auto;
  max-width: 600px;

  &:hover {
    background-color: #0056b3;
  }

  span {
    font-weight: bold;
  }
`;

export default NewsBanner;
