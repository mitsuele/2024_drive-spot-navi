import React, { useEffect, useState, forwardRef } from 'react';
import SidebarContainer from './SidebarContainer';

// forwardRefを使ってrefを受け取る
const Sidebar = forwardRef(({ sightseeingSpotList, onAttractionSelect, onTapCloseButton, language }, ref) => {
  const [touristAttractionList, setTouristAttractionList] = useState([]);
  const [sortType, setSortType] = useState('');

  useEffect(() => {
    setTouristAttractionList(sightseeingSpotList);
  }, [sightseeingSpotList]);

  const sortList = (type) => {
    const sortedList = [...touristAttractionList].sort((a, b) => {
      if (type === 'score') {
        return b.rating - a.rating;
      } else if (type === 'count') {
        return b.user_ratings_total - a.user_ratings_total;
      } else if (type === 'score*count') {
        return (b.rating * b.user_ratings_total) - (a.rating * a.user_ratings_total);
      }
      return 0;
    });

    setTouristAttractionList(sortedList);
    setSortType(type);
  };

  return (
    // ref属性を追加して、外部からの参照を可能にする
    <div
      className="bg-gray-800 w-600 shadow-md pt-20 overflow-auto"
      style={{ height: "100vh" }}
      ref={ref}
    >
      <div className="sticky top-0 z-10 flex justify-between items-center bg-gray-800 px-2 py-2 overflow-hidden shadow-2xl">
        <div className="text-xl">
          {language === "en" ? "Results" : "検索結果"}
        </div>
        <select
          value={sortType}
          onChange={(e) => sortList(e.target.value)}
          className="bg-gray-800 border border-gray-300 text-white rounded py-2 px-2 w-32"
        >
          <option value="">{language === "en" ? "Sort" : "ソート"}</option>
          <option value="score">
            {language === "en" ? "Review" : "レビュー"}
          </option>
          <option value="count">
            {language === "en" ? "Number of Reviews" : "レビュー数"}
          </option>
          <option value="score*count">
            {language === "en" ? "Popularity" : "人気"}
          </option>
        </select>
        <button onClick={onTapCloseButton} className="w-6 h-6 ml-4">
          <img
            src="/icons/closeIcon.png"
            alt="サイドバーを閉じる"
            className="w-full h-full"
          />
        </button>
      </div>
      {touristAttractionList.map((attraction, index) => (
        <div
          key={index}
          className="border-y border-gray-300 cursor-pointer"
          onClick={() => onAttractionSelect(attraction)}
        >
          <SidebarContainer attraction={attraction} language={language} />
        </div>
      ))}
    </div>
  );
});

export default Sidebar;
