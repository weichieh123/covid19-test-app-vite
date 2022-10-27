<template>
  <div id="covid19">
    <div class="left" :class="{ scroll: this.storeList.length }">
      <!-- <button @click="test">測試</button> -->
      <div v-if="storeList.length" class="refresh-wrap" @click="refreshData">
        <button class="refresh">
          <img class="refresh-icon" :src="refresh" alt="refresh" />
        </button>
        <small>資料來源:{{ timeStamp }}</small>
      </div>

      <div class="search">
        <select v-model="selectedCity" name="selectedCity" id="selectedCity">
          <option :value="''" disabled selected>選擇縣市</option>
          <option
            v-for="(option, index) in cityOptions"
            :value="option.name"
            :key="index"
          >
            {{ option.name }}
          </option>
        </select>
        <select v-model="selectedDist" name="selectedDist" id="selectedDist">
          <option :value="''" disabled selected>選擇區域</option>
          <option
            v-for="(option, index) in distOptions"
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
        :class="{ scroll: this.storeList.length }"
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

<script>
import L from 'leaflet';
import Covid19Item from './Covid19Item.vue';
import cityDistOptions from '@/store/city_districts.js';
import { downloadFile } from '@/store/covid19-test';
import refresh from '@/assets/refresh.svg';

let openStreetMap = {};

export default {
  name: 'Covid19',
  components: {
    Covid19Item,
  },
  data() {
    return {
      timeStamp: '', //時間戳記
      resFile: '', //快篩資料
      storeList: '', //所選縣市區域之快篩資料

      selectedCity: '', //所選之城市
      selectedDist: '', //所選之區域
      cityOptions: cityDistOptions, //城市選項資料
      distOptions: '', //區域選項資料
      refresh: refresh, //refresh svg
    };
  },
  mounted() {
    openStreetMap = L.map('map', {
      center: [24.755292, 121.7495626],
      zoom: 14, //縮放比例
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 20,
    }).addTo(openStreetMap);
    // 自動載入資料
    this.downloadFile();
  },
  watch: {
    selectedCity: {
      handler: function () {
        if (this.selectedCity) {
          this.cityOptions.filter((obj) => {
            if (obj.name === this.selectedCity) {
              // console.log(obj.districts);
              this.distOptions = obj.districts;
              return obj.districts;
            }
          });
        }
      },
    },
  },
  methods: {
    test() {
      this.selectedCity = '新北市';
      this.selectedDist = '中和區';
    },
    getNowTime() {
      const today = new Date();
      const date =
        today.getFullYear() +
        '/' +
        today.getMonth() +
        1 +
        '/' +
        today.getDate();
      const time =
        today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      this.timeStamp = date + ' ' + time;
    },
    downloadFile() {
      // 下載資料，存至resFile
      downloadFile()
        .then((res) => {
          if (!res) return;

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
          this.$papa.parse(blob, {
            download: true,
            header: true,
            complete: (res) => {
              // console.log(res.data);
              this.resFile = res.data;
            },
          });
          this.getNowTime();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    refreshData() {
      // 重新下載資料並更新地圖
      this.downloadFile();
      this.updateMap();
    },
    updateMap() {
      // clear markers
      openStreetMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          openStreetMap.removeLayer(layer);
        }
      });

      this.storeList = this.resFile.filter((obj) => {
        // 篩選縣市及區域
        if (!obj['醫事機構地址']) return;
        let cityLen = this.selectedCity.length;
        let distLen = this.selectedDist.length;
        if (
          obj['醫事機構地址'].slice(0, cityLen) === this.selectedCity &&
          obj['醫事機構地址'].slice(cityLen, cityLen + distLen) ===
            this.selectedDist
        ) {
          return obj;
        }
      });
      // console.log('storeList:', this.storeList);

      // 更新地圖原點，以storeList第一筆站牌之經緯度為中心
      if (!this.storeList.length) return;
      openStreetMap.panTo(
        new L.LatLng(this.storeList[0]['緯度'], this.storeList[0]['經度'])
      );
      this.storeList.forEach((store) => {
        L.marker([store['緯度'], store['經度']])
          .addTo(openStreetMap)
          .bindPopup(
            `<h3><strong>${store['醫事機構名稱']}</strong></h3>
            <strong>${store['醫事機構地址']}</strong></br>
            <strong style=" color: #3687f0;">廠牌項目：${store['廠牌項目']}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${store['快篩試劑截至目前結餘存貨數量']}</strong>
          <hr>
          <p>備註:${store['備註']}</p>
          `
          );
      });
      let LatLng = L.latLng(
        this.storeList[0]['緯度'],
        this.storeList[0]['經度']
      );
      L.popup()
        .setLatLng(LatLng)
        .setContent(
          `<h3><strong>${this.storeList[0]['醫事機構名稱']}</strong></h3>
          <strong>${this.storeList[0]['醫事機構地址']}</strong></br>
          <strong style=" color: #3687f0;">廠牌項目：${this.storeList[0]['廠牌項目']}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${this.storeList[0]['快篩試劑截至目前結餘存貨數量']}</strong>
          <hr>
          <p>備註:${this.storeList[0]['備註']}</p>
          `
        )
        .openOn(openStreetMap);
    },
    clickToPopup(index) {
      this.storeList.forEach(obj => obj.isActive = false);
      this.storeList[index].isActive = true;
      let LatLng = L.latLng(
        this.storeList[index]['緯度'],
        this.storeList[index]['經度']
      );
      L.popup()
        .setLatLng(LatLng)
        .setContent(
          `<h3><strong>${this.storeList[index]['醫事機構名稱']}</strong></h3>
          <strong>${this.storeList[index]['醫事機構地址']}</strong></br>
          <strong style=" color: #3687f0;">廠牌項目：${this.storeList[index]['廠牌項目']}</strong></br>
          <strong style=" color: #3687f0;">快篩試劑庫存：${this.storeList[index]['快篩試劑截至目前結餘存貨數量']}</strong>
          <hr>
          <p>備註:${this.storeList[index]['備註']}</p>
          `
        )
        .openOn(openStreetMap);
    },
  },
};
</script>
