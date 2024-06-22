import React from "react";
import styled from "styled-components";
import RankingItem from "./RankingItem";

const RankingsList = ({ title, rankingsByDay, type }) => {
  const [selectedDay, setSelectedDay] = React.useState(
    type === "population" ? Object.keys(rankingsByDay)[0] || "" : ""
  );

  if (!rankingsByDay || !Object.keys(rankingsByDay).length) {
    return <div>데이터 없음...</div>;
  }

  const days = type === "population" ? Object.keys(rankingsByDay) : [];
  const selectedData = type === "population" ? rankingsByDay[selectedDay] : rankingsByDay;

  return (
    <Container>
      {type === "population" && (
        <MenuBar>
          {days.map((day) => (
            <MenuItem
              key={day}
              isActive={day === selectedDay}
              onClick={() => setSelectedDay(day)}
            >
              {day}
            </MenuItem>
          ))}
        </MenuBar>
      )}
      <List>
        {selectedData &&
          selectedData.slice(0, 10).map((item, index) => (
            <RankingItem
              key={index}
              rank={index + 1}
              district={item.자치구_코드_명}
              neighborhood={item.행정동_코드_명}
              value={type === "sales" ? item.평균_매출_20234?.toLocaleString() || 'N/A' : item.current_population?.toLocaleString() || 'N/A'}
              changePercentage={type === "sales" ? item.평균_매출_변화량?.toFixed(2) || 'N/A' : item.change_percentage?.toFixed(2) || 'N/A'}
              type={type}
            />
          ))}
      </List>
    </Container>
  );
};

export default RankingsList;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px; /* 적절한 너비로 설정 */
  margin: 0;
  padding: 0 20px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 리스트 항목 간격을 적절하게 조정 */
`;

const MenuBar = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 10px 0 0 0;
  border-radius: 5px;
`;

const MenuItem = styled.button`
  flex: 1;
  background: ${({ isActive }) => (isActive ? "#61dafb" : "transparent")};
  border: 1px solid #ffffffcc;
  color: ${({ isActive }) => (isActive ? "#282c34" : "#ffffff")};
  font-size: 16px;
  padding: 5px;
  cursor: pointer;
  transition: background 0.3s;
  height: 38px;

  &:hover {
    background: #61dafb;
    color: #282c34;
  }
`;
