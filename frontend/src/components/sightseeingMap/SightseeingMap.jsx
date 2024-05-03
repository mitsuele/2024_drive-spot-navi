import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import './styles.css';


function SightseeingMap({ sightseeingSpots, onTapPin, selectedSightseeingSpot, aroundSightseeingSpotList, departureSpot, language }) {
  const ref = useRef();
  const svgRef = useRef(); // SVG要素を保持するためのref
  const projectionRef = useRef(); // projection関数を保持するためのref
  const zoomRef = useRef(); // zoom関数を保持するためのref
  const mapWidth = 1440;
  const mapHeight = 800;
  const zoomLevel = 1;
  const tappedZoomLevel = 5; 

  const backgroundColor = 'rgba(10, 10, 10, 0.8)';
  const borderColor = 'rgba(255, 255, 255, 0.5)';
  const regionColor = 'rgba(20, 20, 35, 0.8)';
  

  const calculatePinSize = (zoomScale) => {
    const minSize = 2; // Slightly larger minimum size for better visibility at smaller scales
    const maxSize = 5; // Maximum size for visibility at larger scales
    const scale = d3.scaleLinear().domain([0.5, 10]).range([maxSize, minSize]);
    return scale(zoomScale);
  };
  
  const calculateBorderThickness = (zoomScale) => {
    const minThickness = 0.2; // Minimum thickness for consistency
    const maxThickness = 0.5; // Maximum thickness for visibility at larger scales
    const scale = d3.scaleLinear().domain([0.5, 10]).range([maxThickness, minThickness]);
    return scale(zoomScale);
  };

  const calculateAroundPinSize = (zoomScale) => {
    const minSize = 1.5; // Slightly larger minimum size for better visibility at smaller scales
    const maxSize = 3; // Maximum size for visibility at larger scales
    const scale = d3.scaleLinear().domain([0.5, 10]).range([maxSize, minSize]);
    return scale(zoomScale);
  };
  
  const calculateAroundBorderThickness = (zoomScale) => {
    const minThickness = 0.1; // Minimum thickness for consistency
    const maxThickness = 0.25; // Maximum thickness for visibility at larger scales
    const scale = d3.scaleLinear().domain([0.5, 10]).range([maxThickness, minThickness]);
    return scale(zoomScale);
  };

  const initialPinSize = calculatePinSize(zoomLevel);
  const initialBorderThickness = calculateBorderThickness(zoomLevel);

  useEffect(() => {

    // const sortedSpots = [...sightseeingSpots].sort((a, b) => b.rating - a.rating);
    const topTenPercentCount = Math.ceil(sightseeingSpots.length * 0.1);
    const topTenPercentSpots = new Set(
      sightseeingSpots.slice(0, topTenPercentCount).map((spot) => spot.id)
    );

    const hideTooltip = () => {
      svg.selectAll(".tooltip").remove();
    };


    d3.select(ref.current).selectAll("*").remove();
    const svg = d3.select(ref.current)
                  .append('svg')
                  .attr('width', mapWidth)
                  .attr('height', mapHeight)
                  .style('background-color', backgroundColor);
    svgRef.current = svg; // SVG要素をrefに保存

    const projection = d3.geoMercator()
                         .center([139, 36])
                         .translate([mapWidth/2, mapHeight/2])
                         .scale(13000);
    projectionRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        const zoomScale = event.transform.k; // Get the current zoom scale
        const currentPinSize = calculatePinSize(zoomScale);
        const currentBorderThickness = calculateBorderThickness(zoomScale);
        const currentAroundPinSize = calculateAroundPinSize(zoomScale);
        const currentAroundBorderThickness = calculateAroundBorderThickness(zoomScale);

        // Update the transform of the paths and sightseeing spots
        svg.selectAll('path').attr('transform', event.transform);
        svg.selectAll('.sightseeing-spot')
          .attr('transform', event.transform)
          .attr('r', currentPinSize)
          .attr('stroke-width', currentBorderThickness);

        svg.selectAll('.departure-spot')
           .attr('transform', event.transform)
          .attr('r', currentPinSize)
          .attr('stroke-width', currentBorderThickness);

        svg.selectAll('.around-sightseeing-spot')
          .attr('transform', event.transform)

          .attr('r', currentAroundPinSize)
          .attr('stroke-width', currentBorderThickness);
        svg.selectAll(".tooltip")
          .attr("transform", event.transform);
        hideTooltip();
        hideSightseeingSpotTooltip();
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity.scale(zoomLevel));
    

    const zoomAndSlideRight = (coordinates) => {
      const [x, y] = projection(coordinates);
      const xOffset = 50;

      svg.transition()
         .duration(750)
         .call(
           zoom.transform,
           d3.zoomIdentity
             .translate(mapWidth / 2, mapHeight / 2)
             .scale(tappedZoomLevel)
             .translate(-x + xOffset, -y)
         );
    };
    const getCurrentZoomState = () => {
      return d3.zoomTransform(svg.node());
    };

    const showSightseeingSpotTooltip = (d, event) => {
      const coordinates = projection([d.longitude, d.latitude]);
      const zoomState = getCurrentZoomState();
      // 座標をズーム状態に基づいて調整
      const adjustedX = coordinates[0] * zoomState.k + zoomState.x;
      const adjustedY = coordinates[1] * zoomState.k + zoomState.y;

      svg.selectAll(".sightseeing-tooltip").remove();

      const sightseeingTooltipGroup = svg
        .append("g")
        .attr("class", "sightseeing-tooltip")
        .attr("transform", `translate(${adjustedX}, ${adjustedY})`);
      sightseeingTooltipGroup
        .append("rect")
        .attr("width", 300)
        .attr("height", 150)
        .attr("class", "tooltip-background");
      sightseeingTooltipGroup
        .append("text")
        .text(d.name)
        .attr("x", 10)
        .attr("y", 20)
        .attr("class", "tooltip-text");
      if (d.image_path) {
        sightseeingTooltipGroup
          .append("image")
          .attr("xlink:href", d.image_path)
          .attr("x", 10)
          .attr("y", 30)
          .attr("width", 100)
          .attr("height", 100);
      }
      sightseeingTooltipGroup
        .append("text")
        .text(`レビュー: ${d.rating} (${d.user_ratings_total}件)`)
        .attr("x", 120)
        .attr("y", 90)
        .attr("class", "tooltip-text");
      if (d.googlemap_link) {
        sightseeingTooltipGroup
          .append("text")
          .text("Google Mapで開く")
          .attr("x", 120)
          .attr("y", 110)
          .attr("class", "tooltip-text")
          .style("text-decoration", "underline")
          .style("fill", "blue")
          .on("click", () => window.open(d.googlemap_link, "_blank"));
      }
      sightseeingTooltipGroup.on("mouseenter", (event) => {
        event.stopPropagation();
      })
      sightseeingTooltipGroup.on("mouseleave", () => {
        hideSightseeingSpotTooltip();
      });

    };
    const hideSightseeingSpotTooltip = () => {
      svg.selectAll(".sightseeing-tooltip").remove();
    }

    d3.json('data/japan.topojson').then(japan => {
      svg.selectAll('.region')
         .data(topojson.feature(japan, japan.objects.japan).features)
         .enter()
         .append('path')
         .attr('class', 'region')
         .attr('d', path)
         .attr('fill', regionColor)
         .attr('stroke', borderColor);

        svg.selectAll(".sightseeing-spot")
          .data(sightseeingSpots)
          .enter()
          .append("circle")
          .attr("class", (d) => "sightseeing-spot" + (topTenPercentSpots.has(d.id) ? " pulse" : ""))
          .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
          .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
          .attr("r", initialPinSize)
          .attr("stroke-width", initialBorderThickness)
          .attr("fill", (d) => topTenPercentSpots.has(d.id) ? "gold" : "#00bfff")
          .attr("stroke", "white")
          .on("click", (event, d) => {
            zoomAndSlideRight([d.longitude, d.latitude]);
            onTapPin(d);
          })
          .each(function(d) {
            if (topTenPercentSpots.has(d.id)) {
              d3.select(this).raise(); // 上位10%のスポットを最上層に表示
            }
          })
          svg.selectAll(".sightseeing-spot")
            .on("mouseenter", (event, d) => {
              showSightseeingSpotTooltip(d, event);
              hideTooltip();
            })
            .on("mouseleave", () => {
            });
            const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${mapWidth - 260}, ${mapHeight - 195})`); // 位置を調整

legend.append("rect")
.attr("x", 0)
.attr("y", 0)
.attr("width", 240) // 背景の幅
.attr("height", 160) // 背景の高さ
.attr("fill", "gray") // 背景色
.attr("stroke", "black") // ボーダー色
.attr("stroke-width", 1) // ボーダーの太さ
.attr("rx", 10) // 角丸の半径（X軸方向）
.attr("ry", 10); // 角丸の半径（Y軸方向）

// 出発地の凡例
legend.append("circle")
.attr("cx", 30)
.attr("cy", 20)
.attr("r", initialPinSize)
.attr("fill", "red")
.attr("stroke", "white")
.attr("stroke-opacity", 0.4)
.classed("pulse", true);
legend.append("text")
.attr("x", 50)
.attr("y", 25)
.text("出発地")
.attr("class", "legend-text");

// 上位10%の観光地の凡例
legend.append("circle")
.attr("cx", 30)
.attr("cy", 50)
.attr("r", initialPinSize)
.attr("fill", "gold")
.attr("stroke", "white")
.classed("pulse", true);
legend.append("text")
.attr("x", 50)
.attr("y", 55)
.text("上位10%の観光地")
.attr("class", "legend-text");

// その他の観光地の凡例
legend.append("circle")
.attr("cx",30)
.attr("cy", 80)
.attr("r", initialPinSize)
.attr("fill", "#00bfff");
legend.append("text")
.attr("x", 50)
.attr("y", 85)
.text("その他の観光地")
.attr("class", "legend-text");

// 周辺グルメスポットの凡例
legend.append("circle")
.attr("cx", 30)
.attr("cy", 110)
.attr("r", initialPinSize)
.attr("fill", "#F08080");
legend.append("text")
.attr("x", 50)
.attr("y", 115)
.text("周辺グルメスポット")
.attr("class", "legend-text");

// 周辺観光スポットの凡例
legend.append("circle")
.attr("cx",30)
.attr("cy", 140)
.attr("r", initialPinSize)
.attr("fill", "#90EE90");
legend.append("text")
.attr("x", 50)
.attr("y", 145)
.text("周辺観光スポット")
.attr("class", "legend-text");

            

      if (departureSpot) {

        svg
          .selectAll(".departure-spot")
          .data([departureSpot])
          .enter()

          .append("circle")
          
          .attr("class", "departure-spot")
          .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
          .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
          .attr("r", initialPinSize) // 初期のサイズ
          .attr("stroke-width", initialBorderThickness) // 初期のボーダー幅

          .attr("fill", "red") // You can change the fill color as needed
          .attr("stroke", "white") // You can change the stroke color as needed
          .attr("stroke-opacity", 0.4) // You can change the stroke color as needed
          .classed("pulse", true); // アニメーションクラスを適用

      }




    });

    if (selectedSightseeingSpot) {
      zoomAndSlideRight([selectedSightseeingSpot.longitude, selectedSightseeingSpot.latitude]);
    }
  }, [sightseeingSpots]);



  useEffect(() => {
    if (
      selectedSightseeingSpot &&
      svgRef.current &&
      projectionRef.current &&
      zoomRef.current
    ) {
      const svg = svgRef.current;
      const projection = projectionRef.current;
      // zoomAndSlideRight関数の呼び出し
      // 必要な変数をrefから取得して使用
      const zoomAndSlideRight = (coordinates) => {
        const [x, y] = projectionRef.current(coordinates);
        const xOffset = 50;

        svgRef.current
          .transition()
          .duration(750)
          .call(
            zoomRef.current.transform,
            d3.zoomIdentity
              .translate(mapWidth / 2, mapHeight / 2)
              .scale(tappedZoomLevel)
              .translate(-x + xOffset, -y)
          );
      };
      const topTenPercentCount = Math.ceil(sightseeingSpots.length * 0.1);
      const topTenPercentSpots = new Set(
        sightseeingSpots.slice(0, topTenPercentCount).map((spot) => spot.id)
      );
      svg
        .selectAll(".sightseeing-spot")

        .attr('fill-opacity', 0.2)
        .attr("stroke", "none");

      // Highlight the selected spot by setting its opacity to 1
      svg
        .selectAll(".sightseeing-spot")
        .filter((d) => d.id === selectedSightseeingSpot.id)
        .classed("selected-pulse", true)
        // .attr("fill", "blue")
        .attr("fill-opacity", 1)
        .attr("stroke", "white")
        .attr("stroke-width", initialBorderThickness)
        // .attr("stroke-opacity", 0.4); 

      zoomAndSlideRight([
        selectedSightseeingSpot.longitude,
        selectedSightseeingSpot.latitude,
      ]);

      if (aroundSightseeingSpotList) {
        // 既存の周辺観光スポットを削除
        svg.selectAll(".around-sightseeing-spot").remove();

        // 新しい周辺観光スポットを追加
        svg
          .selectAll(".around-sightseeing-spot")
          .data(aroundSightseeingSpotList)
          .enter()

          .append("circle")
          .attr("class", "around-sightseeing-spot")
          .attr("cx", (d) => projection([d.longitude, d.latitude])[0])
          .attr("cy", (d) => projection([d.longitude, d.latitude])[1])
          .attr("r", initialPinSize) // 初期のサイズ
          .attr("stroke-width", initialBorderThickness) // 初期のボーダー幅
          .attr("fill", (d) => {
            switch (d.type) {
              case "gourmet":
                return "#F08080"; // 薄い赤色
              case "sightseeing":
                return "#90EE90"; // 薄い緑色
              default:
                return "rgb(255, 165, 0)"; // デフォルトの色
            }
          })
          .attr("stroke", "white"); // You can change the stroke color as needed");
      }
      svg.selectAll(".sightseeing-spot").each(function (d) {
        if (d.id === selectedSightseeingSpot.id) {
          d3.select(this).raise();
        }
      });
    } else {
      const svg = svgRef.current;
      const topTenPercentCount = Math.ceil(sightseeingSpots.length * 0.1);
      const topTenPercentSpots = new Set(
        sightseeingSpots.slice(0, topTenPercentCount).map((spot) => spot.id)
      );
      svg
        .selectAll(".sightseeing-spot")
        .attr("class", (d) => "sightseeing-spot" + (topTenPercentSpots.has(d.id) ? " pulse" : ""))
         .attr("fill", (d) =>
          topTenPercentSpots.has(d.id) ? "gold" : "#00bfff"
        )
        .attr("stroke", "white")
        .attr("stroke-opacity", 1)
        .attr("fill-opacity", 1);
      svg.selectAll(".around-sightseeing-spot").remove();
    }

    const svg = svgRef.current;
    const projection = projectionRef.current;

    //zoomの状態を取得する関数
    const getCurrentZoomState = () => {
      return d3.zoomTransform(svg.node());
    };

    // タグのデザインを追加するための関数
    const addTagDesign = (tooltipGroup, d, tagStyle, yCoordinate) => {
      const textWidth = 50; // タグのテキストの幅（適宜調整）
      const textHeight = 20; // タグのテキストの高さ（適宜調整）

      // タグの背景
      tooltipGroup
        .append("rect")
        .attr("x", 10)
        .attr("y", yCoordinate)
        .attr("width", textWidth)
        .attr("height", textHeight)
        .attr("fill", tagStyle.fill);

      // タグのテキスト
      tooltipGroup
        .append("text")
        .text(tagStyle.text)
        .attr("x", 15) // テキストの位置を少し調整
        .attr("y", yCoordinate + 15) // テキストの位置を調整（背景の中央に配置）
        .attr("class", "tooltip-text");
    };

    //周辺のスポットをタップしたときの処理
    const showTooltip = (d, event) => {
      const coordinates = projection([d.longitude, d.latitude]);
      const zoomState = getCurrentZoomState();

      // 座標をズーム状態に基づいて調整
      const adjustedX = coordinates[0] * zoomState.k + zoomState.x;
      const adjustedY = coordinates[1] * zoomState.k + zoomState.y;

      // 既存の吹き出しを削除
      svg.selectAll(".tooltip").remove();

      // 吹き出し用のグループを作成
      const tooltipGroup = svg
        .append("g")
        .attr("class", "tooltip")
        .attr("transform", `translate(${adjustedX}, ${adjustedY})`);

      // 吹き出しの背景（四角形）
      tooltipGroup
        .append("rect")
        .attr("width", 300) // 幅を調整
        .attr("height", 150) // 高さを調整
        .attr("class", "tooltip-background");

      // 吹き出しのテキスト（スポット名）
      tooltipGroup
        .append("text")
        .text(d.name)
        .attr("x", 10)
        .attr("y", 20)
        .attr("class", "tooltip-text");

      // 画像（条件付きで表示）
      if (d.image_path) {
        tooltipGroup
          .append("image")
          .attr("xlink:href", d.image_path)
          .attr("x", 10)
          .attr("y", 30)
          .attr("width", 100) // 画像の幅
          .attr("height", 100); // 画像の高さ
      }

      // レビューとレビュー件数
      tooltipGroup
        .append("text")
        .text(`レビュー: ${d.rating} (${d.user_ratings_total}件)`)
        .attr("x", 120)
        .attr("y", 90) // Y座標を調整
        .attr("class", "tooltip-text");

      if (d.googlemap_link) {
        tooltipGroup
          .append("text")
          .text("Google Mapで開く")
          .attr("x", 120)
          .attr("y", 110) // Y座標を調整
          .attr("class", "tooltip-text")
          .style("text-decoration", "underline") // 下線を追加
          .style("fill", "blue") // テキストの色を変更
          .on("click", () => window.open(d.googlemap_link, "_blank")); // クリックでリンクを開く
      }

      // タグ
      // タグのスタイルを決定する関数
      const getTagStyle = (type) => {
        switch (type) {
          case "gourmet":
            return { fill: "#F08080", text: "グルメ" }; // 薄い赤色
          case "sightseeing":
            return { fill: "#90EE90", text: "観光地" }; // 薄い緑色
          default:
            return { fill: "none", text: "" };
        }
      };

      const tagStyle = getTagStyle(d.type);

      // タグのデザインを追加
      if (d.type) {
        addTagDesign(tooltipGroup, d, tagStyle, 140); // Y座標を調整
      }
      // ツールチップのグループにイベントリスナーを追加
      tooltipGroup.on("mouseenter", (event) => {
        event.stopPropagation();

      });
      tooltipGroup.on("mouseleave", () => {
        hideTooltip();
      });
    };
    const hideSightseeingSpotTooltip = () => {
      svg.selectAll(".sightseeing-tooltip").remove();
    }

    // ツールチップの表示
    svg
      .selectAll(".around-sightseeing-spot")
      .on("mouseenter", (event, d) => {
        hideSightseeingSpotTooltip();
        showTooltip(d, event);
      })
      .on("mouseleave", () => {
      });

    // 吹き出しを非表示にする関数
    const hideTooltip = () => {
      svg.selectAll(".tooltip").remove();
    };
  }, [selectedSightseeingSpot]);


  return <div ref={ref} className='h-full overflow-hidden'></div>;
}

export default SightseeingMap;
