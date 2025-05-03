import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

const Layout = () => {
  return (
    <div className="container relative mx-auto p-6">
      <div className="">
        <Navbar />
      </div>
      <div className="h-[calc(100vh-200px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  )
};
export default Layout;
