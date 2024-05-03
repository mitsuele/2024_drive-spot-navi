import React from "react";
import Rating from "./Rating"; // Ratingコンポーネントをインポート

function SidebarContainer({ attraction, language }) {
  return (
    <div className="m-4 bg-gray-800 text-white">
      <div className="text-lg font-semibold my-2">{attraction.name}</div>

      {/* 画像の表示 */}
      {attraction.image_path && (
        <img
          src={attraction.image_path}
          alt={attraction.name}
          className="h-16 w-16 my-2 object-cover"
        />
      )}

      {/* レーティング */}
      <div className="my-1 flex items-center">
        <div>{attraction.rating}</div>
        <div className="px-2">
          <Rating score={attraction.rating} />
        </div>
        <div>({attraction.user_ratings_total})</div>
      </div>

      {/* 料金、時間、距離の表示 */}
      <div className="my-2">
      <div>
        <span className="font-semibold">
          {language === "en" ? "Distance:" : "距離:"}
        </span>{" "}
        {(attraction.distance / 1000).toFixed(2)} km
      </div>
        <div>
          <span className="font-semibold">
            {language === "en" ? "Time:" : "時間:"}
          </span>{" "}
          {Math.floor(attraction.time / 60)}{" "}
          {language === "en" ? "h" : "時間"}{" "}
          {attraction.time - 60 * Math.floor(attraction.time / 60)}{" "}
          {language === "en" ? "min" : "分"}
        </div>
        <div>
          <span className="font-semibold">
            {language === "en" ? "Highway Fee:" : "高速料金:"}
          </span>{" "}
          {parseInt(attraction.fee)} {language === "en" ? "yen" : "円"}
        </div>
      </div>

      {/* Googleマップリンク */}
      <a
        href={attraction.googlemap_link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 hover:underline"
      >
        {language === "en" ? "Open in Google Maps" : "Google Mapで開く"}
      </a>
    </div>
  );
}

export default SidebarContainer;
