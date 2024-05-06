import React, { useEffect, useState, useRef } from 'react';
// const express = require('express');
// const fs = require('fs');
// const csv = require('csv-parser');
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// import Papa from 'papaparse';
// import { parse } from 'path';
const d3 = require('d3');

// 距離と値段を指定して取得するAPI
// const parseCSV = async (dataFile) => {
//   try {
//     const text = await dataFile.text();
//     const { data } = Papa.parse(text, { header: true });
//     for (let i = 0; i < 5; i++) {
//       const row = data[i];
//       console.log(row);
//     }
//     return data;
//   } catch (error) {
//     throw new Error('Error reading CSV file: ' + error.message);
//   }
// };
// const readCsv = (filePath) => {
//   return new Promise((resolve, reject) => {
//     const results = [];
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on("data", (data) => results.push(data))
//       .on("end", () => resolve(results))
//       .on("error", (error) => reject(error));
//   });
// };

const data_path = 'data/';

export async function getSightSeeingSpotsByConditions(durationMin, durationMax, fee) {
  durationMin = durationMin || 0;
  durationMax = durationMax || 110;
  const price = fee || 100000;
  const departureSpotId = 0;
  
  //レンタカー料金周り
  const rentCarFeeOneDay = 7000;
  const rentCarFeeTwoDay = 11000;
  const rentCarFeePerKm = 16;

  try {
    const routeFilePath = data_path + "driving_data/departure_spot.csv";
    console.log(routeFilePath);
    const routeResults = await d3.csv(routeFilePath);
    for (let i = 0; i < 5; i++) {
      console.log(routeResults[i]);
    }

    // 距離と時間のデータを格納するオブジェクトを作成
    const spotDistanceTimeMap = routeResults.reduce((acc, data) => {
      acc[data.sight_seeing_spot_id] = {
        distance: data.distance,
        time: data.time,
        fee: data.fee,
        one_day_price: rentCarFeeOneDay + data.distance / 1000 * rentCarFeePerKm,
        two_day_price: rentCarFeeTwoDay + data.distance / 1000 * rentCarFeePerKm
      };
      return acc;
    }, {});

    // 絞り込み条件に合うルートをフィルタリング
    const filteredRouteResults = routeResults.filter((data) => {
      // console.log(data);
      const isTimeValid = (durationMin <= parseInt(data.time, 10)) && (parseInt(data.time, 10) <= durationMax);
      const isPriceValid = parseInt(data.fee, 10) <= price;
      const isDepartureSpotValid = departureSpotId ? data.departure_spot_id === departureSpotId : true;
      return isTimeValid && isPriceValid && isDepartureSpotValid;
    });

    const spotIds = new Set(filteredRouteResults.map((data) => data.sight_seeing_spot_id));

    const sightSeeingSpotsFilePath = data_path + "sightseeing_data/sight_seeing_spot.csv";
    const sightSeeingSpots = await d3.csv(sightSeeingSpotsFilePath);

    // 観光スポット情報に距離と時間のデータを組み込む
    const enhancedSightSeeingSpots = sightSeeingSpots
      .filter(spot => spotIds.has(spot.id) && parseInt(spot.user_ratings_total, 10) >= 500)
      .map(spot => {
        return {
          ...spot,
          distance: spotDistanceTimeMap[spot.id]?.distance,
          time: spotDistanceTimeMap[spot.id]?.time,
          fee: spotDistanceTimeMap[spot.id]?.fee,
          one_day_price: spotDistanceTimeMap[spot.id]?.one_day_price,
          two_day_price: spotDistanceTimeMap[spot.id]?.two_day_price
        };
      });
    
    return d3.json(enhancedSightSeeingSpots);
  } catch (err) {
    console.log(err);
  }
}

// app.get("/api/sightseeing_spot/filter", async function (req, res) {
//   const durationMin = req.query.durationMin !== '' ? parseInt(req.query.durationMin, 10) : 100;
//   const durationMax = req.query.durationMax !== '' ? parseInt(req.query.durationMax, 10) : 110;

//   const price = req.query.price !== '' ? parseInt(req.query.price, 10) : 100000;

//   const departureSpotId = req.query.departure_spot_id;

//   //レンタカー料金周り
//   const rentCarFeeOneDay = 7000;
//   const rentCarFeeTwoDay = 11000;
//   const rentCarFeePerKm = 16;
  

//   try {
//     const routeResults = await readCsv(data_path + "driving_data/route.csv");

