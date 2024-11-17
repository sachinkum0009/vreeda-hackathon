import { DeviceRequestModel, DeviceResponseModel } from '@/types/vreedaApi';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Slider, Switch, TextField, Typography } from '@mui/material';
import { count } from 'console';
import { set } from 'mongoose';
import { useState } from 'react';
import { analyze, guess } from 'web-audio-beat-detector';

export default function DeviceControl({ id, model, selected, onSelectionChange}: { id: string, model: DeviceResponseModel, selected: boolean, onSelectionChange: (id: string, selected: boolean) => void }) {
  const [isOn, setIsOn] = useState(model.states?.on?.value);
  const [sliderValue, setSliderValue] = useState(model.states?.v?.value || 0);
  const [sliderValue2, setSliderValue2] = useState(model.states?.h?.value || 0);
  const [sliderValue3, setSliderValue3] = useState(model.states?.s?.value || 0);
  const [sliderValue4, setSliderValue4] = useState(5);
  const [sliderValue5, setSliderValue5] = useState(1);
  const [sliderValue6, setSliderValue6] = useState(2);
  const [sliderValue7, setSliderValue7] = useState(model.states?.s?.value || 0);

  const [weatherValue, setWeatherValue] = useState(0);
  const [weaterName, setWeatherName] = useState('');
  const [stockValue, setStockValue] = useState(0);
  const [stockName, setStockName] = useState('');

  const [countdown, setCountdown] = useState(sliderValue4 * 60); // Initial countdown in seconds

  const [sunsetTime, setSunsetTime] = useState('');
  const [sunriseTime, setSunriseTime] = useState('');

  const [times, setTimes] = useState(sliderValue6 || 0);

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [bpmTimer, setBpmTimer] = useState<NodeJS.Timeout | null>(null);

  const [bpm, setBpm] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const threshold = 0.1;

  const [radiationValue, setRadiationValue] = useState(0);

  // Define variables
  let audioContext: AudioContext, audioBuffer: AudioBuffer, audioSourceNode: AudioBufferSourceNode, analyserNode: AnalyserNode;
  

  async function updateDevice(deviceId: string, request: DeviceRequestModel) {
    try {
      const response = await fetch('/api/vreeda/patch-device', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, request }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update device');
      }
  
      const data = await response.json();
      console.log('Device updated successfully:', data);
      return data;
    } catch (error) {
      console.log('Error updating device:', error);
      throw error;
    }
  }

  const toggleDevice = async () => {
    try {
      await updateDevice(id, {
        states: { on: !isOn },
      });
      setIsOn(!isOn);
    } catch (error) {
      console.log('Failed to update device state:', error);
    }
  };

  const handleSliderChange = async (event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    // const newValue2 = Array.isArray(value) ? value[0] : value;
    setSliderValue(newValue);
    // setSliderValue2(newValue2);

    try {
      await updateDevice(id, { states: { v: newValue, program: "color"} });
    } catch (error) {
      console.log('Failed to update slider value:', error);
    }
  };

  // const startTimer = () => {
  //   console.log('Timer started');
  //   // Implement the timer logic here
  // let timer: NodeJS.Timeout;

  const startTimer = async () => {
  const _sunsetTime = await getSunriseSunset();
  // await getSunriseSunset();

  console.log("done");
  let remainingTime = sliderValue4 * 60; // Initial countdown in seconds

  const newTimer = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime -= 1;
      setCountdown(remainingTime);
    } else {
      console.log('Interval completed. Starting break.');
      clearInterval(newTimer);
      setTimer(null);
      startBreakTimer(); // Start the break timer
    }
  }, 1000); // Update every second

  setTimer(newTimer);

  console.log('Timer started');
  const currentTime = new Date().toLocaleTimeString();
  console.log('Current Time:', currentTime);
  console.log('Sunset Time:', _sunsetTime);
  
  const currentTimeNumber = new Date().getHours() * 60 + new Date().getMinutes();
  const sunsetTimeParts = _sunsetTime.split(':');
  console.log('Sunset Time Parts:', sunsetTimeParts);
  let sunsetTimeNumber = parseInt(sunsetTimeParts[0]) * 60 + parseInt(sunsetTimeParts[1]);

  console.log('Current Time Number:', currentTimeNumber);
  console.log('Sunset Time Number:', sunsetTimeNumber);
  if (_sunsetTime.includes('PM')) {
    console.log('Sunset time is in the PM');
    sunsetTimeNumber += 12 * 60;
  }
  if (currentTimeNumber < sunsetTimeNumber) {
    console.log('Current time less then sunsettime');
    updateLightLowRed();
  }
  else {
    updateLightRed();
    console.log('Current time greater then sunsettime');

  }
};



