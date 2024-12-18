<script setup>
import * as XLSX from "xlsx";
import * as ECharts from "echarts";
import { computed, onMounted, reactive, ref, watchEffect } from "vue";

const chart = ref(null);
let myChart = null;
const excelData = reactive([]);

const options = reactive({
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "cross",
      label: {
        backgroundColor: "#283b56",
      },
    },
    formatter: (params) => {
      let content = `${params[0].axisValue}<br/>`;
      params.forEach((item) => {
        if (item.data === 0 || item.data) {
          content += `<span style="float:left;margin-right:1em;">${item.marker}${item.seriesName}</span><span style="float:right;font-weight:600;">${item.data}</span><br/>`;
        } else {
          content += `<span style="float:left;margin-right:1em;">${item.marker}${item.seriesName}</span><span style="float:right;font-weight:600;">无数据</span><br/>`;
        }
      });
      return content;
    },
  },
  grid: {
    top: "15%",
    left: "5%",
    right: "5%",
    bottom: "18%",
  },
  legend: {
    textStyle: {
      color: "#000000",
    },
    top: "2%", // 垂直居中
    left: "0%",
    orient: "horizontal",
    type: "scroll", // 开启滚动条
  },
  xAxis: {
    type: "category",
    boundaryGap: true,
    axisLine: {
      lineStyle: {
        color: "#000000",
      },
    },
    data: [],
  },
  yAxis: {
    type: "value",
    scale: true,
  },
  series: [],
  dataZoom: [
    {
      type: "slider",
      show: true,
      xAxisIndex: [0],
      start: 0, // 左边起始比例
      end: 100, // 右边结束比例
    },
    {
      type: "inside", // 允许区域选择
      xAxisIndex: [0],
      start: 0,
      end: 100,
    },
  ],
});

const tempOptions = ref("");

const handlerUpdate = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const data1 = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data1, { type: "array" });

    // 读取第一个工作表
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });
    jsonData.forEach((data) => {
      excelData.push(data);
    });

    analysisData();
  };

  reader.readAsArrayBuffer(file);
};

const initChat = () => {
  myChart = ECharts.init(chart.value);
  updateChart();
};

const updateChart = () => {
  myChart.setOption(options);
};

const excelAnalysisData = reactive({
  startTimeList: [],
  lonList: [],
  latList: [],
  stationNameList: [],
});

const queryData = reactive({
  startTimeList: "",
  lonList: "",
  latList: "",
  stationNameList: "",
});

const analysisData = () => {
  /**
    "forecast_time",
    "station_id",
    "start_time",
    "value",
    "ensemble",
    "synthesis",
    "ghi",
    "optimize",
    "measure",
    "lon",
    "lat",
    "station_name"
   */
  const temp = {
    startTimeList: [],
    lonList: [],
    latList: [],
    stationNameList: [],
  };
  excelData.forEach((val, index) => {
    if (index === 0) return;
    temp.startTimeList.push(val[2]);
    temp.lonList.push(val[9]);
    temp.latList.push(val[10]);
    temp.stationNameList.push(val[11]);
  });
  excelAnalysisData.startTimeList = [...new Set(temp.startTimeList)];
  excelAnalysisData.lonList = [...new Set(temp.lonList)];
  excelAnalysisData.latList = [...new Set(temp.latList)];
  excelAnalysisData.stationNameList = [...new Set(temp.stationNameList)];
  // console.log(excelAnalysisData);
};

const reSet = () => {
  options.series = JSON.parse(tempOptions.value);
  updateChart();
};

const filterData = computed(() => {
  const { startTimeList, lonList, latList, stationNameList } = queryData;
  return computed(() => {
    const tempData = excelData.filter((val) => {
      return (
        startTimeList.includes(val[2]) &&
        lonList.includes(val[9]) &&
        latList.includes(val[10]) &&
        stationNameList.includes(val[11])
      );
    });
    return tempData.map((val) => {
      return {
        forecast_time: val[0],
        value: val[3],
        ensemble: val[4],
        synthesis: val[5],
        ghi: val[6],
        optimize: val[7],
        measure: val[8],
      };
    });
  });
});

const onResize = () => {
  myChart.resize();
};

onMounted(() => {
  initChat();
  window.addEventListener("resize", onResize);
});

watchEffect(() => {
  const xData = [];
  const ensemble = [];
  const ghi = [];
  const measure = [];
  const optimize = [];
  const synthesis = [];
  const value = [];
  filterData.value.value.forEach((val) => {
    xData.push(val.forecast_time);
  });
  options.xAxis.data = [...new Set(xData)].sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  options.xAxis.data.forEach((date) => {
    const tempData = filterData.value.value.filter(
      (val) => val.forecast_time === date
    );
    ensemble.push(...tempData.map((item) => item.ensemble));
    ghi.push(...tempData.map((item) => item.ghi));
    measure.push(...tempData.map((item) => item.measure));
    optimize.push(...tempData.map((item) => item.optimize));
    synthesis.push(...tempData.map((item) => item.synthesis));
    value.push(...tempData.map((item) => item.value));
  });
  options.series = [
    {
      name: "ensemble",
      type: "line",
      data: ensemble,
    },
    {
      name: "ghi",
      type: "line",
      data: ghi,
    },
    {
      name: "measure",
      type: "line",
      data: measure,
    },
    {
      name: "optimize",
      type: "line",
      data: optimize,
    },
    {
      name: "synthesis",
      type: "line",
      data: synthesis,
    },
    {
      name: "value",
      type: "line",
      data: value,
    },
  ];
  if (myChart) {
    tempOptions.value = JSON.stringify([...options.series]);
    updateChart();
  }
});
</script>

<template>
  <div class="query">
    <input type="file" @change="handlerUpdate" />
  </div>
  <div class="query">
    <div
      class="query-item"
      v-for="(item, index) in Object.keys(excelAnalysisData)"
      :key="'query' + index"
    >
      <span>{{ item.replace("List", "") }}：</span>
      <el-select v-model="queryData[item]">
        <el-option
          v-for="option in excelAnalysisData[item]"
          :key="option"
          :value="option"
        >
          {{ option }}
        </el-option>
      </el-select>
    </div>
  </div>
  <div class="query">
    <el-button type="primary" @click="reSet">恢复</el-button>
  </div>
  <div id="chart" ref="chart"></div>
</template>

<style scoped>
#chart {
  width: 95%;
  height: 70vh;
  box-sizing: border-box;
  box-shadow: 0 0 5px #aaa;
  margin: 2rem auto;
  border-radius: 1rem;
}

.query {
  width: 95%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  box-shadow: 0 0 5px #ccc;
  margin: 10px auto;
  box-sizing: border-box;
  padding: 1rem;
  border-radius: 1rem;
}

.query-item {
  width: 20%;
  margin: 1rem 0;
}
</style>
