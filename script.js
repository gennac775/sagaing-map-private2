

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhYzhmZTU2ZS1iNzMwLTQyODgtYTljZC1mYmQ5M2YwMDI1N2IiLCJpZCI6MTQ1MTY1LCJpYXQiOjE3NDUwMTUxMjh9.SAqgoTgJUxVgVUWx0HJaADF_VwTF-mGxEX6fJ9R08eY";

const viewer = new Cesium.Viewer("cesiumContainer", {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  baseLayerPicker: true,
  animation: false,
  timeline: false
});


viewer.infoBox.viewModel.showInfo = false;

// MapTiler 背景（通常地図）
const mapTilerLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=8B7W0XUgwh1FuZ52mC45",
    credit: "© MapTiler",
    maximumLevel: 20
  })
);

// 🌐 MapTiler 衛星レイヤー（初期は非表示）
const satelliteLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=8B7W0XUgwh1FuZ52mC45",
    credit: "© MapTiler Satellite"
  })
);
satelliteLayer.show = false;

// 🗺 OSM レイヤー（初期は非表示）
const osmLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    credit: "© OpenStreetMap contributors"
  })
);
osmLayer.show = false;

// 🛰 Esri World Imagery レイヤー（初期は非表示）
// 🛰 Esri World Imagery レイヤー（初期は非表示）
const esriLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    credit: "© Esri, Maxar, Earthstar Geographics"
  })
);
esriLayer.show = false;


// 🔁 背景レイヤーの切り替え関数
function setBaseLayer(type) {
  console.log(`📌 Base layer changed to: ${type}`); 
mapTilerLayer.show = (type === 'maptiler');
  satelliteLayer.show = (type === 'satellite');
  osmLayer.show = (type === 'osm');
 esriLayer.show = (type === 'esri'); 
}


window.setBaseLayer = setBaseLayer;





// OSMなど非表示（任意）
viewer.imageryLayers.get(0).show = false;

// 📌 Sagaing地区表示と面積
Cesium.GeoJsonDataSource.load("sagaing.geojson", {
  stroke: Cesium.Color.RED,
  fill: Cesium.Color.GREEN.withAlpha(0.5),
  strokeWidth: 2,
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  viewer.zoomTo(ds);

  fetch("sagaing.geojson")
    .then(res => res.json())
    .then(geojson => {
      const area = turf.area(geojson);
      const km2 = (area / 1e6).toFixed(2);
      const div = document.createElement("div");
      div.style = "position:absolute;top:60px;right:10px;padding:5px 10px;background:rgba(0,0,0,0.6);color:#fff;font-family:monospace;font-size:14px;border-radius:6px;z-index:999";
      div.textContent = `面積: ${km2} km²`;
      document.body.appendChild(div);
    });
});

// 村ラベル表示（距離条件あり）
Cesium.GeoJsonDataSource.load("villages.geojson", {
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  const entities = ds.entities.values;
  for (const entity of entities) {
    entity.billboard = entity.polygon = entity.polyline = entity.model = entity.box = undefined;
    const name = entity.properties?.name || entity.properties?.["name:en"];
    if (name) {
      entity.point = new Cesium.PointGraphics({
        color: Cesium.Color.RED,
        pixelSize: 6
      });
      entity.label = new Cesium.LabelGraphics({
        text: name,
        font: "12px sans-serif",
        fillColor: Cesium.Color.YELLOW,
        showBackground: false,
        scale: 0.6,
        pixelOffset: new Cesium.Cartesian2(0, -20),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 30000.0)
      });
    }
  }
});

// 道路（太く黄色）
Cesium.GeoJsonDataSource.load("roads-secondary.geojson", {
  stroke: Cesium.Color.YELLOW,
  strokeWidth: 3.0,
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  console.log("🚗 道路表示完了");
});

