import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import SightseeingMap from './components/sightseeingMap/SightseeingMap';
import Search from './components/search/Search';
import Sidebar from './components/sidebar/Sidebar';
import AttractionDetail from './components/attractionDetail/AttractionDetail';
import { getSightSeeingSpotsByConditions, getAroundSpotById } from './server';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        key: "value in English",
      },
    },
    ja: {
      translation: {
        key: "日本語の値",
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// TODO 検索結果が見つからなかったらヘッダーに表示する
function App() {
  //出発地データ
  const departureSpotList = [
    { id: 0, name: "東京駅", latitude: 35.681236, longitude: 139.767125 },
  ];
  const sidebarRef = useRef(null);
  const attractionDetailRef = useRef(null);

  const [sightseeingSpotList, setSightseeingSpotList] = useState([]);
  const [selectedSightseeingSpot, setSelectedSightseeingSpot] = useState(null);
  const [aroundSightseeingSpotList, setAroundSightseeingSpotList] = useState(
    []
  );
  const [filteredSightseeingSpotList, setFilteredSightseeingSpotList] =
    useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDetailMounted, setIsDetailMounted] = useState(false);
  const [selectedDepartureSpot, setSelectedDepartureSpot] = useState(null);
  const [language, setLanguage] = useState("ja");

  useEffect(() => {
    setSightseeingSpotList(sightseeingSpotList);
    setFilteredSightseeingSpotList(sightseeingSpotList);
    if (sightseeingSpotList.length > 0) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [sightseeingSpotList]);

  const onTapSearchButton = (departure, durationMin, durationMax, fee) => {
    const fetchData = async () => {
      try {
        const json = await getSightSeeingSpotsByConditions(durationMax, durationMin, fee);
        // for (let i = 0; i < 5; i++) {
        //   console.log(json[i]);
        // }

        const spot = departureSpotList.find((spot) => spot.name === departure);
        setSelectedDepartureSpot(spot);

        // const json = await response.json();

        setSightseeingSpotList(json);
        setSelectedSightseeingSpot(null);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };
    fetchData();
  };
  const onTapFilterButton = (filterType) => {
    if (filterType === "all") {
      setFilteredSightseeingSpotList(aroundSightseeingSpotList);
    } else {
      setFilteredSightseeingSpotList(
        aroundSightseeingSpotList.filter(
          (sightseeingSpot) => sightseeingSpot.type === filterType
        )
      );
    }
  };
  const onTapCloseDetailButton = () => {
    setSelectedSightseeingSpot(null);
  };
  const onTapCloseSideBarButton = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setIsDetailMounted(false), 500);
    setSelectedSightseeingSpot(null);
  };
  const onTapOpenSideBarButton = () => {
    setIsSidebarOpen(true);
  };
  const onTapPin = (sightseeingSpot) => {
    setIsSidebarOpen(true);
    setIsDetailMounted(false);
    setTimeout(() => setIsDetailMounted(true), 500);
    setTimeout(() => setSelectedSightseeingSpot(sightseeingSpot), 500);
    const fetchData = async () => {
      try {
        const json = await getAroundSpotById(sightseeingSpot.id);

        // const json = await response.json();
        setAroundSightseeingSpotList(json);
        setFilteredSightseeingSpotList(json);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };
    fetchData();
  };
  const onTapSideBarContainer = (sightseeingSpot) => {
    setIsSidebarOpen(true);
    setIsDetailMounted(false);
    const fetchData = async () => {
      try {
        const json = await getAroundSpotById(sightseeingSpot.id);
        for (let i = 0; i < 5; i++) {
          console.log(json[i]);
        }

        // const json = await response.json();
        setAroundSightseeingSpotList(json);
        setFilteredSightseeingSpotList(json);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };
    fetchData();
    setTimeout(() => setIsDetailMounted(true), 500);
    setTimeout(() => setSelectedSightseeingSpot(sightseeingSpot), 500);
  };

  // 言語変更関数
  const onChangeLanguage = (lang) => {
    setLanguage(lang);
    // i18nでの言語設定更新もここで行う
    i18n.changeLanguage(lang);
  };

  return (
    <div className="App flex flex-col h-screen">
      <Search
        onTapSearchButton={onTapSearchButton}
        onChangeLanguage={onChangeLanguage}
        language={language}
      />
      <div className="flex-1 flex h-full overflow-hidden">
        {!isSidebarOpen && sightseeingSpotList.length > 0 && (
          <div className="sidebar-buttonbg-gray-800 overflow-y-auto text-white z-10 pt-20 flex-col justify-start">
            <button className="w-full h-full" onClick={onTapOpenSideBarButton}>
              <img
                src="/icons/open.png"
                alt="サイドバーを開く"
                className="w-8 h-8"
              />
            </button>
          </div>
        )}
        <div
          className={`sidebar w-1/5 bg-gray-800 h-full overflow-y-auto text-white z-10 transition-all duration-500 ${
            isSidebarOpen
              ? "transform translate-x-0"
              : "transform -translate-x-80"
          }`}
        >
          <Sidebar
            sightseeingSpotList={sightseeingSpotList}
            onAttractionSelect={onTapSideBarContainer}
            onTapCloseButton={onTapCloseSideBarButton}
            ref={sidebarRef}
            language={language}
          />
        </div>
        {selectedSightseeingSpot && (
          <div className="attraction-detail bg-gray-800 w-1/4 h-full overflow-y-auto border-l border-gray-400 z-10">
            <AttractionDetail
              attraction={selectedSightseeingSpot}
              onTapCloseButton={onTapCloseDetailButton}
              isMounted={isDetailMounted}
              filteredSightseeingSpotList={filteredSightseeingSpotList}
              onTapFilterButton={onTapFilterButton}
              ref={attractionDetailRef}
              language={language}
            />
          </div>
        )}
        <div className="absolute after:w-full h-full overflow-hidden z-0">
          <SightseeingMap
            sightseeingSpots={sightseeingSpotList}
            onTapPin={onTapPin}
            selectedSightseeingSpot={selectedSightseeingSpot}
            aroundSightseeingSpotList={aroundSightseeingSpotList}
            departureSpot={selectedDepartureSpot}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
export default App;