//     // 距離と時間のデータを格納するオブジェクトを作成


//     const spotDistanceTimeMap = routeResults.reduce((acc, data) => {
//       acc[data.sight_seeing_spot_id] = {
//         distance: data.distance,
//         time: data.time,
//         fee: data.fee,
//         one_day_price: rentCarFeeOneDay + data.distance / 1000 * rentCarFeePerKm,
//         two_day_price: rentCarFeeTwoDay + data.distance / 1000 * rentCarFeePerKm
//       };
//       return acc;
//     }, {});

//     // 絞り込み条件に合うルートをフィルタリング
//     const filteredRouteResults = routeResults.filter((data) => {
//       console.log(data);
//       const isTimeValid = (durationMin <= parseInt(data.time, 10)) && (parseInt(data.time, 10) <= durationMax);
//       const isPriceValid = parseInt(data.fee, 10) <= price;
//       const isDepartureSpotValid = departureSpotId ? data.departure_spot_id === departureSpotId : true;
//       return isTimeValid && isPriceValid && isDepartureSpotValid;
//     });

//     const spotIds = new Set(filteredRouteResults.map((data) => data.sight_seeing_spot_id));

//     const sightSeeingSpots = await readCsv(data_path + "sight_seeing_spot.csv");

//     // 観光スポット情報に距離と時間のデータを組み込む
//     const enhancedSightSeeingSpots = sightSeeingSpots
//       .filter(spot => spotIds.has(spot.id) && parseInt(spot.user_ratings_total, 10) >= 500)
//       .map(spot => {
//         return {
//           ...spot,
//           distance: spotDistanceTimeMap[spot.id]?.distance,
//           time: spotDistanceTimeMap[spot.id]?.time,
//           fee: spotDistanceTimeMap[spot.id]?.fee,
//           one_day_price: spotDistanceTimeMap[spot.id]?.one_day_price,
//           two_day_price: spotDistanceTimeMap[spot.id]?.two_day_price
//         };
//       });
    
//     console.log(enhancedSightSeeingSpots);
//     res.json(enhancedSightSeeingSpots);
//   } catch (err) {
//     return Error400Body(res, err);
//   }
// });

// 指定されたIDの近くの場所のIDリストを取得する関数
async function getNearbyPlaceIds(aroundSpotFilePath, id) {
  const sightSeeingSpots = await d3.csv(aroundSpotFilePath);
  const spot = sightSeeingSpots.find(s => s.id === id);
  return spot ? spot.nearby_places.split('-') : [];
}

// 指定されたIDリストに基づいてsightseeing_spot.csvから情報を取得する関数
async function getSightSeeingSpotsByIds(sightSeeingFilePath, ids) {
  const sightSeeingSpots = await d3.csv(sightSeeingFilePath);
  for (let i = 0; i < 5; i++) {
    console.log(sightSeeingSpots[i]);
  }
  return sightSeeingSpots.filter(spot => ids.includes(spot.id) && parseInt(spot.user_ratings_total, 10) >= 100);
}

// 観光地の周辺情報を取得するAPI
export async function getAroundSpotById(id) {
  try {
    const aroundSpotFilePath = data_path + "sightseeing_data/around_spot_10km.csv";
    const sightSeeingFilePath = data_path + "all_spot_sorted.csv";

    const nearbyPlaceIds = await getNearbyPlaceIds(aroundSpotFilePath, id);
    const filteredSightSeeingSpots = await getSightSeeingSpotsByIds(sightSeeingFilePath, nearbyPlaceIds);

    return d3.json(filteredSightSeeingSpots);
  } catch (err) {
    console.log(err);
  }
}

// app.get("/api/around_spot/:id", async function (req, res) {
//   const id = req.params.id;
//   console.log('id', id);

//   try {
//     const aroundSpotFilePath =
//       data_path +
//       "sightseeing_data/around_spot_10km.csv";
//     const sightSeeingFilePath = data_path + "all_spot_sorted.csv";

//     const nearbyPlaceIds = await getNearbyPlaceIds(aroundSpotFilePath, id);
//     console.log('nearbyPlaceIds', nearbyPlaceIds);
//     const filteredSightSeeingSpots = await getSightSeeingSpotsByIds(sightSeeingFilePath, nearbyPlaceIds);
//     console.log('filteredSightSeeingSpots', filteredSightSeeingSpots);

//     res.json(filteredSightSeeingSpots);
//   } catch (err) {
//     return Error400Body(res, err);
//   }
// });