// ピン表示
const pinPoints = [
  { name: "Point 1", lon: 94.415642, lat: 21.888104 },
  { name: "Point 2", lon: 94.954042, lat: 21.833454 },
  { name: "Point 3", lon: 95.049816, lat: 21.836400 },
  { name: "Point 4", lon: 95.167866, lat: 21.802034 },
  { name: "Point 5", lon: 95.421483, lat: 21.733356 },
  { name: "Point 6", lon: 95.422475, lat: 21.734859 },
  { name: "Point 7", lon: 95.764116, lat: 21.907802 },
  { name: "Point 8", lon: 95.996792, lat: 21.867923 },
  { name: "Point 9", lon: 96.001610, lat: 21.874352 },
  { name: "Point10", lon: 95.964277, lat: 22.583494 },
  { name: "Point11", lon: 95.973726, lat: 22.886289 }
];

for (const point of pinPoints) {
  viewer.entities.add({
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 20),
    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    },
    label: {
      text: point.name,
      font: "14px sans-serif",
      fillColor: Cesium.Color.YELLOW,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -12),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 500000.0)
    }
  });
}

// 📍 緯度経度表示（マウス移動）
const coordsDiv = document.createElement('div');
coordsDiv.style = "position:absolute;bottom:10px;right:10px;padding:5px 10px;background:rgba(0,0,0,0.6);color:#fff;font-family:monospace;font-size:14px;border-radius:6px;z-index:999";
coordsDiv.textContent = "Lon: ---, Lat: ---";
document.body.appendChild(coordsDiv);

const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
moveHandler.setInputAction(movement => {
  const c = viewer.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
  if (c) {
    const g = Cesium.Cartographic.fromCartesian(c);
    coordsDiv.textContent = `Lon: ${Cesium.Math.toDegrees(g.longitude).toFixed(6)}, Lat: ${Cesium.Math.toDegrees(g.latitude).toFixed(6)}`;
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

// 🟢 カメラ高度表示
const heightDiv = document.createElement('div');
heightDiv.style = "position:absolute;bottom:40px;right:10px;padding:5px 10px;background:rgba(0,0,0,0.6);color:#fff;font-family:monospace;font-size:14px;border-radius:6px;z-index:999";
document.body.appendChild(heightDiv);
viewer.scene.postRender.addEventListener(() => {
  heightDiv.textContent = `高度: ${viewer.camera.positionCartographic.height.toFixed(1)} m`;
});



// ✅ クリック座標表示（コピペできるボックス）
const clickBox = document.createElement("pre");
clickBox.style = `
  position: absolute;
  top: 80px;
  right: 10px;
  padding: 6px 12px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  font-family: monospace;
  font-size: 14px;
  border-radius: 6px;
  white-space: pre-wrap;
  user-select: text;
  z-index: 999;
`;
clickBox.textContent = "📍 クリック位置:\nLon: ---, Lat: ---";
document.body.appendChild(clickBox);

const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
clickHandler.setInputAction(movement => {
  const cartesian = viewer.scene.camera.pickEllipsoid(
    movement.position,
    viewer.scene.globe.ellipsoid
  );
  if (cartesian) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
    const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
    clickBox.textContent = `📍 クリック位置:\nLon: ${lon}\nLat: ${lat}`;
    console.log(`📍 Clicked:\nLon: ${lon}, Lat: ${lat}`);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// 🛣 封鎖ルートA（道なり・改）
Cesium.GeoJsonDataSource.load("blockade-route-a-updated.geojson", {
  stroke: Cesium.Color.RED,
  strokeWidth: 5.0,
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  console.log("🛣 封鎖ルートA（道なり・改）を表示しました！");
});

// ✅ ラベルを封鎖ルートAの中間地点に表示（クリックしなくても見える）
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(95.0, 21.79), // ← 必要に応じて微調整OK
  label: {
    text: "封鎖ルートA（道なり）",
    font: "14px sans-serif",  // ← Arialなどに変えてもOK
    fillColor: Cesium.Color.RED,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    pixelOffset: new Cesium.Cartesian2(0, -20),
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 500000.0)
  }
});

// ✅ 封鎖ルートB（道なり）の読み込みと表示
Cesium.GeoJsonDataSource.load("blockade-route-b-curved.geojson", {
  stroke: Cesium.Color.RED,
  strokeWidth: 4,
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  console.log("🚧 封鎖ルートB（道なり）を表示しました");
});

// ✅ 封鎖ルートB（道なり）のラベル表示
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(95.035, 21.795), // 適宜調整ください
  label: {
    text: "封鎖ルートB（道なり）",
    font: "14px sans-serif",
    fillColor: Cesium.Color.RED,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 500000.0)
  }
});

