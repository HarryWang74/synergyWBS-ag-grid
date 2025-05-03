import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <div>
      <NavLink to="/">
        <h1 className="border-i-border-color mb-4">AG-GRID Testing</h1>
      </NavLink>
      <div className="border-b border-i-border-color">
        <NavLink
          to="/"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Multi Table Solution
        </NavLink>
        <NavLink
          to="/one-table"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          One Table Solution
        </NavLink>
      </div>
    </div>
  )
};

export default Navbar;
