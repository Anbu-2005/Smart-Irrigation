import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';

const { height } = Dimensions.get('window'); // Get screen height

export default function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const WEATHER_API_KEY = '6bc920c2dc86f2fa1600c00cbd3fae5b';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
      fetchWeather(userLocation.coords.latitude, userLocation.coords.longitude);
    })();
  }, []);

  const fetchWeather = async (latitude, longitude) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      setWeather(weatherResponse.data);

      const locationResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
      );
      setLocationName(locationResponse.data.name);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const rainDetails = forecastResponse.data.list.find(item => item.rain);

      setWeather(prevWeather => ({
        ...prevWeather,
        rainDetails: rainDetails ? rainDetails.rain['3h'] : null
      }));
    } catch (error) {
      console.error('Failed to fetch weather data:', error.response ? error.response.data : error.message);
      setErrorMsg('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'data:image/jpeg;base64,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' }} // Replace with your actual logo URI
            style={styles.logo}
          />
          <Text style={styles.greetingText}>
            <Text style={styles.userName}>AI BASED IRRIGATION PLANNER</Text>
          </Text>
          <Image 
            source={{ uri: 'https://example.com/profile-pic.jpg' }} 
            style={styles.profileImage} 
          />
        </View>

        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>
            {weather?.weather[0].description} - {weather?.main.temp}°C
          </Text>
          <Text style={styles.weatherDetail}>Humidity: {weather?.main.humidity}%</Text>
          <Text style={styles.weatherDetail}>Wind Speed: {weather?.wind.speed} m/s</Text>
          <FontAwesome5 name="cloud-sun" size={48} color="black" />
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>{locationName}</Text>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Latitude: {location?.latitude?.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location?.longitude?.toFixed(6)}
          </Text>
        </View>

        <View style={styles.rainNotification}>
          <Text style={styles.notificationText}>Watering skipped</Text>
          <Text style={styles.weatherText}>It's raining</Text>
          {weather?.rainDetails ? (
            <Text style={styles.rainDetails}>Rain in next 3 hours: {weather.rainDetails} mm</Text>
          ) : (
            <Text style={styles.rainDetails}>No significant rain expected</Text>
          )}
          <TouchableOpacity>
            <Text style={styles.runAnyway}>RUN ANYWAY</Text>
          </TouchableOpacity>
          <FontAwesome5 name="cloud-showers-heavy" size={48} color="black" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    height: height * 0.15, // 15% of screen height
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 24,
    color: '#000',
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  weatherContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    height: height * 0.2, // 20% of screen height
  },
  weatherText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weatherDetail: {
    fontSize: 16,
    marginTop: 5,
    color: '#666',
  },
  locationContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    height: height * 0.15, // 15% of screen height
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rainNotification: {
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    height: height * 0.25, // 25% of screen height
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
  },
  rainDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  runAnyway: {
    color: '#E63946',
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