// InfoBox を無効化（クリックで吹き出し出さない）
viewer.infoBox.viewModel.showInfo = false;

Cesium.GeoJsonDataSource.load('pagodas.geojson', {
  clampToGround: true
}).then(function (dataSource) {
  viewer.dataSources.add(dataSource);

  const entities = dataSource.entities.values;
  console.log(`📍 パゴダを ${entities.length} 件 読み込みました！`);

  if (entities.length === 0) {
    console.warn("⚠️ パゴダデータが 0 件でした！GeoJSON が空かも");
    return;
  }

  for (const entity of entities) {
    const name =
      entity.properties?.name ||
      entity.properties?.["name:en"] ||
      entity.properties?.["name:my"] ||
      "Pagoda";

    // 👇 clampToGround が効かないことがあるため height: 0 を明示
    entity.point = new Cesium.PointGraphics({
      color: Cesium.Color.YELLOW,
      pixelSize: 14,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    });

    entity.label = new Cesium.LabelGraphics({
      text: name,
      font: "15px sans-serif",
      fillColor: Cesium.Color.SIENNA,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 16),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 1e6)
    });
  }

  // 📸 カメラをやや引きの距離で自動ズーム
//  viewer.zoomTo(dataSource, {
 //   offset: new Cesium.HeadingPitchRange(
  //    Cesium.Math.toRadians(0),    // 正面方向
 //     Cesium.Math.toRadians(-25),  // 少し見下ろす
 //     40000                        // 高さ
//    )
//  }).then(() => {
//    console.log("✅ パゴダにズームしました（再調整）");
//  });

}).catch(function (error) {
  console.error("❌ パゴダGeoJSON読み込みエラー:", error);
});


// ✅ GeoJSONで範囲を可視化（planet_extent.geojson）
Cesium.GeoJsonDataSource.load("planet_extent.geojson", {
  stroke: Cesium.Color.CYAN,
  fill: Cesium.Color.CYAN.withAlpha(0.4),
  strokeWidth: 2,
  clampToGround: true
}).then((ds) => {
  viewer.dataSources.add(ds);
  console.log("✅ Planet範囲を表示しました");
});


// ✅ Planet画像（planet_overlay.jpg）を確実に読み込んで表示
const img = new Image();
img.onload = () => {
  console.log("🟢 Planet画像 読み込み成功！");

  const imageMaterial = new Cesium.ImageMaterialProperty({
    image: img,
    transparent: true
  });

console.log("🛰️ Planet overlay bounds:", [
  94.60293, 23.00196,
  96.50027, 23.00196,
  96.50027, 22.09182,
  94.60293, 22.09182
]);


  const planetOverlay = viewer.entities.add({
    name: "Planet Image Overlay",
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray([
        94.60293, 23.00196,  // 左上
        96.50027, 23.00196,  // 右上
        96.50027, 22.09182,  // 右下
        94.60293, 22.09182   // 左下
      ]),
      material: imageMaterial,
      height: 0,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });

  planetOverlay.show = false;

  // ✅ トグルボタン（表示切り替え）
  const planetButton = document.createElement("button");
  planetButton.textContent = "🛰️ Planet 画像";
  planetButton.style = "position:absolute; top:10px; left:400px; z-index:999;";
  document.body.appendChild(planetButton);

  let isPlanetVisible = false;
  planetButton.onclick = () => {
    isPlanetVisible = !isPlanetVisible;
    planetOverlay.show = isPlanetVisible;
    planetButton.textContent = isPlanetVisible ? "✅ Planet 表示中" : "🛰️ Planet 画像";
  };
};

// ✅ MapTiler画像の表示トグルボタン
const maptilerButton = document.createElement("button");
maptilerButton.textContent = "🗺️ MapTiler 地図";
maptilerButton.style = "position:absolute; top:10px; left:100px; z-index:999;";
document.body.appendChild(maptilerButton);

