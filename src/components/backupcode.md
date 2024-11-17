```js

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
        {typeof sliderValue2 === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hue
            </Typography>
            <Slider
              value={sliderValue2}
              onChange={handleSliderChange2}
              min={0}
              max={1} // Adjust max value based on expected range for 'h'
              step={0.1}
              color="primary"
              aria-labelledby="intensity-slider"
            />
          </Box>
        )}
        {/* Slider for 'h' state, with conditional rendering */}
        {typeof sliderValue3 === 'number' && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Saturation
            </Typography>
            <Slider
              value={sliderValue3}
              onChange={handleSliderChange3}
              min={0}
              max={1} // Adjust max value based on expected range for 'h'
              step={0.1}
              color="primary"
              aria-labelledby="intensity-slider"
            />
          </Box>
        )}
```