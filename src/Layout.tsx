import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Layout = () => {
  return (
    <div className="p-6"> 
    <div>
        <Navbar />
      </div>
      <div className="h-[calc(100vh-200px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  )
};
export default Layout;
