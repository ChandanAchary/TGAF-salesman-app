import * as Location from 'expo-location';

export const getLocation = async (): Promise<Location.LocationObjectCoords | null> => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    alert('Permission Denied');
    return null;
  }

  try {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return loc.coords;
  } catch (error) {
    alert('Error retrieving location');
    console.error(error);
    return null;
  }
};

// 📍 Distance calculator (Haversine)
export const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getDistanceFast = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const x = ((lon2 - lon1) * Math.PI / 180) * Math.cos((lat1 + lat2) * Math.PI / 360);
  const y = ((lat2 - lat1) * Math.PI / 180);
  return Math.sqrt(x * x + y * y) * R;
};
