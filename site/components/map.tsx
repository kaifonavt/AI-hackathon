'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

interface MapProps {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  isEditable?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export default function MapComponent({ 
  latitude, 
  longitude, 
  address, 
  onLocationChange,
  isEditable = false 
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setError("Google Maps API key is missing");
        setLoading(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        setError("Failed to load Google Maps");
        setLoading(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();

    return () => {
      // Cleanup
      if (map) {
        // @ts-ignore
        window.google?.maps?.event?.clearInstanceListeners(map);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [{ "color": "#242f3e" }]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#242f3e" }]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#746855" }]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{ "color": "#38414e" }]
        },
        {
          "featureType": "road",
          "elementType": "geometry.stroke",
          "stylers": [{ "color": "#212a37" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9ca5b3" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#17263c" }]
        }
      ],
      disableDefaultUI: !isEditable,
      scrollwheel: isEditable,
      zoomControl: isEditable,
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    const newMarker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: newMap,
      draggable: isEditable,
      animation: window.google.maps.Animation.DROP,
    });
    setMarker(newMarker);

    if (isEditable) {
      // Add click handler for map
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat();
        const lng = e.latLng?.lng();
        if (lat && lng) {
          newMarker.setPosition({ lat, lng });
          updateAddress(lat, lng);
        }
      });

      // Add drag end handler for marker
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          updateAddress(position.lat(), position.lng());
        }
      });
    }

    setLoading(false);
  };

  const updateAddress = async (lat: number, lng: number) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      
      if (response.results[0]) {
        const newAddress = response.results[0].formatted_address;
        onLocationChange?.(lat, lng, newAddress);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useEffect(() => {
    if (map && marker) {
      const newPosition = { lat: latitude, lng: longitude };
      map.setCenter(newPosition);
      marker.setPosition(newPosition);
    }
  }, [latitude, longitude]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-purple-900/30 rounded-lg border border-purple-500/20">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-purple-900/30 rounded-lg border border-purple-500/20">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
}