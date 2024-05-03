import React, {useEffect, useState, forwardRef} from 'react';
import Rating from '../sidebar/Rating';
import AroundSightseeingSpotContainer from './aroundSightseeingSpotContainer';

const AttractionDetail = forwardRef(({ attraction, onTapCloseButton, isMounted, filteredSightseeingSpotList, onTapFilterButton, language }, ref) => {
  const [sortType, setSortType] = useState('');

  const filterList = (type) => {
    setSortType(type);
    onTapFilterButton(type);
    console.log("fileterList関数が呼ばれました")
  };
  useEffect(() => {
    setSortType('all');
  }
  , [isMounted])
  return (
    <div
      className={`mx-2 text-white transition-all transform duration-700 ease-in-out ${
        isMounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <div className="sticky top-20 z-50 bg-gray-800">
        {/* ヘッダー部分：閉じるボタンと名前 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold mt-4">{attraction.name}</h1>
          <button
            onClick={onTapCloseButton}
            className="w-6 h-6 flex items-center justify-center mt-4"
          >
            <img
              src="/icons/closeIcon.png"
              alt="閉じる"
              className="w-full h-full"
            />
          </button>
        </div>
        {/* 観光地の詳細情報 */}
        {attraction.image_path && (
          <img
            src={attraction.image_path}
            alt={attraction.name}
            className="h-36 w-full my-2 object-cover"
          />
        )}
        <div className="my-1 flex items-center">
          <div>{attraction.rating}</div>
          <div className="px-2">
            <Rating score={attraction.rating} />
          </div>
          <div>({attraction.user_ratings_total})</div>
        </div>

        <div className="my-2 text-sm">
          <span className="font-semibold">
            {language === "en" ? "Distance:" : "距離:"}
          </span>{" "}
          {(attraction.distance / 1000).toFixed(2)} km
          <span className="mx-1"></span>
          <span className="font-semibold">
            {language === "en" ? "Time:" : "時間:"}
          </span>{" "}
          {Math.floor(attraction.time / 60)} {language === "en" ? "h" : "時間"}{" "}
          {attraction.time - 60 * Math.floor(attraction.time / 60)}
          {language === "en" ? "min" : "分"}
          <span className="mx-1"></span>
          <br />
          <span className="font-semibold">
            {language === "en" ? "Fee:" : "高速料金: "}
          </span>{" "}
          {parseInt(attraction.fee)} {language === "en" ? "yen" : "円"}
          <br />
          <span className="font-semibold">
            {language === "en"
              ? "1 day fee (including car rental):"
              : "1日料金(レンタカー代込): "}
          </span>{" "}
          {parseInt(attraction.one_day_price)}{" "}
          {language === "en" ? "yen" : "円"}
          <br />
          <span className="font-semibold">
            {language === "en"
              ? "2 day fee (including car rental):"
              : "2日料金(レンタカー代込): "}
          </span>{" "}
          {parseInt(attraction.two_day_price)}{" "}
          {language === "en" ? "yen" : "円"}
        </div>

        <a
          href={attraction.googlemap_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {language === "en" ? "Open in Google Maps" : "Google Mapで開く"}
        </a>
        <hr className="border-gray-300 mt-2" />
        {/* 周辺の観光地リストの見出しと区切り線 */}
        <div className="flex justify-between items-center pt-2 pb-2 shadow-2xl">
          <h2 className="text-xl font-semibold mb-2">
            {language === "en" ? "Neaby Spots" : "周辺の観光地"}（
            {filteredSightseeingSpotList.length}
            {language === "en" ? " spots" : "件"}）
          </h2>
          <div className="hs-dropdown relative inline-flex">
            <select
              value={sortType}
              onChange={(e) => filterList(e.target.value)}
              className="bg-gray-800 border border-gray-300 text-white rounded py-2 px-2 w-24"
            >
              <option value="all">
                {language === "en" ? "all" : "すべて"}
              </option>
              <option value="gourmet">
                {language === "en" ? "gourmet" : "グルメ"}
              </option>
              <option value="sightseeing">
                {language === "en" ? "sightseeing" : "観光地"}
              </option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-300" />

      {/* 周辺の観光地のリスト */}
      <div ref={ref} className="mt-20 mb-2">
        {filteredSightseeingSpotList.map((spot, index) => (
          <React.Fragment key={spot.id}>
            <AroundSightseeingSpotContainer
              id={spot.id}
              name={spot.name}
              image_path={spot.image_path}
              rating={spot.rating}
              user_ratings_total={spot.user_ratings_total}
              googlemap_link={spot.googlemap_link}
              tag={spot.type}
              language={language}
            />
            {index < filteredSightseeingSpotList.length - 1 && (
              <hr className="my-2 border-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default AttractionDetail;