let isMaptilerVisible = true;  // 初期表示中なので true
maptilerButton.onclick = () => {
  isMaptilerVisible = !isMaptilerVisible;
  mapTilerLayer.show = isMaptilerVisible;
  maptilerButton.textContent = isMaptilerVisible ? "✅ MapTiler 表示中" : "🗺️ MapTiler 地図";
};

// ✅ OSM画像の表示トグルボタン
const osmButton = document.createElement("button");
osmButton.textContent = "🧭 OSM 画像";
osmButton.style = "position:absolute; top:10px; left:200px; z-index:999;";
document.body.appendChild(osmButton);

let isOsmVisible = false;
osmButton.onclick = () => {
  isOsmVisible = !isOsmVisible;
  osmLayer.show = isOsmVisible;
  osmButton.textContent = isOsmVisible ? "✅ OSM 表示中" : "🧭 OSM 画像";
};
	

// ✅ Esri画像の表示トグルボタン
const esriButton = document.createElement("button");
esriButton.textContent = "🗺️ Esri 画像";
esriButton.style = "position:absolute; top:10px; left:300px; z-index:999;";
document.body.appendChild(esriButton);

let isEsriVisible = false;
esriButton.onclick = () => {
  isEsriVisible = !isEsriVisible;
  esriLayer.show = isEsriVisible;
  esriButton.textContent = isEsriVisible ? "✅ Esri 表示中" : "🗺️ Esri 画像";
};


// ✅ 読み込みをスタート
img.src = "planet_overlay.jpg";


// ✅ 1. 衛星画像 (10300110D824A00-visual.tif) を貼る
const rectangle = Cesium.Rectangle.fromDegrees(
  95.9534, // 西（左）
  21.8521, // 南（下）
  96.0015, // 東（右）
  21.9018  // 北（上）
);

viewer.entities.add({
  name: "Maxar Satellite Image",
  rectangle: {
    coordinates: rectangle,
    material: "./10300110D824A00-visual.tif", // ←ファイルパスはローカル or サーバー配置場所に合わせて！
    height: 0,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  }
});

// ✅ 2. Point 8とPoint 9をピンとラベルで表示
const points = [
  { name: "Point 8", lon: 95.996792, lat: 21.867923 },
  { name: "Point 9", lon: 96.001610, lat: 21.874352 }
];

for (const point of points) {
  viewer.entities.add({
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 20),
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2
    },
    label: {
      text: point.name,
      font: "14px sans-serif",
      fillColor: Cesium.Color.YELLOW,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      outlineWidth: 2,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -20)
    }
  });
}

// ✅ 初期表示カメラ位置を合わせる
viewer.camera.flyTo({
  destination: rectangle,
  duration: 2.0
});

// ✅ Maxar衛星画像（エクスポート版）を貼り付け

console.log("📌 Rectangle bounds:", 95.9494, 21.8553, 96.0017, 21.9042);

const exportedRectangle = Cesium.Rectangle.fromDegrees(
  95.9534, // 左 (西)
  21.8521, // 下 (南)
  96.0015, // 右 (東)
  21.9018  // 上 (北)
);

viewer.entities.add({
  name: "Maxar Exported Image",
  rectangle: {
    coordinates: exportedRectangle,
    material: "./1030010110B24A00-visual-small.tif",
    height: 0,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  }
});

// ✅ カメラをその範囲に飛ばす（オプション）
viewer.camera.flyTo({
  destination: exportedRectangle,
  duration: 2.0
});

// ✅ 新しい Maxar GeoTIFF 画像を地球上に貼り付ける
const maxarRectangle = Cesium.Rectangle.fromDegrees(
  95.9494,  // 左（西）
  21.8553,  // 下（南）
  96.0017,  // 右（東）
  21.9042   // 上（北）
);

viewer.entities.add({
  name: "Maxar Satellite Image (Warped)",
  rectangle: {
    coordinates: maxarRectangle,
    material: "https://osint-nacmoe-2.netlify.app/1030010110B24A00_visual_warped_ok.tif",

    height: 0,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
  }
});

// ✅ 表示位置にカメラ移動
viewer.camera.flyTo({
  destination: maxarRectangle,
  duration: 2.0
});

// ✅ 初期表示で MapTiler（通常地図）を表示
setBaseLayer('maptiler');

