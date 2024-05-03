import React, { useState } from 'react';

function Search({ onTapSearchButton, onChangeLanguage, language }) {
  const [departure, setDeparture] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [fee, setFee] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onTapSearchButton(departure, durationMin, durationMax, fee);
  };

  // 言語切り替えボタンのイベントハンドラーを修正
  const handleLanguageButtonClick = (lang) => {
    onChangeLanguage(lang); // 親コンポーネントにも言語変更を通知（必要に応じて）
  };

  // 言語切り替えボタンのスタイル
  const buttonStyle = {
    color: "white",
    backgroundColor: "#4CAF50",
    padding: "10px 15px",
    margin: "5px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <header className="fixed top-0 w-full h-20 shadow-md bg-gray-900 z-50">
      <form
        onSubmit={handleSubmit}
        className="h-full flex justify-center items-center gap-20"
      >
        {/* 出発地の選択 */}
        <select
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          className="p-2 border border-gray-300 rounded bg-gray-700 text-white"
        >
          <option value="">
            {language === "en" ? "Select Departure" : "出発地を選択"}
          </option>
          <option value="東京駅">
            {language === "en" ? "Tokyo Station" : "東京駅"}
          </option>
        </select>

        {/* 滞在時間の入力 */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-gray-700 text-white w-16"
            placeholder={language === "en" ? "Min" : "最小"}
          />
          <div className="text-white">〜</div>
          <input
            type="text"
            value={durationMax}
            onChange={(e) => setDurationMax(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-gray-700 text-white w-16"
            placeholder={language === "en" ? "Max" : "最大"}
          />
          <div className="text-white pl-2">
            {language === "en" ? "min" : "分"}
          </div>
        </div>

        {/* 料金の入力 */}
        <div className="flex items-center">
          <input
            type="text"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="p-2 border border-gray-300 rounded bg-gray-700 text-white w-20"
            placeholder={language === "en" ? "Fee" : "高速料金"}
          />
          <div className="text-white pl-2">
            {language === "en" ? "yen" : "円"}
          </div>
        </div>

        {/* 検索ボタン */}
        <button
          type="submit"
          className="bg-gray-950 hover:bg-gray-900 border border-gray-300 text-white p-2 rounded"
        >
          {language === "en" ? "Search" : "検索"}
        </button>

        {/* 言語切り替えボタン */}
        <div>
          <button onClick={() => handleLanguageButtonClick("en")} style={buttonStyle}>
            English
          </button>
          <button onClick={() => handleLanguageButtonClick("ja")} style={buttonStyle}>
            日本語
          </button>
        </div>
      </form>
    </header>
  );
}

export default Search;
