import React, { useState } from "react";
import styled from "styled-components";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSearch = () => {
        onSearch(query);
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <SearchBarContainer>
            <SearchIcon>🔍</SearchIcon>
            <Input
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="구, 동, 업종을 입력하세요..."
            />
        </SearchBarContainer>
    );
};

export default SearchBar;

const SearchBarContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 20px auto;
    width: 100%;
    max-width: 600px;
    border: 1px solid #ddd;
    border-radius: 50px;
    padding: 10px 20px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    background-color: white;
`;

const SearchIcon = styled.span`
    font-size: 20px;
    margin-right: 10px;
    color: #aaa;
`;

const Input = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 16px;
    padding: 5px;
    background: none;
    width: 100%;
    color: #333;

    &::placeholder {
        color: #aaa;
    }
`;
