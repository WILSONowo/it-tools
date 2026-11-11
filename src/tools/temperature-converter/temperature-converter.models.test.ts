import { describe, expect, it } from 'vitest';
import {
  convertCelsiusToKelvin,
  convertFahrenheitToKelvin,
  convertKelvinToCelsius,
  convertKelvinToFahrenheit,
  roundTemperature,
} from './temperature-converter.models';

describe('temperature-converter', () => {
  it('rounds instead of truncating', () => {
    expect(roundTemperature(convertKelvinToFahrenheit(convertCelsiusToKelvin(37)))).toBe(98.6);
    expect(roundTemperature(convertKelvinToFahrenheit(convertCelsiusToKelvin(-40)))).toBe(-40);
    expect(roundTemperature(convertKelvinToCelsius(convertFahrenheitToKelvin(98.6)))).toBe(37);
    expect(roundTemperature(convertCelsiusToKelvin(0))).toBe(273.15);
    expect(roundTemperature(1.005)).toBe(1);
    expect(roundTemperature(1.006)).toBe(1.01);
  });
});
