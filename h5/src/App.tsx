import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.scss';

import TabLayout from './components/TabLayout';
import HomePage from './pages/Home';
import MallPage from './pages/Mall';
import ActivityPage from './pages/Activity';
import MinePage from './pages/Mine';
import ProductDetailPage from './pages/ProductDetail';
import MerchantDetailPage from './pages/MerchantDetail';
import ActivityDetailPage from './pages/ActivityDetail';
import ParkingPage from './pages/Parking';
import MemberCodePage from './pages/MemberCode';
import PointsLogPage from './pages/PointsLog';
import ConsumptionPage from './pages/Consumption';
import VehiclesPage from './pages/Vehicles';
import CouponsPage from './pages/Coupons';
import FavoritesPage from './pages/Favorites';
import MessagesPage from './pages/Messages';
import SettingsPage from './pages/Settings';
import ParkingRecordsPage from './pages/ParkingRecords';
import LoginPage from './pages/Login';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<TabLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/mall" element={<MallPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/mine" element={<MinePage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/merchant/:id" element={<MerchantDetailPage />} />
        <Route path="/activity-detail/:id" element={<ActivityDetailPage />} />
        <Route path="/parking" element={<ParkingPage />} />
        <Route path="/member-code" element={<MemberCodePage />} />
        <Route path="/points-log" element={<PointsLogPage />} />
        <Route path="/consumption" element={<ConsumptionPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/parking-records" element={<ParkingRecordsPage />} />
      </Routes>
    </HashRouter>
  );
}