const startBreakTimer = () => {
  const interval = sliderValue4 * 60 * 1000; // Convert minutes to milliseconds
  const breakTime = sliderValue5 * 60 * 1000; // Convert minutes to milliseconds

  let remainingTime = sliderValue5 * 60; // Initial countdown in seconds

  const newTimer = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime -= 1;
      setCountdown(remainingTime);
    } else {
      console.log('Break Interval completed.');
      clearInterval(newTimer);
      setTimer(null);
      setTimes(times - 1);
      console.log('Times remaining:', times);
      if (times > 0) {
        startTimer(); // Start the break
      }
      else {
        console.log('All intervals completed.');
        setCountdown(0);
      }
    }
  }, 1000); // Update every second

  setTimer(newTimer);

  console.log('Timer started');
  updateLightGreen();
};

const stopTimer = () => {
  if (timer) {
    clearInterval(timer);
    setTimer(null);
    updateLightGreen();
    console.log('Timer stopped');
  }
};

const updateBrightness = async (brightnes: number) => {
  try {
    await updateDevice(id, { states: { v: brightnes} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateHue = async () => {
  try {
    const val = Math.random();
    console.log("hue value is", val);
    await updateDevice(id, { states: { h: val} });
  
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightGreen = async () => {
  try {
    await updateDevice(id, { states: { h: 0.3, s: 1.0, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightLowGreen = async () => {
  try {
    await updateDevice(id, { states: { h: 0.3, s: 1.0, v: 0.2} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightPurple = async () => {
  try {
    await updateDevice(id, { states: { h: 0.7, s: 1.0, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightOrange = async () => {
  try {
    await updateDevice(id, { states: { h: 0.1, s: 0.9, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightYellow = async () => {
  try {
    await updateDevice(id, { states: { h: 0.3, s: 1.0, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightWhite = async () => {
  try {
    await updateDevice(id, { states: { h: 0.5, s: 0.5, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightRed = async () => {
  try {
    await updateDevice(id, { states: { h: 0.0, s: 1.0, v: 1.0} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightLowRed = async () => {
  try {
    await updateDevice(id, { states: { h: 0.0, s: 1.0, v: 0.2} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

const updateLightViolet = async () => {
  try {
    await updateDevice(id, { states: { h: 0.6, s: 1.0, v: 0.9} });
  } catch (error) {
    console.log('Failed to update slider value:', error);
  }
};

  const handleSliderChange2 = async (event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    // const newValue2 = Array.isArray(value) ? value[0] : value;
    setSliderValue2(newValue);
    // setSliderValue2(newValue2);

    try {
      await updateDevice(id, { states: { h: newValue } });
    } catch (error) {
      console.log('Failed to update slider value:', error);
    }
  };

  const handleSliderChange3 = async (event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value;
    // const newValue2 = Array.isArray(value) ? value[0] : value;
    setSliderValue3(newValue);
    // setSliderValue2(newValue2);

    try {
      await updateDevice(id, { states: { s: newValue } });
    } catch (error) {
      console.log('Failed to update slider value:', error);
    }
  };

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    onSelectionChange(id, isChecked);
  };

  // Setup function for analyzing and playing the audio
  interface Beat {
    time: number;
  }

  function calculateRMS(dataArray: Float32Array) {
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
        sumSquares += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sumSquares / dataArray.length);
};



  async function startBpmTimer(audioBuffer: AudioBuffer, analyserNode: AnalyserNode) {
    let remainingTime = audioBuffer.duration-1; // Initial countdown in seconds
    let i = 0;
    let beatAnalysis = 0;
  
    const newBpmTimer = setInterval(async () => {
      if (remainingTime > 0) {
        remainingTime -= 1;
        // setCountdown(remainingTime);
        try {
        beatAnalysis = await analyze(audioBuffer, i, i + 1);
        }
        catch (error) {
          console.log('Error analyzing beats:', error);
        }
        finally {
          console.log('Beat analysis completed');
          beatAnalysis = 100;
        }
        console.log("beat diff is", bpm - beatAnalysis);
        if (Math.abs(bpm - beatAnalysis) > threshold) {
          console.log('updating hue');
          updateHue();
        }
        setBpm(beatAnalysis);
        console.log('BPM:', beatAnalysis, 'bpm', bpm);
        i++;
        // Print the results

        const floatDataArray = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(floatDataArray);
    const amplitude = calculateRMS(floatDataArray);
    console.log("amplitude", amplitude); // Amplitude of the
    updateBrightness(amplitude);

      } else {
        console.log('Interval audio completed');
        clearInterval(newBpmTimer);
        setTimer(null);
      }
    }, 1000); // Update every second
  
    setBpmTimer(newBpmTimer);
  };

  async function analyzeAndPlayAudio(file: File): Promise<void> {
    
    // Create a new AudioContext
    audioContext = new (window.AudioContext)();

    // Load the audio file
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    console.log('audio duration', audioBuffer.duration);

    // Analyze the audio data for beats
    // for (let i = 0; i < 20; i++) {
    //   let beatAnalysis = await analyze(audioBuffer, i, i + 1);
    //   // Print the results
    //   console.log('BPM:', beatAnalysis);
    // }

    // const beatAnalysis = await analyze(audioBuffer, 5, 10);
    // // Print the results
    // console.log('BPM:', beatAnalysis);

    // for (let i = 0; i < 20; i++) {
    //   const offset = await guess(audioBuffer);
    //   console.log('bpm:', offset.bpm, 'offset:', offset.offset);
    // }

    // Create an analyser node
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    
    // Set up the audio source and connect to the audio context
    audioSourceNode = audioContext.createBufferSource();
    audioSourceNode.buffer = audioBuffer;

    startBpmTimer(audioBuffer, analyserNode);

    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyserNode.getByteFrequencyData(dataArray);
    console.log("data array", dataArray); // Array of frequency values (0-255)
// Function to analyze audio and log frequency data
// function analyzeAudio() {
//   requestAnimationFrame(analyzeAudio);
// }

// audioElement.onplay = () => {
//   audioContext.resume();
//   analyzeAudio();
// };


    // Analyze the beats of the audio

    analyze(audioBuffer).then(beats => {


      console.log("Detected beats:", beats);

    });

    audioSourceNode.connect(analyserNode);
    analyserNode.connect(audioContext.destination);
    
    // Start playing the audio
    audioSourceNode.start(0);

    // Set up the beat detector
    // analyze(audioBuffer).then((tempo) => {
    //   console.log("Detected tempo:", tempo);
    //   // console.log("Detected beats:", beats);
    //   // visualizeBeats(beats);
    // });

    // Analyze the audio's beats
    // analyze()
    // analyze(audioBuffer: AudioBuffer, audioContext: AudioContext).then((beats: Beat[]) => {
    //   console.log("Detected beats:", beats);
    //   visualizeBeats(beats);
    // });
  }

  // Function to visualize beats (could be expanded to show beat markers on screen)
  function visualizeBeats(beats : Beat[]) {
    // For now, just log the beat times to the console
    beats.forEach(beat => {
      console.log(`Beat detected at: ${beat.time} seconds`);
    });
  }

  const callWeatherApi = async () => {
    try {
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=41.38879&lon=2.15899&appid=56a90db569d6bd0504282b7f7de88da9');
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=51.514244&lon=7.468429&appid=56a90db569d6bd0504282b7f7de88da9');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      // setWeatherValue(data.main.temp);
      console.log('Weather data:', data);
    setWeatherValue(data.main.temp);
    setWeatherName(data.weather[0].main);
    console.log(`Temperature: ${data.main.temp}K`);
    console.log(`Weather: ${data.weather[0].main}`);
    console.log(`Weather:`, data.weather[0]);
    console.log(`Humidity: ${data.main.humidity}%`);
    console.log(`Wind Speed: ${data.wind.speed}m/s`);
    console.log("weather name", weaterName);
    if (data.weather[0].main === 'Rain') {
      console.log('It is raining');
      updateLightViolet();
    }
    else if (data.weather[0].main === 'Clear') {
      console.log('It is clear');
      updateLightOrange();
    }
    else if (data.weather[0].main === 'Clouds') {
      console.log('It is cloudy');
      updateLightPurple();
    }
    else if (data.weather[0].main === 'Sun') {
      console.log('It is sunny');
      updateLightYellow();
    }
    else {
      console.log('No weather data');
    }


    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  const callRadiationApi = async () => {
    try {
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=41.38879&lon=2.15899&appid=56a90db569d6bd0504282b7f7de88da9');
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=51.514244&lon=7.468429&appid=56a90db569d6bd0504282b7f7de88da9');
      // N7koSu0kkZswV7Ka_KShfCc6aW0Qqobi
      const response = await fetch('https://api.solcast.com.au/data/forecast/radiation_and_weather?latitude=-33.86882&longitude=151.209295&api_key=N7koSu0kkZswV7Ka_KShfCc6aW0Qqobi');
      // https://api.solcast.com.au/data/forecast/radiation_and_weather?latitude=-33.865143&longitude=151.209900&hours=24&period=PT30M&api_key=N7koSu0kkZswV7Ka_KShfCc6aW0Qqobi&output_parameters=air_temp,dni,ghi&format=json
//       CURL *curl;
// CURLcode res;
// curl = curl_easy_init();
// if(curl) {
//   curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "GET");
//   curl_easy_setopt(curl, CURLOPT_URL, "https://api.solcast.com.au/data/forecast/radiation_and_weather?latitude=-33.865143&longitude=151.209900&hours=24&period=PT30M&output_parameters=air_temp,dni,ghi&format=json");
//   curl_easy_setopt(curl, CURLOPT_FOLLOWLOCATION, 1L);
//   curl_easy_setopt(curl, CURLOPT_DEFAULT_PROTOCOL, "https");
//   struct curl_slist *headers = NULL;
//   curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
//   res = curl_easy_perform(curl);
// }
// curl_easy_cleanup(curl);



    //   var requestOptions = {
    //     method: 'GET',
    //     redirect: 'follow'
    //   };


    // fetch("https://api.solcast.com.au/data/forecast/radiation_and_weather?latitude=-33.865143&longitude=151.209900&hours=24&period=PT30M&output_parameters=air_temp,dni,ghi&format=json", requestOptions)
    //   .then(response => response.text())
    //   .then(result => console.log(result))
    //   .catch(error => console.log('error', error));
      // const url = 'https://solcast.p.rapidapi.com/radiation/forecasts?format=json&latitude=51.514244&longitude=7.468429';
      // const options = {
      //   method: 'GET',
      //   headers: {
      //     'x-rapidapi-key': '98ca527dcemshc69c054c69c9641p12f1d0jsna82d6289019b',
      //     'x-rapidapi-host': 'solcast.p.rapidapi.com'
      //   }
      // };
      // const response = await fetch(url, options)
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      console.log('Radiation data:', data);
      // setWeatherValue(data.main.temp);

    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  const callWeatherApiDubai = async () => {
    try {
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=41.38879&lon=2.15899&appid=56a90db569d6bd0504282b7f7de88da9');
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=25.276987&lon=55.296249&appid=56a90db569d6bd0504282b7f7de88da9');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      // setWeatherValue(data.main.temp);
      console.log('Weather data:', data);
    setWeatherValue(data.main.temp);
    setWeatherName(data.weather[0].main);
    console.log(`Temperature: ${data.main.temp}K`);
    console.log(`Weather: ${data.weather[0].main}`);
    console.log(`Weather:`, data.weather[0]);
    console.log(`Humidity: ${data.main.humidity}%`);
    console.log(`Wind Speed: ${data.wind.speed}m/s`);
    console.log("weather name", weaterName);
    if (data.weather[0].main === 'Rain') {
      console.log('It is raining');
      updateLightViolet();
    }
    else if (data.weather[0].main === 'Clear') {
      console.log('It is clear');
      updateLightOrange();
    }
    else if (data.weather[0].main === 'Clouds') {
      console.log('It is cloudy');
      updateLightPurple();
    }
    else if (data.weather[0].main === 'Sun') {
      console.log('It is sunny');
      updateLightYellow();
    }
    else {
      console.log('No weather data');
      updateLightWhite();
    }


    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }


  const callWeatherApiSurgut = async () => {
    try {
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=41.38879&lon=2.15899&appid=56a90db569d6bd0504282b7f7de88da9');
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=61.25757&lon=73.41775&appid=56a90db569d6bd0504282b7f7de88da9');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      // setWeatherValue(data.main.temp);
      console.log('Weather data:', data);
    setWeatherValue(data.main.temp);
    setWeatherName(data.weather[0].main);
    console.log(`Temperature: ${data.main.temp}K`);
    console.log(`Weather: ${data.weather[0].main}`);
    console.log(`Weather:`, data.weather[0]);
    console.log(`Humidity: ${data.main.humidity}%`);
    console.log(`Wind Speed: ${data.wind.speed}m/s`);
    console.log("weather name", weaterName);
    if (data.weather[0].main === 'Rain') {
      console.log('It is raining');
      updateLightViolet();
    }
    else if (data.weather[0].main === 'Clear') {
      console.log('It is clear');
      updateLightOrange();
    }
    else if (data.weather[0].main === 'Clouds') {
      console.log('It is cloudy');
      updateLightPurple();
    }
    else if (data.weather[0].main === 'Sun') {
      console.log('It is sunny');
      updateLightYellow();
    }
    else if (data.weather[0].main === 'Snow') {
      console.log('It is snowing');
      updateLightWhite();
    }
    else {
      console.log('No weather data');
      updateLightWhite();
    }


    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }


  const callStockApi = async () => {
    try {
      // const fetch = require('node-fetch');

//       const url = 'https://yahoo-finance15.p.rapidapi.com/api/v1/markets/options/most-active?type=STOCKS';
// const options = {
//   method: 'GET',
//   headers: {
//     'x-rapidapi-key': '98ca527dcemshc69c054c69c9641p12f1d0jsna82d6289019b',
//     'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
//   }
// };

// const stockName = 'AAPL'; // Replace with the desired stock name or ticker symbol
const url = `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/options/most-active?type=STOCKS&search=${stockName}`;
const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '98ca527dcemshc69c054c69c9641p12f1d0jsna82d6289019b', // Replace with your RapidAPI key
    'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
  }
};



try {
	const response = await fetch(url, options);
	const result = await response.json();
	console.log(result);
  console.log('stock to found', stockName);

  result.body.forEach((stock: any) => {

    console.log(stock.symbolName);
    if (stock.symbolName === stockName) {
      console.log('Stock found');
      // setStockValue(stock.lastPrice);
      // setStockName(stock.symbolName);
      // console.log(`Stock: ${stock.symbolName}`);
      console.log(`Price: ${stock.priceChange}`);

      if (stock.priceChange > 0) {
        console.log('Stock is up');
        if (Math.abs(stock.priceChange) > 0.3) {
        updateLightGreen();
        }
        else {
          updateLightLowGreen();
        }
      }
      else if (stock.priceChange < 0) {
        console.log('Stock is down');
        if (Math.abs(stock.priceChange) > 0.3) {
          updateLightRed();
        }
        else {
          updateLightLowRed();
        }
      }
      else {
        console.log('Stock is stable');
        updateLightWhite();
      }
    }
  }); // Log the stock data

  // console.log(`Temperature: ${result.main.temp}K`);


} catch (error) {
	console.error(error);
}


    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  const getSunriseSunset = async (): Promise<string> =>  {
    try {
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=41.38879&lon=2.15899&appid=56a90db569d6bd0504282b7f7de88da9');
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=51.514244&lon=7.468429&appid=56a90db569d6bd0504282b7f7de88da9');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      // setWeatherValue(data.main.temp);
      console.log('Weather data:', data);

      console.log(`Sunrise: ${data.sys.sunrise}`);
      console.log(`Sunset: ${data.sys.sunset}`);

      const sunriseDate = new Date(data.sys.sunrise * 1000);
      const sunriseTime = sunriseDate.toLocaleTimeString();
      console.log(`Sunrise Time: ${sunriseTime}`);

      const sunsetDate = new Date(data.sys.sunset * 1000);
      const sunsetTime = sunsetDate.toLocaleTimeString();
      console.log('setSunsetTime: ', sunsetTime);
      setSunsetTime(sunsetTime);
      console.log('setSunriseTime: ', sunriseTime);
      setSunriseTime(sunriseTime);
      console.log(`Sunset Time: ${sunsetTime}`);

      return sunsetTime;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }



  const callWeatherApiBarcelona = async () => {
    try {
      const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=51.50853&lon=-0.12574&appid=56a90db569d6bd0504282b7f7de88da9');
      // const response = await fetch('https://api.openweathermap.org/data/2.5/weather?lat=51.514244&lon=7.468429&appid=56a90db569d6bd0504282b7f7de88da9');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      const data = await response.json();
      // setWeatherValue(data.main.temp);
      console.log('Weather data:', data);
    setWeatherValue(data.main.temp);
    setWeatherName(data.weather[0].main);
    console.log(`Temperature: ${data.main.temp}K`);
    console.log(`Weather: ${data.weather[0].main}`);
    console.log(`Weather:`, data.weather[0]);
    console.log(`Humidity: ${data.main.humidity}%`);
    console.log(`Wind Speed: ${data.wind.speed}m/s`);
    console.log("weather name", weaterName);
    if (data.weather[0].main === 'Rain') {
      console.log('It is raining');
      updateLightViolet();
    }
    else if (data.weather[0].main === 'Clear') {
      console.log('It is clear');
      updateLightOrange();
    }
    else if (data.weather[0].main === 'Clouds') {
      console.log('It is cloudy');
      updateLightPurple();
    }
    else if (data.weather[0].main === 'Sun') {
      console.log('It is sunny');
      updateLightYellow();
    }
    else {
      console.log('No weather data');
    }


    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 2, backgroundColor: '#2A1D24' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Selection Checkbox */}
          <FormControlLabel
              control={
                <Checkbox
                  checked={selected}
                  onChange={handleSelectionChange}
                  color="primary"
                />
              }
              label=""
              sx={{ mr: 1 }}
            />
          <Typography variant="h6">
            {model.tags?.customDeviceName || 'Unnamed Device'}
          </Typography>
          {/* Switch positioned at top-right corner */}
          <FormControlLabel
            control={
              <Switch
                checked={isOn || false}
                onChange={toggleDevice}
                color="primary"
                disabled={!model.connected?.value}
              />
            }
            label=""
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Device ID: {id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {model.connected?.value ? 'Online' : 'Offline'}
        </Typography>

        {/* Slider Add here*/}

        {/* Slider for 'v' state, with conditional rendering */}
        {typeof sliderValue === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Brightness
            </Typography>
            <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              min={0}
              max={1} // Adjust max value based on expected range for 'v'
              step={0.1}
              color="primary"
              aria-labelledby="intensity-slider"
            />
          </Box>
        )}

        

        {/* Slider for 'h' state, with conditional rendering */}
        {/* {typeof sliderValue4 === 'number' && (
            <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pomodoro Timer
            </Typography>
            <Typography variant="h4" color="text.primary"></Typography>
              {Math.floor(sliderValue3 * 60)}:{Math.floor((sliderValue3 * 60) % 60).toString().padStart(2, '0')}
            </Typography>
            <Slider
              value={sliderValue3}
              onChange={handleSliderChange3}
              min={0}
              max={1} // Adjust max value based on expected range for 'h'
              step={0.01}
              color="primary"
              aria-labelledby="pomodoro-slider"
            />
            </Box>
        )} */}

        {typeof sliderValue4 === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Pomodoro
            </Typography>

            <TextField
              label="Interval (mins)"
              type="number"
              value={sliderValue4}
              onChange={(e) => setSliderValue4(Number(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Break (mins)"
              type="number"
              value={sliderValue5}
              onChange={(e) => setSliderValue5(Number(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Times (how many times)"
              type="number"
              value={sliderValue6}
              onChange={(e) => setSliderValue6(Number(e.target.value))}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              margin="normal"
            />

            

            <Box display="flex" justifyContent="space-between" mt={2}>
                <button 
                onClick={startTimer} 
                style={{ 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  textAlign: 'center', 
                  textDecoration: 'none', 
                  display: 'inline-block', 
                  fontSize: '16px', 
                  margin: '4px 2px', 
                  cursor: 'pointer', 
                  borderRadius: '4px' 
                }}
                >
                Start
                </button>
                <button 
                onClick={stopTimer} 
                style={{ 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  textAlign: 'center', 
                  textDecoration: 'none', 
                  display: 'inline-block', 
                  fontSize: '16px', 
                  margin: '4px 2px', 
                  cursor: 'pointer', 
                  borderRadius: '4px' 
                }}
                >
                Stop
                </button>
            </Box>

            <Typography variant="h1" color="text.primary">
                <Box display="flex" justifyContent="center" alignItems="center" bgcolor="#333" color="#fff" p={1} borderRadius={1}>
                <Typography variant="h2" color="inherit">
                    <Typography variant="h3" color="inherit">
                      {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                    </Typography>
                </Typography>
                </Box>
            </Typography>
          </Box>
        )}


        {/* Slider for 'h' state, with conditional rendering */}
        {typeof sliderValue7 === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="white" gutterBottom align="center" fontWeight="bold" fontSize={30}>
              LED Beats
            </Typography>
            {/* <audio controls></audio>
              <source src="path_to_your_audio_file.mp3" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio> */}
            <Box mt={2} p={2} bgcolor="#1e1e1e" borderRadius={1}>
              {/* <Typography variant="body2" color="text.secondary" gutterBottom>
              LED Beats
              </Typography> */}
              {/* <audio controls style={{ width: '100%' }}>
              <source src="music/Ilahi.mp3" type="audio/wav" />
              Your browser does not support the audio element.
              </audio> */}
                <Box display="flex" flexDirection="column" alignItems="center">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      console.log("Analyzing audio file:", e.target.files[0]);
                      setAudioFile(e.target.files[0]);
                    }
                  }}
                  style={{ marginBottom: '10px' }}
                />
                <Box display="flex" justifyContent="space-between" width="100%">
                  <button 
                  onClick={async () => {
                    if (audioFile) {
                    await analyzeAndPlayAudio(audioFile);
                    }
                  }} 
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    borderRadius: '4px' 
                  }}
                  >
                  Play
                  </button>

                  <button 
                  onClick={() => {
                    // if (audioContext && audioSourceNode) {
                    audioSourceNode.stop();
                    audioSourceNode.disconnect();
                    audioContext.close();
                    console.log('Audio stopped');
                    // }
                    // else {
                    //   console.log('No audio to stop');
                    // }
                  }} 
                  style={{ 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    borderRadius: '4px' 
                  }}
                  >
                  Stop
                  </button>
                </Box>
                </Box>
              

            </Box>

            
          </Box>



          
        )}

        {/* Slider for 'h' state, with conditional rendering */}
        {/* {typeof radiationValue === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Saturation
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <button 
                onClick={callRadiationApi} 
                style={{ 
                  backgroundColor: '#f44336', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  textAlign: 'center', 
                  textDecoration: 'none', 
                  display: 'inline-block', 
                  fontSize: '16px', 
                  margin: '4px 2px', 
                  cursor: 'pointer', 
                  borderRadius: '4px' 
                }}
              >
                Radiation
              </button>
            </Box>
          </Box>
        )} */}
        


        <Box mt={2} height={300}></Box>

        {/* Slider for 'h' state, with conditional rendering */}
        {typeof weatherValue === 'number' && (
            <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Weather API
            </Typography>
            <Box display="flex" justifyContent="center" mt={2}>
              <button 
              onClick={callWeatherApi} 
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                textAlign: 'center', 
                textDecoration: 'none', 
                display: 'inline-block', 
                fontSize: '16px', 
                margin: '4px 2px', 
                cursor: 'pointer', 
                borderRadius: '4px' 
              }}
              >
              Check Weather in Dortmund
              </button>

              
              </Box>

              <Box display="flex" justifyContent="center" mt={2}>
                <button 
                  onClick={callWeatherApiBarcelona} 
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    borderRadius: '4px' 
                  }}
                >
                  Check Weather in London
                </button>
              </Box>

              <Box display="flex" justifyContent="center" mt={2}>
                <button 
                  onClick={callWeatherApiDubai} 
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    borderRadius: '4px' 
                  }}
                >
                  Check Weather in Dubai
                </button>
              </Box>

              <Box display="flex" justifyContent="center" mt={2}>
                <button 
                  onClick={callWeatherApiSurgut} 
                  style={{ 
                    backgroundColor: '#4CAF50', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px 20px', 
                    textAlign: 'center', 
                    textDecoration: 'none', 
                    display: 'inline-block', 
                    fontSize: '16px', 
                    margin: '4px 2px', 
                    cursor: 'pointer', 
                    borderRadius: '4px' 
                  }}
                >
                  Check Weather in Surgut
                </button>
              </Box>
            </Box>
        )}




        {/* Slider for 'h' state, with conditional rendering */}
        {typeof weatherValue === 'number' && (
            <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Stock Prediction
            </Typography>
            

              <Box display="flex" justifyContent="center" mt={2}>
                <TextField
                  select
                  label="Select Stock"
                  value={stockName}
                  onChange={(e) => setStockName(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                  margin="normal"
                >
                  <option value="Nvidia Corp">Nvidia Corp</option>
                  <option value="Tesla Inc">Tesla Inc</option>
                  <option value="Palantir Technologies Inc Cl A">Palantir Technologies Inc Cl A</option>
                  <option value="Amazon.com Inc">Amazon.com Inc</option>
                  <option value="Super Micro Computer">Super Micro Computer</option>
                  <option value="Apple Inc">Apple Inc</option>
                  <option value="Adv Micro Devices">Adv Micro Devices</option>
                  <option value="Meta Platforms Inc">Meta Platforms Inc</option>
                  <option value="Pfizer Inc">Pfizer Inc</option>
                  <option value="Microstrategy Cl A">Microstrategy Cl A</option>
                  <option value="Coinbase Global Inc Cl A">Coinbase Global Inc Cl A</option>
                  <option value="Microsoft Corp">Microsoft Corp</option>
                  <option value="Alibaba Group Holding ADR">Alibaba Group Holding ADR</option>
                  <option value="Walt Disney Company">Walt Disney Company</option>
                  <option value="Gamestop Corp">Gamestop Corp</option>
                  <option value="Sofi Technologies Inc">Sofi Technologies Inc</option>
                  <option value="Mara Holdings Inc">Mara Holdings Inc</option>
                  <option value="Rivian Automotive Inc Cl A">Rivian Automotive Inc Cl A</option>
                  <option value="Alphabet Cl A">Alphabet Cl A</option>
                  <option value="Boeing Company">Boeing Company</option>
                </TextField>
              </Box>

              <Box display="flex" justifyContent="center" mt={2}>
              <button 
              onClick={callStockApi} 
              style={{ 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                textAlign: 'center', 
                textDecoration: 'none', 
                display: 'inline-block', 
                fontSize: '16px', 
                margin: '4px 2px', 
                cursor: 'pointer', 
                borderRadius: '4px' 
              }}
              >
              Check Stock Prediction
              </button>

              
              </Box>

            </Box>
        )}
        



      </CardContent>
    </Card>
  );
}