import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <div>
      <NavLink to="/">
        <h1 className="border-i-border-color mb-4">WBS table Testing</h1>
      </NavLink>
      <div className="border-b border-i-border-color">
        <NavLink
          to="/onetable"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Ag-grid One Table Solution
        </NavLink>
        <NavLink
          to="/multi-table"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Ag-grid Multi Table Solution
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Shadcn Table Solution
        </NavLink>
        <NavLink
          to="/enhanced-table"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Enhanced WBS Table
        </NavLink>
 {/*        <NavLink
          to="/demo"
          className={({ isActive }) =>
            (isActive ? 'text-i-primary' : '') +
            ' inline-block p-4 hover:bg-i-hover-color'
          }
        >
          Juan made by AI (claude code)
        </NavLink> */}
      </div>
    </div>
  )
};

export default Navbar;
