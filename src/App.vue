<script lang="ts">
import { reactive } from 'vue';

export default ({
  // onMounted() {
  //   let currentTab = reactive({});
  //   chrome.runtime.sendMessage({type: "POPUP_INIT"}, (tab) => {currentTab = tab} )
  // },
  methods: {
    async getAllGoogleMapUrls() {
      const googleMapsUrlRegex = /^https?\:\/\/(www\.)?google\.[a-z]+\/maps\b/;
      let tabUrls: String[] = [];
      const tabs = await chrome.tabs.query({ currentWindow: true });

      tabs.forEach(tab => {
        if (tab.url && googleMapsUrlRegex.test(tab.url.valueOf())) {
          tabUrls.push(tab.url);
        }
      });

      let result = "";
      tabUrls.forEach((url, index) => {
        if (index === 0) {
          result = `${url.split('@')[0]}`
        }
        else {
          const currentPart = url.split("/dir/")[1].split("@")[0];
          result = `${result}${currentPart}`;
        }
      });
      if(result && result.length)
      {
        chrome.tabs.create({ "url": result });
      }
    }
  }
})
</script>

<template>
  <div style="{width: 500px;}">
    <button @click="getAllGoogleMapUrls">
      Merge google maps tabs!
    </button>
  </div>
</template>
