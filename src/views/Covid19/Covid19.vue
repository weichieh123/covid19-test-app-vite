<template>
  <div id="covid19">
    <div class="left" :class="{ scroll: storeList.length }">
      <!-- <button @click="test">測試</button> -->
      <div v-if="storeList.length" class="refresh-wrap" @click="refreshData">
        <button class="refresh">
          <img class="refresh-icon" src="@IMG/refresh.svg" alt="refresh" />
        </button>
        <small>資料來源:{{ timeStamp }}</small>
      </div>

      <div class="search">
        <select v-model="selected.city" name="selectedCity" id="selectedCity">
          <option :value="''" disabled selected>選擇縣市</option>
          <option
            v-for="(option, index) in options.city"
            :value="option.name"
            :key="index"
          >
            {{ option.name }}
          </option>
        </select>
        <select v-model="selected.dist" name="selectedDist" id="selectedDist">
          <option :value="''" disabled selected>選擇區域</option>
          <option
            v-for="(option, index) in options.dist"
            :value="option.name"
            :key="index"
          >
            {{ option.name }}
          </option>
        </select>
        <button @click="updateMap">搜尋快篩試劑</button>
      </div>

      <p v-if="!storeList.length">暫無資料</p>
      <div
        v-if="storeList"
        class="store-list"
        :class="{ scroll: storeList.length }"
      >
        <Covid19Item
          v-for="(store, index) in storeList"
          :key="index"
          :index="index"
          :store="store"
          @popup="clickToPopup(index)"
        />
      </div>
    </div>
    <div class="right">
      <div id="map"></div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import L from "leaflet";
import Covid19Item from "./Covid19Item.vue";
import cityDistOptions from "@/store/city_districts.js";
import { downloadFileFcn } from "@/store/covid19-test.js";
import { reactive, ref, watch, onMounted, getCurrentInstance  } from "vue";
const { proxy } : any = getCurrentInstance()

let openStreetMap = {};
const timeStamp = ref("");
const resFile = ref("");
const storeList = ref("");
const options = reactive({
  city: cityDistOptions, //城市選項資料
  dist: "", //區域選項資料
});
const selected = reactive({
  city: "", //所選之城市
  dist: "", //所選之區域
});

onMounted(() => {
  openStreetMap = L.map("map", {
    center: [24.755292, 121.7495626],
    zoom: 14, //縮放比例
  });
  L.tileLayer("https://{s}.tile.openStreetMap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openStreetMap.org/">openStreetMap</a> contributors',
    maxZoom: 20,
  }).addTo(openStreetMap);
  // 自動載入資料
  downloadFile();
});

function test() {
  selected.city = "新北市";
  selected.dist = "中和區";
}

function getNowTime() {
  const today = new Date();
  const date =
    today.getFullYear() + "/" + today.getMonth() + 1 + "/" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  timeStamp.value = date + " " + time;
}

function downloadFile() {
  // 下載資料，存至resFile
  downloadFileFcn()
    .then((res) => {
      if (!res) {return};

      let blob = res.data;
      let reader = new FileReader();
      reader.readAsDataURL(blob);
      /* 下載檔案
          reader.onload = (e) => {
            let a = document.createElement('a');
            a.download = 'data.csv';
            a.href = e.target.result;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          };
          */
      proxy.$papa.parse(blob, {
        download: true,
        header: true,
        complete: (res) => {
          // console.log(res.data);
          resFile.value = res.data;
        },
      });
      getNowTime();
    })
    .catch((error) => {
      console.log(error);
    });
}

function refreshData() {
  // 重新下載資料並更新地圖
  downloadFile();
  updateMap();
}

function updateMap() {
  // clear markers
  openStreetMap.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      openStreetMap.removeLayer(layer);
    }
  });

  storeList.value = resFile.value.filter((obj) => {
    // 篩選縣市及區域
    if (!obj["醫事機構地址"]) return;
    let cityLen = selected.city.length;
    let distLen = selected.dist.length;
    if (
      obj["醫事機構地址"].slice(0, cityLen) === selected.city &&
      obj["醫事機構地址"].slice(cityLen, cityLen + distLen) === selected.dist
    ) {
      return obj;
    }
  });

  // 更新地圖原點，以storeList第一筆站牌之經緯度為中心
  if (!storeList.value.length) return;
  openStreetMap.panTo(
    new L.LatLng(storeList.value[0]["緯度"], storeList.value[0]["經度"])
  );
  storeList.value.forEach((store) => {
    L.marker([store["緯度"], store["經度"]])
      .addTo(openStreetMap)
      .bindPopup(
        `<h3><strong>${store["醫事機構名稱"]}</strong></h3>
            <strong>${store["醫事機構地址"]}</strong></br>
            <strong style=" color: #3687f0;">廠牌項目：${store["廠牌項目"]}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${store["快篩試劑截至目前結餘存貨數量"]}</strong>
          <hr>
          <p>備註:${store["備註"]}</p>
          `
      );
  });
  let LatLng = L.latLng(storeList.value[0]["緯度"], storeList.value[0]["經度"]);
  L.popup()
    .setLatLng(LatLng)
    .setContent(
      `<h3><strong>${storeList.value[0]["醫事機構名稱"]}</strong></h3>
          <strong>${storeList.value[0]["醫事機構地址"]}</strong></br>
          <strong style=" color: #3687f0;">廠牌項目：${storeList.value[0]["廠牌項目"]}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${storeList.value[0]["快篩試劑截至目前結餘存貨數量"]}</strong>
          <hr>
          <p>備註:${storeList.value[0]["備註"]}</p>
          `
    )
    .openOn(openStreetMap);
}

function clickToPopup(index) {
  storeList.value.forEach((obj) => (obj.isActive = false));
  storeList.value[index].isActive = true;
  let LatLng = L.latLng(
    storeList.value[index]["緯度"],
    storeList.value[index]["經度"]
  );
  L.popup()
    .setLatLng(LatLng)
    .setContent(
      `<h3><strong>${storeList.value[index]["醫事機構名稱"]}</strong></h3>
          <strong>${storeList.value[index]["醫事機構地址"]}</strong></br>
          <strong style=" color: #3687f0;">廠牌項目：${storeList.value[index]["廠牌項目"]}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${storeList.value[index]["快篩試劑截至目前結餘存貨數量"]}</strong>
          <hr>
          <p>備註:${storeList.value[index]["備註"]}</p>
          `
    )
    .openOn(openStreetMap);
}

watch(selected, (newVal) => {
if (newVal.city) {
          options.city.filter((obj) => {
            if (obj.name === selected.city) {
              // console.log(obj.districts);
              options.dist = obj.districts;
              return obj.districts;
            }
          });
        }
})


</script>
