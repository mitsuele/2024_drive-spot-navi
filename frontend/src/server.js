const d3 = require('d3');

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
    const routeFilePath = data_path + "driving_data/route.csv";
    const routeResults = await d3.csv(routeFilePath);

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
        const one_day_price = filteredRouteResults[spot.id]? rentCarFeeOneDay + filteredRouteResults[spot.id].distance / 1000 * rentCarFeePerKm : 0;
        const two_day_price = filteredRouteResults[spot.id]? rentCarFeeTwoDay + filteredRouteResults[spot.id].distance / 1000 * rentCarFeePerKm : 0;
        return {
          ...spot,
          distance: filteredRouteResults[spot.id]?.distance,
          time: filteredRouteResults[spot.id]?.time,
          fee: filteredRouteResults[spot.id]?.fee,
          one_day_price: one_day_price,
          two_day_price: two_day_price
        };
      });
    
    return enhancedSightSeeingSpots;
  } catch (err) {
    console.log(err);
  }
}

// 指定されたIDの近くの場所のIDリストを取得する関数
async function getNearbyPlaceIds(aroundSpotFilePath, id) {
  const sightSeeingSpots = await d3.csv(aroundSpotFilePath);
  const spot = sightSeeingSpots.find(s => s.id === id);
  return spot ? spot.nearby_places.split('-') : [];
}

// 指定されたIDリストに基づいてsightseeing_spot.csvから情報を取得する関数
async function getSightSeeingSpotsByIds(sightSeeingFilePath, ids) {
  const sightSeeingSpots = await d3.csv(sightSeeingFilePath);
  return sightSeeingSpots.filter(spot => ids.includes(spot.id) && parseInt(spot.user_ratings_total, 10) >= 100);
}

// 観光地の周辺情報を取得するAPI
export async function getAroundSpotById(id) {
  try {
    const aroundSpotFilePath = data_path + "sightseeing_data/around_spot_10km.csv";
    const sightSeeingFilePath = data_path + "all_spot_sorted.csv";

    const nearbyPlaceIds = await getNearbyPlaceIds(aroundSpotFilePath, id);
    const filteredSightSeeingSpots = await getSightSeeingSpotsByIds(sightSeeingFilePath, nearbyPlaceIds);

    return filteredSightSeeingSpots;
  } catch (err) {
    console.log(err);
  }
}
