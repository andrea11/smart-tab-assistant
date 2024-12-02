// Check https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
export const keepAlive = (() => {
  let intervalId: number | undefined
  return (state: boolean) => {
    if (state && !intervalId) {
      if (performance.now() > 20e3) {
        chrome.runtime.getPlatformInfo()
      }
      intervalId = setInterval(chrome.runtime.getPlatformInfo, 20e3)
    } else if (!state && intervalId) {
      clearInterval(intervalId)
      intervalId = undefined
    }
  }
})()
