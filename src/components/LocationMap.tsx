import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    lat: number;
    lng: number;
    zoom: number;
    address?: string;
    className?: string;
}

function MapUpdater({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

const LocationMap: React.FC<MapProps> = React.memo(({ lat, lng, zoom, address, className }) => {
    const centerLat = isNaN(lat) ? -23.55052 : lat;
    const centerLng = isNaN(lng) ? -46.633308 : lng;
    const mapZoom = isNaN(zoom) ? 15 : zoom;

    return (
        <MapContainer 
            center={[centerLat, centerLng]} 
            zoom={mapZoom} 
            scrollWheelZoom={false} 
            className={`w-full h-full rounded-xl z-0 ${className || ''}`}
            style={{ minHeight: '300px', height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[centerLat, centerLng]}>
                <Popup>
                    <div className="text-sm font-sans">
                        <strong>{address || "Nossa Localização"}</strong>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${centerLat},${centerLng}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 font-medium flex items-center gap-1"
                            >
                                Obter Rotas →
                            </a>
                        </div>
                    </div>
                </Popup>
            </Marker>
            <MapUpdater lat={centerLat} lng={centerLng} zoom={mapZoom} />
        </MapContainer>
    );
});

export default LocationMap;
